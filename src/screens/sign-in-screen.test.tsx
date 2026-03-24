import { useNavigation } from '@react-navigation/native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { clearAuthError } from '../slices/auth-slice';
import { useAppDispatch, useAppSelector } from '../stores/store';
import { SignInScreen } from './sign-in-screen';

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));

jest.mock('../stores/store', () => ({
    useAppDispatch: jest.fn(),
    useAppSelector: jest.fn(),
}));

jest.mock('../slices/auth-slice', () => {
    const clearAuthErrorAction = jest.fn(() => ({ type: 'auth/clearAuthError' }));
    const loginUserThunk = Object.assign(
        jest.fn((payload: { username: string; password: string }) => ({
            type: 'auth/loginUser',
            payload,
        })),
        {
            fulfilled: {
                match: (action: { type: string }) => action.type === 'auth/loginUser/fulfilled',
            },
        }
    );

    const getCurrentUserThunk = Object.assign(
        jest.fn((token: string) => ({
            type: 'auth/getCurrentUser',
            payload: token,
        })),
        {
            fulfilled: {
                match: (action: { type: string }) => action.type === 'auth/getCurrentUser/fulfilled',
            },
        }
    );

    return {
        clearAuthError: clearAuthErrorAction,
        getCurrentUser: getCurrentUserThunk,
        loginUser: loginUserThunk,
        selectAuthLoading: (state: { auth: { loading: boolean } }) => state.auth.loading,
        selectAuthError: (state: { auth: { error: string | null } }) => state.auth.error,
        selectIsAuthenticated: (state: { auth: { isAuthenticated: boolean } }) => state.auth.isAuthenticated,
    };
});

interface MockAuthState {
    token: string | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

interface MockRootState {
    auth: MockAuthState;
    api: {
        data: unknown[];
        loading: boolean;
        error: string | null;
    };
}

const createMockState = (authOverrides?: Partial<MockAuthState>): MockRootState => ({
    auth: {
        token: null,
        loading: false,
        error: null,
        isAuthenticated: false,
        ...authOverrides,
    },
    api: {
        data: [],
        loading: false,
        error: null,
    },
});

describe('sign-in-screen', () => {
    const mockDispatch = jest.fn();
    const mockReplace = jest.fn();
    let mockState: MockRootState;

    beforeEach(() => {
        jest.clearAllMocks();

        mockState = createMockState();

        (useNavigation as jest.Mock).mockReturnValue({
            replace: mockReplace,
        });

        (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
        (useAppSelector as jest.Mock).mockImplementation(
            (selector: (state: MockRootState) => unknown) => selector(mockState)
        );
    });

    it('renders sign-in screen with default content', () => {
        render(<SignInScreen />);

        expect(screen.getByText('Welcome Back')).toBeTruthy();
        expect(screen.getByText('Forgot Password?')).toBeTruthy();
        expect(screen.getByText('Sign In')).toBeTruthy();
    });

    it('shows required field error when username and password are empty', async () => {
        render(<SignInScreen />);

        fireEvent.changeText(screen.getByDisplayValue('johndoe'), '   ');
        fireEvent.changeText(screen.getByDisplayValue('secret123'), '   ');
        fireEvent.press(screen.getByText('Sign In'));

        await waitFor(() => {
            expect(screen.getByText('Username and password are required.')).toBeTruthy();
        });
    });

    it('shows forgot password placeholder error without triggering login', async () => {
        render(<SignInScreen />);

        fireEvent.press(screen.getByText('Forgot Password?'));

        await waitFor(() => {
            expect(screen.getByText('Forgot password flow is not available yet.')).toBeTruthy();
        });
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('dispatches clearAuthError when user edits input and auth error exists', () => {
        mockState = createMockState({ error: 'Invalid credentials' });
        render(<SignInScreen />);

        fireEvent.changeText(screen.getByDisplayValue('johndoe'), 'johnny');

        expect(mockDispatch).toHaveBeenCalledWith(clearAuthError());
    });

    it('navigates to Home after successful login', async () => {
        mockDispatch.mockResolvedValueOnce({
            type: 'auth/loginUser/fulfilled',
            payload: {
                user: {
                    id: 1,
                    username: 'johndoe',
                    email: 'john@example.com',
                    age: 25,
                    role: 'user',
                    firstName: 'John',
                    lastName: 'Doe',
                },
                token: 'token-123',
            },
        });
        mockDispatch.mockResolvedValueOnce({
            type: 'auth/getCurrentUser/fulfilled',
            payload: {
                id: 1,
                username: 'johndoe',
                email: 'john@example.com',
                age: 25,
                role: 'user',
                firstName: 'John',
                lastName: 'Doe',
            },
        });

        render(<SignInScreen />);

        fireEvent.press(screen.getByText('Sign In'));

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith('Home');
        });
    });

    it('does not navigate when login is rejected', async () => {
        mockDispatch.mockResolvedValueOnce({
            type: 'auth/loginUser/rejected',
            payload: 'Invalid username or password',
        });

        render(<SignInScreen />);

        fireEvent.press(screen.getByText('Sign In'));

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledTimes(1);
        });
        expect(mockReplace).not.toHaveBeenCalled();
    });

    it('does not navigate when getCurrentUser is rejected', async () => {
        mockDispatch.mockResolvedValueOnce({
            type: 'auth/loginUser/fulfilled',
            payload: {
                user: {
                    id: 1,
                    username: 'johndoe',
                    email: 'john@example.com',
                    age: 25,
                    role: 'user',
                    firstName: 'John',
                    lastName: 'Doe',
                },
                token: 'token-123',
            },
        });
        mockDispatch.mockResolvedValueOnce({
            type: 'auth/getCurrentUser/rejected',
            payload: 'Token has been invalidated. Please login again.',
            error: { message: 'Rejected' },
        });

        render(<SignInScreen />);

        fireEvent.press(screen.getByText('Sign In'));

        await waitFor(() => {
            expect(screen.getByText('Token has been invalidated. Please login again.')).toBeTruthy();
        });
        expect(mockReplace).not.toHaveBeenCalled();
    });
});
