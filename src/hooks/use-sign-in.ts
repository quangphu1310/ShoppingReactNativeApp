import { useCallback, useState } from 'react';
import { loginUser } from '../slices/auth-slice';
import { useAppDispatch } from '../stores/store';
import { useAuth } from './use-auth';

export interface UseSignInReturn {
  username: string;
  password: string;
  useBiometric: boolean;
  formError: string | null;
  loading: boolean;
  authErrorMessage: string | null;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onToggleBiometric: () => void;
  onSignInPress: () => Promise<void>;
  onForgotPasswordPress: () => void;
}

/**
 * Business logic hook for SignInScreen.
 * Handles form state, validation, and login dispatch.
 */
export const useSignIn = (): UseSignInReturn => {
  const dispatch = useAppDispatch();
  const { loading, error: authError, clearError } = useAuth();

  const [username, setUsername] = useState<string>('johndoe');
  const [password, setPassword] = useState<string>('secret123');
  const [useBiometric, setUseBiometric] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const onUsernameChange = useCallback(
    (value: string): void => {
      setUsername(value);
      setFormError(null);
      if (authError) {
        clearError();
      }
    },
    [authError, clearError],
  );

  const onPasswordChange = useCallback(
    (value: string): void => {
      setPassword(value);
      setFormError(null);
      if (authError) {
        clearError();
      }
    },
    [authError, clearError],
  );

  const onToggleBiometric = useCallback((): void => {
    setUseBiometric(prev => !prev);
  }, []);

  const onSignInPress = useCallback(async (): Promise<void> => {
    if (loading) {
      return;
    }

    const normalizedUsername = username.trim();
    const normalizedPassword = password.trim();

    if (!normalizedUsername || !normalizedPassword) {
      setFormError('Username and password are required.');
      return;
    }

    setFormError(null);

    const action = await dispatch(
      loginUser({ username: normalizedUsername, password: normalizedPassword }),
    );

    if (!loginUser.fulfilled.match(action)) {
      return;
    }
  }, [dispatch, loading, username, password]);

  const onForgotPasswordPress = useCallback((): void => {
    setFormError('Forgot password flow is not available yet.');
  }, []);

  return {
    username,
    password,
    useBiometric,
    formError,
    loading,
    authErrorMessage: authError?.message ?? null,
    onUsernameChange,
    onPasswordChange,
    onToggleBiometric,
    onSignInPress,
    onForgotPasswordPress,
  };
};
