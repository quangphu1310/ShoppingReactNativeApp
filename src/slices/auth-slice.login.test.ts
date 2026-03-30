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

import authReducer from './auth-slice';

describe('auth login reducer', () => {
  it('sets loading true on login pending', () => {
    const state = authReducer(undefined, { type: 'auth/loginUser/pending' });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('sets authenticated state on login fulfilled', () => {
    const state = authReducer(undefined, {
      type: 'auth/loginUser/fulfilled',
      payload: {
        token: 'token-123',
        user: {
          id: 1,
          username: 'johndoe',
          email: 'john@example.com',
          age: 30,
          role: 'user',
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    });

    expect(state.loading).toBe(false);
    expect(state.token).toBe('token-123');
    expect(state.isAuthenticated).toBe(true);
    expect(state.error).toBeNull();
  });

  it('clears auth state and keeps typed error on login rejected', () => {
    const state = authReducer(undefined, {
      type: 'auth/loginUser/rejected',
      payload: {
        type: 'network',
        message: 'Cannot reach API. Check your internet connection.',
      },
    });

    expect(state.loading).toBe(false);
    expect(state.token).toBeNull();
    expect(state.currentUser).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error?.type).toBe('network');
  });
});
