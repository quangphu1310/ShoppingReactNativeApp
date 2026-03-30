jest.mock('react-native-dotenv', () => ({
  DEV_API_HOST: 'localhost',
  DEV_API_PORT: '3000',
}));

jest.mock('../services/api-service', () => ({
  apiService: {
    login: jest.fn(),
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock('../services/storage/profile-repository', () => ({
  ProfileRepository: {
    upsertProfile: jest.fn(),
    clearProfile: jest.fn(),
    getProfile: jest.fn(),
  },
}));

jest.mock('../services/storage/token-service', () => ({
  TokenService: {
    saveToken: jest.fn(),
    getToken: jest.fn(),
    clearToken: jest.fn(),
  },
}));

import authReducer, { setAuthToken } from './auth-slice';

describe('auth logout reducer', () => {
  it('clears deterministic state on logout fulfilled', () => {
    const loggedIn = authReducer(undefined, setAuthToken('token-logout'));

    const state = authReducer(loggedIn, {
      type: 'auth/logoutUser/fulfilled',
    });

    expect(state.loading).toBe(false);
    expect(state.token).toBeNull();
    expect(state.currentUser).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
  });

  it('clears deterministic state on logout rejected', () => {
    const loggedIn = authReducer(undefined, setAuthToken('token-logout-2'));

    const state = authReducer(loggedIn, {
      type: 'auth/logoutUser/rejected',
      payload: {
        type: 'network',
        message: 'Network error. Local session cleared anyway.',
      },
    });

    expect(state.loading).toBe(false);
    expect(state.token).toBeNull();
    expect(state.currentUser).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error?.type).toBe('network');
  });

  it('keeps token-auth invariant for all logout end states', () => {
    const loggedIn = authReducer(undefined, setAuthToken('token-3'));

    const fulfilledState = authReducer(loggedIn, {
      type: 'auth/logoutUser/fulfilled',
    });
    const rejectedState = authReducer(loggedIn, {
      type: 'auth/logoutUser/rejected',
      payload: {
        type: 'api',
        message: 'Unauthorized. Please login again.',
      },
    });

    [fulfilledState, rejectedState].forEach(state => {
      if (state.token) {
        expect(state.isAuthenticated).toBe(true);
      } else {
        expect(state.isAuthenticated).toBe(false);
      }
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
