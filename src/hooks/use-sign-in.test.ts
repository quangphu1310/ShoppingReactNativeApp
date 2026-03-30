import { renderHook, act } from '@testing-library/react-native';
import { useSignIn } from './use-sign-in';
import { useAppDispatch } from '../stores/store';
import { useAuth } from './use-auth';
import { loginUser } from '../slices/auth-slice';

// Mock environment variables
jest.mock('react-native-dotenv', () => ({
  DEV_API_HOST: 'localhost',
  DEV_API_PORT: '3000',
}));

jest.mock('../services/api-service', () => ({
  resolvedApiBaseUrl: 'http://localhost:3000',
}));

// Mock the store and actions
jest.mock('../stores/store', () => ({
  useAppDispatch: jest.fn(),
}));


jest.mock('./use-auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../slices/auth-slice', () => {
  const loginUserThunk = Object.assign(
    jest.fn((payload) => ({ type: 'auth/loginUser', payload })),
    {
      fulfilled: {
        match: (action: { type: string }) => action.type === 'auth/loginUser/fulfilled',
      },
      rejected: {
        match: (action: { type: string }) => action.type === 'auth/loginUser/rejected',
      },
    }
  );
  return {
    loginUser: loginUserThunk,
    setAuthToken: jest.fn(),
    logout: jest.fn(),
  };
});

describe('useSignIn', () => {
  const mockDispatch = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useAuth as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      clearError: mockClearError,
    });
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSignIn());

    expect(result.current.username).toBe('johndoe');
    expect(result.current.password).toBe('secret123');
    expect(result.current.useBiometric).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.formError).toBeNull();
  });

  it('should update username and clear errors', () => {
    (useAuth as jest.Mock).mockReturnValue({
      loading: false,
      error: { message: 'Invalid server error' },
      clearError: mockClearError,
    });
    const { result } = renderHook(() => useSignIn());

    act(() => {
      result.current.onUsernameChange('newuser');
    });

    expect(result.current.username).toBe('newuser');
    expect(result.current.formError).toBeNull();
    expect(mockClearError).toHaveBeenCalled();
  });

  it('should update password and clear errors', () => {
    (useAuth as jest.Mock).mockReturnValue({
      loading: false,
      error: { message: 'Invalid password' },
      clearError: mockClearError,
    });
    const { result } = renderHook(() => useSignIn());

    act(() => {
      result.current.onPasswordChange('newpassword');
    });

    expect(result.current.password).toBe('newpassword');
    expect(result.current.formError).toBeNull();
    expect(mockClearError).toHaveBeenCalled();
  });

  it('should toggle biometric', () => {
    const { result } = renderHook(() => useSignIn());

    act(() => {
      result.current.onToggleBiometric();
    });

    expect(result.current.useBiometric).toBe(true);
  });

  it('should prevent sign in when loading', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      loading: true,
      error: null,
      clearError: mockClearError,
    });
    const { result } = renderHook(() => useSignIn());

    await act(async () => {
      await result.current.onSignInPress();
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('should show error when fields are empty', async () => {
    const { result } = renderHook(() => useSignIn());

    act(() => {
      result.current.onUsernameChange('');
      result.current.onPasswordChange('   ');
    });

    await act(async () => {
      await result.current.onSignInPress();
    });

    expect(result.current.formError).toBe('Username and password are required.');
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('should dispatch loginUser when fields are valid', async () => {
    mockDispatch.mockResolvedValue({ type: 'auth/loginUser/fulfilled' });
    const { result } = renderHook(() => useSignIn());

    await act(async () => {
      await result.current.onSignInPress();
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      loginUser({ username: 'johndoe', password: 'secret123' })
    );
  });

  it('should handle placeholder forgot password flow', async () => {
    const { result } = renderHook(() => useSignIn());

    act(() => {
      result.current.onForgotPasswordPress();
    });

    expect(result.current.formError).toBe('Forgot password flow is not available yet.');
  });
});
