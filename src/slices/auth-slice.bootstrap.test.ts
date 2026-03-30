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

import authReducer, { logout, setAuthToken } from './auth-slice';

describe('auth bootstrap reducer', () => {
  it('ends bootstrapping on fulfilled', () => {
    const state = authReducer(undefined, {
      type: 'auth/bootstrapAuthSession/fulfilled',
    });

    expect(state.isBootstrapping).toBe(false);
  });

  it('sets typed error on bootstrap rejected', () => {
    const state = authReducer(undefined, {
      type: 'auth/bootstrapAuthSession/rejected',
      payload: {
        type: 'api',
        message: 'Failed to validate saved session.',
      },
    });

    expect(state.isBootstrapping).toBe(false);
    expect(state.error?.type).toBe('api');
    expect(state.error?.message).toContain('Failed');
  });

  it('keeps token-auth invariant after set token and logout', () => {
    const loggedIn = authReducer(undefined, setAuthToken('token-1'));
    expect(loggedIn.token).toBe('token-1');
    expect(loggedIn.isAuthenticated).toBe(true);

    const loggedOut = authReducer(loggedIn, logout());
    expect(loggedOut.token).toBeNull();
    expect(loggedOut.isAuthenticated).toBe(false);
  });
});
