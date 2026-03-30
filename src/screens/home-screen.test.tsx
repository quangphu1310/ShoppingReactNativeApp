import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { HomeScreen } from './home-screen';

jest.mock('react-native-dotenv', () => ({
    DEV_API_HOST: 'localhost',
    DEV_API_PORT: '3000',
}));

jest.mock('../services/api-service', () => ({
    resolvedApiBaseUrl: 'http://localhost:3000',
}));

const mockDispatch = jest.fn();
const mockSetSearchQueryAction = jest.fn((value: string) => ({ type: 'product/setSearchQuery', payload: value }));
const mockFetchProductsThunk = jest.fn((query?: { name?: string }) => ({ type: 'product/fetchProducts', payload: query }));

jest.mock('../stores/store', () => ({
    useAppDispatch: jest.fn(() => mockDispatch),
    useAppSelector: jest.fn((selector: (state: {
        product: {
            searchQuery: string;
            loading: boolean;
            error: { message: string } | null;
            data: Array<{
                id: number;
                name: string;
                price: number;
                priceUnit: 'dollar' | 'euro' | 'inr';
                image: string;
                description: string;
            }>;
        };
    }) => unknown) =>
        selector({
            product: {
                searchQuery: '',
                loading: false,
                error: null,
                data: [
                    {
                        id: 1,
                        name: 'Wireless Headphones',
                        price: 89.99,
                        priceUnit: 'dollar',
                        image: '/assets/headphones.jpg',
                        description: 'Noise-canceling headphones',
                    },
                    {
                        id: 2,
                        name: 'Smart Watch',
                        price: 129.99,
                        priceUnit: 'dollar',
                        image: '/assets/watch.jpg',
                        description: 'Fitness smart watch',
                    },
                ],
            },
        })),
}));

jest.mock('../slices/product-slice', () => ({
    fetchProducts: (query?: { name?: string }) => mockFetchProductsThunk(query),
    selectProductError: (state: { product: { error: { message: string } | null } }) => state.product.error,
    selectProductLoading: (state: { product: { loading: boolean } }) => state.product.loading,
    selectProducts: (state: { product: { data: Array<unknown> } }) => state.product.data,
    selectProductSearchQuery: (state: { product: { searchQuery: string } }) => state.product.searchQuery,
    setSearchQuery: (value: string) => mockSetSearchQueryAction(value),
}));

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
        mockDispatch.mockClear();
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

    it('should dispatch search query updates and trigger product fetch with trimmed query', async () => {
        const props = createHomeScreenProps(navigate, setOptions);

        render(<HomeScreen {...props} />);

        const searchInput = screen.getByPlaceholderText('Search products...');

        fireEvent.changeText(searchInput, 'smart watch');

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'product/setSearchQuery',
            payload: 'smart watch',
        });

        await waitFor(() => {
            expect(mockFetchProductsThunk).toHaveBeenCalled();
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
