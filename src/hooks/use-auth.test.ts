import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from './use-auth';
import { useAppDispatch, useAppSelector } from '../stores/store';
import { logoutUser, clearAuthError } from '../slices/auth-slice';

// Mock environment variables
jest.mock('react-native-dotenv', () => ({
  DEV_API_HOST: 'localhost',
  DEV_API_PORT: '3000',
}));

jest.mock('../services/api-service', () => ({
  resolvedApiBaseUrl: 'http://localhost:3000',
}));

// Mock environment variables
jest.mock('react-native-dotenv', () => ({
  DEV_API_HOST: 'localhost',
  DEV_API_PORT: '3000',
}));

jest.mock('../services/api-service', () => ({
  resolvedApiBaseUrl: 'http://localhost:3000',
}));

// Mock the store and slice actions
jest.mock('../stores/store', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));



jest.mock('../slices/auth-slice', () => ({
  logoutUser: Object.assign(
    jest.fn(() => ({ type: 'auth/logoutUser' })),
    { unwrap: jest.fn() }
  ),
  clearAuthError: jest.fn(() => ({ type: 'auth/clearAuthError' })),
  selectIsAuthenticated: jest.fn(),
  selectAuthToken: jest.fn(),
  selectCurrentUser: jest.fn(),
  selectAuthLoading: jest.fn(),
  selectAuthError: jest.fn(),
}));

describe('useAuth', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    
    // Set up default selector values
    const { 
      selectIsAuthenticated, 
      selectAuthToken, 
      selectCurrentUser, 
      selectAuthLoading, 
      selectAuthError 
    } = require('../slices/auth-slice');
    
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      if (selector === selectIsAuthenticated) return true;
      if (selector === selectAuthToken) return 'mock-token';
      if (selector === selectCurrentUser) return { id: 1, username: 'testuser' };
      if (selector === selectAuthLoading) return false;
      if (selector === selectAuthError) return null;
      return null;
    });
  });

  it('should return correct initial values from selectors', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe('mock-token');
    expect(result.current.currentUser).toEqual({ id: 1, username: 'testuser' });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should dispatch logoutUser action when logout is called', async () => {
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue(undefined) });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockDispatch).toHaveBeenCalledWith(logoutUser());
  });

  it('should dispatch clearAuthError action when clearError is called', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.clearError();
    });

    expect(mockDispatch).toHaveBeenCalledWith(clearAuthError());
  });

  it('should handle logout errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockRejectedValue(new Error('Logout failed')) });
    
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error));
    consoleSpy.mockRestore();
  });
});
