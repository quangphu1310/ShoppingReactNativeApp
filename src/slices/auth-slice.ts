import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  AuthErrorMessage,
  AuthUser,
  GetCurrentUserResponse,
  LoginRequest,
  LoginSuccessResponse,
} from '../models/auth';
import { RootState } from '../reducers/root-reducer';
import { apiService } from '../services/api-service';
import { ProfileRepository } from '../services/storage/profile-repository';
import { TokenService } from '../services/storage/token-service';
import { getApiErrorMessage } from '../utils/api-error';

interface AuthState {
  token: string | null;
  currentUser: AuthUser | null;
  loading: boolean;
  error: AuthErrorMessage | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
}

const initialState: AuthState = {
  token: null,
  currentUser: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  isBootstrapping: true,
};

const clearLocalSessionData = async (): Promise<void> => {
  const [clearTokenResult, clearProfileResult] = await Promise.allSettled([
    TokenService.clearToken(),
    ProfileRepository.clearProfile(),
  ]);

  if (clearTokenResult.status === 'rejected' || !clearTokenResult.value) {
    throw new Error('Failed to clear auth token from local storage.');
  }

  if (clearProfileResult.status === 'rejected') {
    throw clearProfileResult.reason;
  }
};



const mapAuthThunkError = (
  error: unknown,
  context?: 'login' | 'logout' | 'bootstrap',
): AuthErrorMessage => {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    const apiErrorMessage = getApiErrorMessage(error.response?.data);

    if (statusCode === 401 || statusCode === 403) {
      return {
        type: 'api',
        message: 'Unauthorized. Please login again.',
      };
    }

    if (statusCode === 400) {
      return {
        type: 'api',
        message: apiErrorMessage ?? 'Invalid request.',
      };
    }

    if (statusCode && statusCode >= 500) {
      return {
        type: 'api',
        message: 'Server error. Please try again later.',
      };
    }

    if (error.message === 'Network Error') {
      return {
        type: 'network',
        message:
          context === 'logout'
            ? 'Network error. Local session cleared anyway.'
            : 'Cannot reach API. Check your internet connection.',
      };
    }

    return {
      type: 'network',
      message: apiErrorMessage ?? error.message ?? 'Network error.',
    };
  }

  if (error instanceof Error) {
    if (
      error.message.includes('Failed to clear') ||
      error.message.includes('storage')
    ) {
      return {
        type: 'storage',
        message: error.message,
      };
    }

    return {
      type: 'storage',
      message: error.message,
    };
  }

  return {
    type: 'api',
    message: 'An unexpected error occurred.',
  };
};

export const loginUser = createAsyncThunk<
  LoginSuccessResponse['data'],
  LoginRequest,
  { rejectValue: AuthErrorMessage }
>('auth/loginUser', async (payload, { rejectWithValue }) => {
  try {
    const result = await apiService.login(payload);

    if (!result.status) {
      return rejectWithValue({
        type: 'api',
        message: result.error.message,
      });
    }

    const persisted = await TokenService.saveToken(result.data.token);
    if (!persisted) {
      return rejectWithValue({
        type: 'storage',
        message: 'Failed to persist auth token.',
      });
    }

    return result.data;
  } catch (error) {
    return rejectWithValue(mapAuthThunkError(error, 'login'));
  }
});

export const getCurrentUser = createAsyncThunk<
  AuthUser,
  string,
  { rejectValue: AuthErrorMessage }
>('auth/getCurrentUser', async (token, { dispatch, rejectWithValue }) => {
  try {
    const result: GetCurrentUserResponse = await apiService.getCurrentUser(
      token,
    );

    if (!result.status) {
      const errorMessage =
        getApiErrorMessage(result) ?? 'Failed to fetch profile.';
      return rejectWithValue({
        type: 'api',
        message: errorMessage,
      });
    }

    await ProfileRepository.upsertProfile(result.data);
    return result.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;

      if (statusCode === 401 || statusCode === 403) {
        try {
          await clearLocalSessionData();
        } catch (storageError) {
          console.error(
            'Failed to clear local session after auth error:',
            storageError,
          );
        }

        dispatch(logout());
      }
    }

    return rejectWithValue(mapAuthThunkError(error, 'bootstrap'));
  }
});

export const logoutUser = createAsyncThunk<
  void,
  void,
  { rejectValue: AuthErrorMessage }
>('auth/logoutUser', async (_, { dispatch, getState, rejectWithValue }) => {
  const token = (getState() as RootState).auth.token;
  let remoteLogoutError: AuthErrorMessage | null = null;

  try {
    if (token) {
      try {
        const result = await apiService.logout(token);

        if (!result.status) {
          const apiMessage = getApiErrorMessage(result);
          if (apiMessage) {
            remoteLogoutError = {
              type: 'api',
              message: apiMessage,
            };
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const statusCode = error.response?.status;

          // Ignore 401/403 - user is already logged out on backend
          if (statusCode !== 401 && statusCode !== 403) {
            remoteLogoutError = mapAuthThunkError(error, 'logout');
          }
        } else if (error instanceof Error) {
          remoteLogoutError = {
            type: 'api',
            message: error.message,
          };
        }
      }
    }

    await clearLocalSessionData();
    dispatch(logout());

    // If there was a remote error, still return it but note that local cleanup succeeded
    if (remoteLogoutError) {
      return rejectWithValue({
        ...remoteLogoutError,
        message: `${remoteLogoutError.message} Local session was cleared successfully.`,
      });
    }
  } catch (error) {
    // If local cleanup fails, we have a critical error
    dispatch(logout()); // Force logout anyway
    return rejectWithValue(mapAuthThunkError(error, 'logout'));
  }
});

export const bootstrapAuthSession = createAsyncThunk<
  void,
  void,
  { rejectValue: AuthErrorMessage }
>('auth/bootstrapAuthSession', async (_, { dispatch, rejectWithValue }) => {
  try {
    const token = await TokenService.getToken();

    if (!token) {
      dispatch(logout());
      return;
    }

    const currentUserAction = await dispatch(getCurrentUser(token));
    if (!getCurrentUser.fulfilled.match(currentUserAction)) {
      try {
        await clearLocalSessionData();
      } catch (clearError) {
        console.error(
          'Failed to clear local session after bootstrap validation error:',
          clearError,
        );
      }

      dispatch(logout());

      // currentUserAction.payload is now AuthErrorMessage
      const errorPayload = currentUserAction.payload;
      if (errorPayload) {
        return rejectWithValue(errorPayload);
      }

      return rejectWithValue({
        type: 'api',
        message: 'Failed to validate saved session.',
      });
    }

    dispatch(setAuthToken(token));
  } catch (error) {
    try {
      await clearLocalSessionData();
    } catch (clearError) {
      console.error(
        'Failed to clear local session after bootstrap error:',
        clearError,
      );
    }

    dispatch(logout());
    return rejectWithValue(mapAuthThunkError(error, 'bootstrap'));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: state => {
      state.token = null;
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setAuthToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearAuthError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<LoginSuccessResponse['data']>) => {
          state.loading = false;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
        },
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.token = null;
        state.currentUser = null;
        state.isAuthenticated = false;
        state.error = action.payload ?? {
          type: 'api' as const,
          message: 'Login failed.',
        };
      })
      .addCase(getCurrentUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getCurrentUser.fulfilled,
        (state, action: PayloadAction<AuthUser>) => {
          state.loading = false;
          state.currentUser = action.payload;
          state.isAuthenticated = Boolean(state.token);
          state.error = null;
        },
      )
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.currentUser = null;
        state.isAuthenticated = false;
        state.error = action.payload ?? {
          type: 'api' as const,
          message: 'Failed to fetch profile.',
        };
      })
      .addCase(bootstrapAuthSession.pending, state => {
        state.isBootstrapping = true;
        state.error = null;
      })
      .addCase(bootstrapAuthSession.fulfilled, state => {
        state.isBootstrapping = false;
      })
      .addCase(bootstrapAuthSession.rejected, (state, action) => {
        state.isBootstrapping = false;
        state.error = action.payload ?? {
          type: 'api' as const,
          message: 'Failed to restore user session.',
        };
      })
      .addCase(logoutUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.loading = false;
        // AC-2 & AC-3: Explicitly clear both token and authenticated flag
        state.token = null;
        state.currentUser = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        // AC-3: Even on logout failure, ensure deterministic cleanup
        // Token must be cleared, authenticated must be false
        state.token = null;
        state.currentUser = null;
        state.isAuthenticated = false;
        state.error = action.payload ?? {
          type: 'api' as const,
          message: 'Logout failed.',
        };
      });
  },
});

export const { logout, setAuthToken, clearAuthError } = authSlice.actions;

export const selectAuthLoading = (state: RootState): boolean =>
  state.auth.loading;
export const selectAuthError = (state: RootState): AuthErrorMessage | null =>
  state.auth.error;
export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.isAuthenticated;
export const selectIsBootstrappingAuth = (state: RootState): boolean =>
  state.auth.isBootstrapping;
export const selectAuthToken = (state: RootState): string | null =>
  state.auth.token;
export const selectCurrentUser = (state: RootState): AuthUser | null =>
  state.auth.currentUser;

export default authSlice.reducer;
