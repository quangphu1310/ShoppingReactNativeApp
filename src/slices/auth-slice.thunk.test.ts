import { configureStore } from '@reduxjs/toolkit';

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

jest.mock('../services/storage/token-service', () => ({
  TokenService: {
    saveToken: jest.fn(),
    getToken: jest.fn(),
    clearToken: jest.fn(),
  },
}));

jest.mock('../services/storage/profile-repository', () => ({
  ProfileRepository: {
    upsertProfile: jest.fn(),
    clearProfile: jest.fn(),
  },
}));

import {
  bootstrapAuthSession,
  getCurrentUser,
  loginUser,
  logoutUser,
  setAuthToken,
} from './auth-slice';
import authReducer from './auth-slice';
import { apiService } from '../services/api-service';
import { ProfileRepository } from '../services/storage/profile-repository';
import { TokenService } from '../services/storage/token-service';

interface AxiosLikeError {
  isAxiosError: true;
  message: string;
  response?: {
    status?: number;
    data?: unknown;
  };
}

const createAxiosLikeError = (
  status: number,
  message: string,
  data?: unknown,
): AxiosLikeError => ({
  isAxiosError: true,
  message,
  response: {
    status,
    data,
  },
});

const createStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
    },
  });

const mockUser = {
  id: 1,
  username: 'johndoe',
  email: 'john@example.com',
  age: 30,
  role: 'user' as const,
  firstName: 'John',
  lastName: 'Doe',
};

describe('auth-slice thunk branches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (TokenService.clearToken as jest.Mock).mockResolvedValue(true);
    (ProfileRepository.clearProfile as jest.Mock).mockResolvedValue(undefined);
  });

  it('loginUser success path', async () => {
    const store = createStore();
    (apiService.login as jest.Mock).mockResolvedValue({
      status: true,
      data: {
        token: 't-1',
        user: mockUser,
      },
    });
    (TokenService.saveToken as jest.Mock).mockResolvedValue(true);

    await store.dispatch(
      loginUser({
        username: 'johndoe',
        password: 'secret123',
      }),
    );

    const state = store.getState().auth;
    expect(state.token).toBe('t-1');
    expect(state.isAuthenticated).toBe(true);
    expect(state.error).toBeNull();
  });

  it('loginUser handles api status=false', async () => {
    const store = createStore();
    (apiService.login as jest.Mock).mockResolvedValue({
      status: false,
      error: { message: 'Invalid credentials.' },
    });

    await store.dispatch(
      loginUser({
        username: 'johndoe',
        password: 'bad-pass',
      }),
    );

    const state = store.getState().auth;
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error?.type).toBe('api');
  });

  it('loginUser handles token persistence failure', async () => {
    const store = createStore();
    (apiService.login as jest.Mock).mockResolvedValue({
      status: true,
      data: {
        token: 't-2',
        user: mockUser,
      },
    });
    (TokenService.saveToken as jest.Mock).mockResolvedValue(false);

    await store.dispatch(
      loginUser({
        username: 'johndoe',
        password: 'secret123',
      }),
    );

    const state = store.getState().auth;
    expect(state.token).toBeNull();
    expect(state.error?.type).toBe('storage');
  });

  it('loginUser handles network axios error', async () => {
    const store = createStore();
    (apiService.login as jest.Mock).mockRejectedValue({
      isAxiosError: true,
      message: 'Network Error',
      response: undefined,
    });

    await store.dispatch(
      loginUser({
        username: 'johndoe',
        password: 'secret123',
      }),
    );

    const state = store.getState().auth;
    expect(state.error?.type).toBe('network');
  });

  it('getCurrentUser success path', async () => {
    const store = createStore();
    store.dispatch(setAuthToken('t-3'));

    (apiService.getCurrentUser as jest.Mock).mockResolvedValue({
      status: true,
      data: mockUser,
    });
    (ProfileRepository.upsertProfile as jest.Mock).mockResolvedValue(undefined);

    await store.dispatch(getCurrentUser('t-3'));

    const state = store.getState().auth;
    expect(ProfileRepository.upsertProfile).toHaveBeenCalled();
    expect(state.currentUser?.username).toBe('johndoe');
    expect(state.isAuthenticated).toBe(true);
  });

  it('getCurrentUser handles status=false response', async () => {
    const store = createStore();
    (apiService.getCurrentUser as jest.Mock).mockResolvedValue({
      status: false,
      error: { message: 'Profile fetch failed.' },
    });

    await store.dispatch(getCurrentUser('t-4'));

    const state = store.getState().auth;
    expect(state.currentUser).toBeNull();
    expect(state.error?.type).toBe('api');
  });

  it('getCurrentUser handles 401 by clearing local session and logout', async () => {
    const store = createStore();
    store.dispatch(setAuthToken('t-5'));

    (apiService.getCurrentUser as jest.Mock).mockRejectedValue(
      createAxiosLikeError(401, 'Unauthorized', {
        error: { message: 'Unauthorized' },
      }),
    );

    await store.dispatch(getCurrentUser('t-5'));

    const state = store.getState().auth;
    expect(TokenService.clearToken).toHaveBeenCalled();
    expect(ProfileRepository.clearProfile).toHaveBeenCalled();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('logoutUser success path with token', async () => {
    const store = createStore();
    store.dispatch(setAuthToken('t-6'));

    (apiService.logout as jest.Mock).mockResolvedValue({
      status: true,
      data: { message: 'OK' },
    });

    await store.dispatch(logoutUser());

    const state = store.getState().auth;
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
  });

  it('logoutUser ignores remote 401 and still resolves local cleanup', async () => {
    const store = createStore();
    store.dispatch(setAuthToken('t-7'));

    (apiService.logout as jest.Mock).mockRejectedValue(
      createAxiosLikeError(401, 'Unauthorized', {
        error: { message: 'Unauthorized' },
      }),
    );

    const action = await store.dispatch(logoutUser());

    expect(logoutUser.fulfilled.match(action)).toBe(true);
    expect(store.getState().auth.token).toBeNull();
  });

  it('logoutUser returns rejected when remote non-401 error occurs but keeps local cleanup', async () => {
    const store = createStore();
    store.dispatch(setAuthToken('t-8'));

    (apiService.logout as jest.Mock).mockRejectedValue(
      createAxiosLikeError(500, 'Server exploded', {
        error: { message: 'Server exploded' },
      }),
    );

    const action = await store.dispatch(logoutUser());
    const state = store.getState().auth;

    expect(logoutUser.rejected.match(action)).toBe(true);
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error?.message).toContain(
      'Local session was cleared successfully',
    );
  });

  it('logoutUser handles local clear failure as storage error', async () => {
    const store = createStore();
    store.dispatch(setAuthToken('t-9'));

    (apiService.logout as jest.Mock).mockResolvedValue({
      status: true,
      data: { message: 'OK' },
    });
    (TokenService.clearToken as jest.Mock).mockResolvedValue(false);

    const action = await store.dispatch(logoutUser());

    expect(logoutUser.rejected.match(action)).toBe(true);
    expect(store.getState().auth.error?.type).toBe('storage');
    expect(store.getState().auth.token).toBeNull();
  });

  it('bootstrapAuthSession with no token dispatches logout and fulfills', async () => {
    const store = createStore();
    (TokenService.getToken as jest.Mock).mockResolvedValue(null);

    const action = await store.dispatch(bootstrapAuthSession());

    expect(bootstrapAuthSession.fulfilled.match(action)).toBe(true);
    expect(store.getState().auth.token).toBeNull();
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  it('bootstrapAuthSession with valid token + getCurrentUser success', async () => {
    const store = createStore();
    (TokenService.getToken as jest.Mock).mockResolvedValue('boot-1');
    (apiService.getCurrentUser as jest.Mock).mockResolvedValue({
      status: true,
      data: mockUser,
    });
    (ProfileRepository.upsertProfile as jest.Mock).mockResolvedValue(undefined);

    const action = await store.dispatch(bootstrapAuthSession());

    expect(bootstrapAuthSession.fulfilled.match(action)).toBe(true);
    expect(store.getState().auth.token).toBe('boot-1');
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });

  it('bootstrapAuthSession rejects when token exists but validation fails', async () => {
    const store = createStore();
    (TokenService.getToken as jest.Mock).mockResolvedValue('boot-2');
    (apiService.getCurrentUser as jest.Mock).mockRejectedValue(
      createAxiosLikeError(403, 'Forbidden', {
        error: { message: 'Forbidden' },
      }),
    );

    const action = await store.dispatch(bootstrapAuthSession());

    expect(bootstrapAuthSession.rejected.match(action)).toBe(true);
    expect(store.getState().auth.token).toBeNull();
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  it('bootstrapAuthSession handles token read crash path', async () => {
    const store = createStore();
    (TokenService.getToken as jest.Mock).mockRejectedValue(
      new Error('Storage read failed'),
    );

    const action = await store.dispatch(bootstrapAuthSession());

    expect(bootstrapAuthSession.rejected.match(action)).toBe(true);
    expect(store.getState().auth.token).toBeNull();
    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(store.getState().auth.error?.type).toBe('storage');
  });
});
