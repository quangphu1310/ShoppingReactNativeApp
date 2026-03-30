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
  useAppDispatch: jest.fn(() => jest.fn()),
  useAppSelector: jest.fn(() => false),
}));

jest.mock('../src/slices/auth-slice', () => ({
  bootstrapAuthSession: jest.fn(() => ({ type: 'auth/bootstrapAuthSession' })),
  selectIsBootstrappingAuth: jest.fn(() => false),
  selectIsAuthenticated: jest.fn(() => false),
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
