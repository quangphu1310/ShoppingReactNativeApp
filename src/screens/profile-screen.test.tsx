import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { getCurrentUser, logoutUser } from '../slices/auth-slice';
import { useAppDispatch, useAppSelector } from '../stores/store';
import { useLocalProfile } from '../hooks/use-local-profile';
import { ProfileScreen } from './profile-screen';

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(() => ({
        canGoBack: () => true,
        goBack: jest.fn(),
    })),
    useFocusEffect: (effect: () => void | (() => void)) => {
        effect();
    },
}));

jest.mock('../stores/store', () => ({
    useAppDispatch: jest.fn(),
    useAppSelector: jest.fn(),
}));

jest.mock('../hooks/use-local-profile', () => ({
    useLocalProfile: jest.fn(),
}));

jest.mock('../slices/auth-slice', () => ({
    getCurrentUser: Object.assign(
        jest.fn((token: string) => ({ type: 'auth/getCurrentUser', payload: token })),
        {
            fulfilled: {
                match: (action: { type?: string }) =>
                    action?.type === 'auth/getCurrentUser/fulfilled',
            },
        },
    ),
    logoutUser: Object.assign(
        jest.fn(() => ({ type: 'auth/logoutUser' })),
        { unwrap: jest.fn().mockResolvedValue(undefined) },
    ),
    selectAuthToken: (state: { auth: { token: string | null } }) => state.auth.token,
    selectCurrentUser: () => null,
    selectIsAuthenticated: () => false,
    selectAuthLoading: () => false,
    selectAuthError: () => null,
    clearAuthError: jest.fn(() => ({ type: 'auth/clearAuthError' })),
}));


type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;

interface MockProfile {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    age: number;
}

const createProfileScreenProps = (navigate: jest.Mock): ProfileScreenProps => ({
    navigation: {
        navigate,
    } as unknown as ProfileScreenProps['navigation'],
    route: {
        key: 'profile-test-route',
        name: 'Profile',
        params: undefined,
    } as ProfileScreenProps['route'],
});

describe('profile-screen', () => {
    const navigate = jest.fn();
    const dispatch = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
        (useAppSelector as jest.Mock).mockImplementation((selector: (state: { auth: { token: string | null } }) => unknown) =>
            selector({ auth: { token: 'token-123' } }),
        );
        dispatch.mockResolvedValue({ type: 'auth/getCurrentUser/rejected' });
    });

    it('should render loading state when profile is loading', () => {
        (useLocalProfile as jest.Mock).mockReturnValue({
            profile: null,
            loading: true,
            error: null,
            refetch: jest.fn(),
        });

        const props = createProfileScreenProps(navigate);
        const { UNSAFE_getByType } = render(<ProfileScreen {...props} />);

        expect(screen.getByText('Profile Settings')).toBeTruthy();
        expect(UNSAFE_getByType(require('react-native').ActivityIndicator)).toBeTruthy();
    });

    it('should render profile details from hook data', () => {
        const mockProfile: MockProfile = {
            firstName: 'John',
            lastName: 'Doe',
            username: 'johndoe',
            email: 'john@example.com',
            age: 25,
        };

        (useLocalProfile as jest.Mock).mockReturnValue({
            profile: mockProfile,
            loading: false,
            error: null,
            refetch: jest.fn(),
        });

        const props = createProfileScreenProps(navigate);
        render(<ProfileScreen {...props} />);

        expect(screen.getByText('John Doe')).toBeTruthy();
        expect(screen.getByText('@johndoe')).toBeTruthy();
        expect(screen.getByText('john@example.com')).toBeTruthy();
        expect(screen.getByText('Order History')).toBeTruthy();
    });

    it('should render guest fallback values when profile is unavailable', () => {
        (useLocalProfile as jest.Mock).mockReturnValue({
            profile: null,
            loading: false,
            error: null,
            refetch: jest.fn(),
        });

        const props = createProfileScreenProps(navigate);
        render(<ProfileScreen {...props} />);

        expect(screen.getByText('Guest User')).toBeTruthy();
        expect(screen.getByText('@guest')).toBeTruthy();
        expect(screen.getByText('No email')).toBeTruthy();
        expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
    });

    it('should navigate to order history when action button is pressed', async () => {
        (useLocalProfile as jest.Mock).mockReturnValue({
            profile: null,
            loading: false,
            error: null,
            refetch: jest.fn(),
        });

        const props = createProfileScreenProps(navigate);
        render(<ProfileScreen {...props} />);

        fireEvent.press(screen.getByLabelText('Open order history'));

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith('OrderHistory');
        });
    });

    it('should dispatch logout thunk when logout action is pressed', async () => {
        (useLocalProfile as jest.Mock).mockReturnValue({
            profile: null,
            loading: false,
            error: null,
            refetch: jest.fn(),
        });

        dispatch
            .mockResolvedValueOnce({ type: 'auth/getCurrentUser/rejected' })
            .mockResolvedValueOnce({ type: 'auth/logoutUser/fulfilled' });

        const props = createProfileScreenProps(navigate);
        render(<ProfileScreen {...props} />);

        fireEvent.press(screen.getByLabelText('Logout'));

        await waitFor(() => {
            expect(getCurrentUser).toHaveBeenCalledWith('token-123');
            expect(logoutUser).toHaveBeenCalledTimes(1);
            expect(dispatch).toHaveBeenCalledWith({ type: 'auth/logoutUser' });
        });
    });
});
