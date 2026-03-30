import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  AuthUser,
  GetCurrentUserErrorResponse,
  GetCurrentUserResponse,
  LoginErrorResponse,
  LoginRequest,
  LoginSuccessResponse,
} from '../models/auth';
import { RootState } from '../reducers/root-reducer';
import { apiService } from '../services/api-service';
import { ProfileRepository } from '../services/storage/profile-repository';
import { TokenService } from '../services/storage/token-service';

interface AuthState {
  token: string | null;
  currentUser: AuthUser | null;
  loading: boolean;
  error: string | null;
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
  const [, clearProfileResult] = await Promise.allSettled([
    TokenService.clearToken(),
    ProfileRepository.clearProfile(),
  ]);

  if (clearProfileResult.status === 'rejected') {
    throw clearProfileResult.reason;
  }
};

const getApiErrorMessage = (errorData: unknown): string | null => {
  if (!errorData) {
    return null;
  }

  if (typeof errorData === 'string') {
    return errorData;
  }

  const typedError = errorData as GetCurrentUserErrorResponse;
  if (typeof typedError.error === 'string') {
    return typedError.error;
  }

  if (typedError.error && typeof typedError.error.message === 'string') {
    return typedError.error.message;
  }

  return null;
};

export const loginUser = createAsyncThunk<
  LoginSuccessResponse['data'],
  LoginRequest,
  { rejectValue: string }
>('auth/loginUser', async (payload, { rejectWithValue }) => {
  try {
    const result = await apiService.login(payload);

    if (!result.status) {
      return rejectWithValue(result.error.message);
    }

    const persisted = await TokenService.saveToken(result.data.token);
    if (!persisted) {
      return rejectWithValue('Failed to persist auth token.');
    }

    return result.data;
  } catch (error) {
    if (axios.isAxiosError<LoginErrorResponse>(error)) {
      if (error.message === 'Network Error') {
        return rejectWithValue(
          'Cannot reach API. For Android device, run: adb reverse tcp:3000 tcp:3000',
        );
      }

      const errorMessage =
        error.response?.data?.error?.message ??
        error.message ??
        'Login failed.';

      return rejectWithValue(errorMessage);
    }

    return rejectWithValue('An unexpected error occurred.');
  }
});

export const getCurrentUser = createAsyncThunk<
  AuthUser,
  string,
  { rejectValue: string }
>('auth/getCurrentUser', async (token, { dispatch, rejectWithValue }) => {
  try {
    const result: GetCurrentUserResponse = await apiService.getCurrentUser(
      token,
    );

    if (!result.status) {
      const errorMessage =
        getApiErrorMessage(result) ?? 'Failed to fetch profile.';
      return rejectWithValue(errorMessage);
    }

    await ProfileRepository.upsertProfile(result.data);
    return result.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const apiErrorMessage = getApiErrorMessage(error.response?.data);
      const errorMessage =
        apiErrorMessage ?? error.message ?? 'Failed to fetch profile.';

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

      return rejectWithValue(errorMessage);
    }

    return rejectWithValue('An unexpected error occurred.');
  }
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logoutUser',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await clearLocalSessionData();
      dispatch(logout());
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to clear local session data.';
      return rejectWithValue(errorMessage);
    }
  },
);

export const bootstrapAuthSession = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('auth/bootstrapAuthSession', async (_, { dispatch, rejectWithValue }) => {
  try {
    const token = await TokenService.getToken();

    if (!token) {
      dispatch(logout());
      return;
    }

    dispatch(setAuthToken(token));
  } catch {
    try {
      await clearLocalSessionData();
    } catch (clearError) {
      console.error(
        'Failed to clear local session after bootstrap error:',
        clearError,
      );
    }

    dispatch(logout());
    return rejectWithValue('Failed to restore user session.');
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
        state.error = action.payload ?? action.error.message ?? 'Login failed.';
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
          state.isAuthenticated = true;
          state.error = null;
        },
      )
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.currentUser = null;
        state.isAuthenticated = false;
        state.error =
          action.payload ?? action.error.message ?? 'Failed to fetch profile.';
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
        state.error =
          action.payload ??
          action.error.message ??
          'Failed to restore user session.';
      })
      .addCase(logoutUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.loading = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? action.error.message ?? 'Logout failed.';
      });
  },
});

export const { logout, setAuthToken, clearAuthError } = authSlice.actions;

export const selectAuthLoading = (state: RootState): boolean =>
  state.auth.loading;
export const selectAuthError = (state: RootState): string | null =>
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
