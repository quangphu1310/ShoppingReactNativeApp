import { useCallback } from 'react';
import { AuthErrorMessage, AuthUser } from '../models/auth';
import {
  clearAuthError,
  logoutUser,
  selectAuthError,
  selectAuthLoading,
  selectAuthToken,
  selectCurrentUser,
  selectIsAuthenticated,
} from '../slices/auth-slice';
import { useAppDispatch, useAppSelector } from '../stores/store';

export interface UseAuthReturn {
  isAuthenticated: boolean;
  token: string | null;
  currentUser: AuthUser | null;
  loading: boolean;
  error: AuthErrorMessage | null;
  logout: () => Promise<void>;
  clearError: () => void;
}

/**
 * Shared hook for common auth state and actions.
 * Use this instead of directly importing selectors + dispatch in every screen.
 */
export const useAuth = (): UseAuthReturn => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const token = useAppSelector(selectAuthToken);
  const currentUser = useAppSelector(selectCurrentUser);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (err) {
      // logoutUser thunk already handles cleanup even on failure.
      // Error is stored in Redux state via rejected case.
      console.error('Logout error:', err);
    }
  }, [dispatch]);

  const handleClearError = useCallback((): void => {
    dispatch(clearAuthError());
  }, [dispatch]);

  return {
    isAuthenticated,
    token,
    currentUser,
    loading,
    error,
    logout: handleLogout,
    clearError: handleClearError,
  };
};
