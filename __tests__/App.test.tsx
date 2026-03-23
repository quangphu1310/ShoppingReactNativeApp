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

jest.mock('react-redux', () => ({
  Provider: ({ children }: { children: React.ReactNode }) => children,
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../src/stores/store', () => ({
  __esModule: true,
  default: {},
  useAppSelector: jest.fn(() => false),
}));

jest.mock('../src/slices/auth-slice', () => ({
  selectIsAuthenticated: jest.fn(() => false),
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
