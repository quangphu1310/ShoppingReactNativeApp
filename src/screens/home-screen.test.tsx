import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { HomeScreen } from './home-screen';

jest.mock('react-native-safe-area-context', () => {
    const { View } = require('react-native');

    return {
        SafeAreaView: ({ children, ...props }: { children: React.ReactNode }) => (
            <View {...props}>{children}</View>
        ),
        useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    };
});

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const createHomeScreenProps = (
    navigate: jest.Mock,
    setOptions: jest.Mock
): HomeScreenProps => ({
    navigation: {
        navigate,
        setOptions,
    } as unknown as HomeScreenProps['navigation'],
    route: {
        key: 'home-test-route',
        name: 'Home',
        params: undefined,
    } as HomeScreenProps['route'],
});

describe('home-screen', () => {
    const navigate = jest.fn();
    const setOptions = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render default home content and hide stack header', async () => {
        const props = createHomeScreenProps(navigate, setOptions);

        render(<HomeScreen {...props} />);

        expect(screen.getByText('Discover')).toBeTruthy();
        expect(screen.getByPlaceholderText('Search products...')).toBeTruthy();
        expect(screen.getByText('Wireless Headphones')).toBeTruthy();
        expect(screen.getByText('Shop')).toBeTruthy();
        expect(screen.getByText('Categories')).toBeTruthy();
        expect(screen.getByText('Saved')).toBeTruthy();
        expect(screen.getByText('Profile')).toBeTruthy();

        await waitFor(() => {
            expect(setOptions).toHaveBeenCalledWith({ headerShown: false });
        });
    });

    it('should filter products by search query and show empty state when no match', async () => {
        const props = createHomeScreenProps(navigate, setOptions);

        render(<HomeScreen {...props} />);

        const searchInput = screen.getByPlaceholderText('Search products...');

        fireEvent.changeText(searchInput, 'smart watch');
        await waitFor(() => {
            expect(screen.getByText('Smart Watch')).toBeTruthy();
            expect(screen.queryByText('Wireless Headphones')).toBeNull();
        });

        fireEvent.changeText(searchInput, 'no-product-match');
        await waitFor(() => {
            expect(screen.getByText('No products found')).toBeTruthy();
        });
    });

    it('should navigate to mapped screens when bottom tabs are pressed', async () => {
        const props = createHomeScreenProps(navigate, setOptions);

        render(<HomeScreen {...props} />);

        fireEvent.press(screen.getByLabelText('Categories tab'));
        fireEvent.press(screen.getByLabelText('Saved tab'));
        fireEvent.press(screen.getByLabelText('Profile tab'));

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith('Demo');
            expect(navigate).toHaveBeenCalledWith('Checkout');
            expect(navigate).toHaveBeenCalledWith('Profile');
        });
    });
});
