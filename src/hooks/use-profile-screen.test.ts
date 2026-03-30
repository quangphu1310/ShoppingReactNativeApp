import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useProfileScreen } from './use-profile-screen';
import { useAppDispatch } from '../stores/store';
import { useAuth } from './use-auth';
import { useLocalProfile } from './use-local-profile';
import { getCurrentUser } from '../slices/auth-slice';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
} as any;

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

jest.mock('./use-local-profile', () => ({
  useLocalProfile: jest.fn(),
}));

jest.mock('../slices/auth-slice', () => ({
  getCurrentUser: Object.assign(
    jest.fn((token) => ({ type: 'auth/getCurrentUser', payload: token })),
    {
      fulfilled: {
        match: (action: { type: string }) => action.type === 'auth/getCurrentUser/fulfilled',
      },
    }
  ),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect: () => void) => effect(),
}));

describe('useProfileScreen', () => {
  const mockDispatch = jest.fn();
  const mockRefetch = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useAuth as jest.Mock).mockReturnValue({
      token: 'mock-token',
      logout: mockLogout,
    });
    (useLocalProfile as jest.Mock).mockReturnValue({
      profile: {
        id: 1,
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        age: 25,
        role: 'user',
      },
      loading: false,
      refetch: mockRefetch,
    });
    mockDispatch.mockResolvedValue({ type: 'auth/getCurrentUser/fulfilled' });
  });

  it('should initialize with correct profile and initials', () => {
    const { result } = renderHook(() => useProfileScreen(mockNavigation));

    expect(result.current.profile).toEqual(expect.objectContaining({
      username: 'johndoe',
      email: 'john@example.com',
    }));
    expect(result.current.initials).toBe('JD');
    expect(result.current.loading).toBe(false);
  });

  it('should sync profile from API on mount/focus', async () => {
    renderHook(() => useProfileScreen(mockNavigation));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(getCurrentUser('mock-token'));
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('should navigate when settings pressed', () => {
    const { result } = renderHook(() => useProfileScreen(mockNavigation));

    act(() => {
      result.current.onSettingsPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('Demo');
  });

  it('should navigate when order history pressed', () => {
    const { result } = renderHook(() => useProfileScreen(mockNavigation));

    act(() => {
      result.current.onOrderHistoryPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('OrderHistory');
  });

  it('should handle logout call', async () => {
    const { result } = renderHook(() => useProfileScreen(mockNavigation));

    await act(async () => {
      await result.current.onLogoutPress();
    });

    expect(mockLogout).toHaveBeenCalled();
  });

  it('should correctly configure bottom tabs', () => {
    const { result } = renderHook(() => useProfileScreen(mockNavigation));

    expect(result.current.bottomTabs).toHaveLength(3);
    expect(result.current.bottomTabs[0].label).toBe('Home');
    expect(result.current.bottomTabs[1].label).toBe('Search');
    expect(result.current.bottomTabs[2].label).toBe('Profile');
  });
});
