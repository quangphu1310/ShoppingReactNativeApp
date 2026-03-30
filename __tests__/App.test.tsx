/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => {
    const MockNavigator = ({ children }: { children: React.ReactNode }) => children;
    const MockScreen = () => null;

    return {
      Navigator: MockNavigator,
      Screen: MockScreen,
    };
  },
}));

jest.mock('react-native-dotenv', () => ({
  DEV_API_HOST: 'localhost',
  DEV_API_PORT: '3000',
}));

jest.mock('../src/screens/home-screen', () => ({
  HomeScreen: () => null,
}));

jest.mock('../src/screens/profile-screen', () => ({
  ProfileScreen: () => null,
}));

jest.mock('../src/screens/demo-screen', () => ({
  DemoScreen: () => null,
}));

jest.mock('../src/screens/order-history-screen', () => ({
  OrderHistoryScreen: () => null,
}));

jest.mock('../src/screens/checkout-screen', () => ({
  CheckoutScreen: () => null,
}));

jest.mock('../src/screens/sign-in-screen', () => ({
  SignInScreen: () => null,
}));

jest.mock('react-native-quick-sqlite', () => ({
  QuickSQLite: {
    open: jest.fn(),
    close: jest.fn(),
    executeAsync: jest.fn().mockResolvedValue({
      rows: {
        length: 0,
        item: jest.fn(),
      },
    }),
  },
}));

jest.mock('react-redux', () => ({
  Provider: ({ children }: { children: React.ReactNode }) => children,
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../src/stores/store', () => ({
  __esModule: true,
  default: {},
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('../src/slices/auth-slice', () => ({
  bootstrapAuthSession: jest.fn(() => ({ type: 'auth/bootstrapAuthSession' })),
  selectIsBootstrappingAuth: (state: { auth: { isBootstrappingAuth: boolean } }) =>
    state.auth.isBootstrappingAuth,
  selectIsAuthenticated: (state: { auth: { isAuthenticated: boolean } }) =>
    state.auth.isAuthenticated,
}));

jest.mock('../src/services/storage/sqlite', () => ({
  initializeDatabase: jest.fn(() => Promise.resolve()),
}));

import App from '../App';
import { useAppDispatch, useAppSelector } from '../src/stores/store';
import { initializeDatabase } from '../src/services/storage/sqlite';

interface MockAppState {
  auth: {
    isAuthenticated: boolean;
    isBootstrappingAuth: boolean;
  };
}

const mockDispatch = jest.fn();
let mockState: MockAppState;

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockState = {
      auth: {
        isAuthenticated: false,
        isBootstrappingAuth: false,
      },
    };

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useAppSelector as jest.Mock).mockImplementation(
      (selector: (state: MockAppState) => unknown) => selector(mockState),
    );
  });

  it('should render unauthenticated app state without crashing', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<App />);
    });

    expect(tree!.toJSON()).toBeTruthy();
  });

  it('should render bootstrapping loading state', async () => {
    mockState = {
      auth: {
        isAuthenticated: false,
        isBootstrappingAuth: true,
      },
    };

    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<App />);
    });

    expect(tree!.toJSON()).toBeTruthy();
  });

  it('should render authenticated navigation branch', async () => {
    mockState = {
      auth: {
        isAuthenticated: true,
        isBootstrappingAuth: false,
      },
    };

    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<App />);
    });

    expect(tree!.toJSON()).toBeTruthy();
  });

  it('should log database init error when initialization fails', async () => {
    const initError = new Error('sqlite init failed');
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    (initializeDatabase as jest.Mock).mockRejectedValueOnce(initError);

    await ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<App />);
    });

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to initialize database on app start:',
      initError,
    );

    errorSpy.mockRestore();
  });
});
