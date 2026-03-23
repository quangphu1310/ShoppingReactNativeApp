import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  LoginErrorResponse,
  LoginRequest,
  LoginSuccessResponse,
  AuthUser,
} from '../models/auth';
import { RootState } from '../reducers/root-reducer';
import { apiService } from '../services/api-service';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
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

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
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
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
        },
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload ?? action.error.message ?? 'Login failed.';
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;

export const selectAuthLoading = (state: RootState): boolean =>
  state.auth.loading;
export const selectAuthError = (state: RootState): string | null =>
  state.auth.error;
export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.isAuthenticated;
export const selectCurrentUser = (state: RootState): AuthUser | null =>
  state.auth.user;
export const selectAuthToken = (state: RootState): string | null =>
  state.auth.token;

export default authSlice.reducer;
