import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useHomeScreen } from './use-home-screen';
import { useAppDispatch, useAppSelector } from '../stores/store';
import {
  fetchProducts,
  selectProductError,
  selectProductLoading,
  selectProducts,
  selectProductSearchQuery,
  setSearchQuery,
} from '../slices/product-slice';

// Mock navigation
const mockSetOptions = jest.fn();
const mockNavigate = jest.fn();
const mockNavigation = {
  setOptions: mockSetOptions,
  navigate: mockNavigate,
} as any;

// Mock environment variables
jest.mock('react-native-dotenv', () => ({
  DEV_API_HOST: 'localhost',
  DEV_API_PORT: '3000',
}));

jest.mock('../services/api-service', () => ({
  resolvedApiBaseUrl: 'http://localhost:3000',
}));

// Mock store and dependencies
jest.mock('../stores/store', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));


jest.mock('../slices/product-slice', () => ({
  fetchProducts: jest.fn(() => ({ type: 'product/fetchProducts' })),
  selectProductError: jest.fn(),
  selectProductLoading: jest.fn(),
  selectProducts: jest.fn(),
  selectProductSearchQuery: jest.fn(),
  setSearchQuery: jest.fn((value) => ({ type: 'product/setSearchQuery', payload: value })),
}));

describe('useHomeScreen', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    
    // Default selector behavior
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      if (selector === selectProductSearchQuery) return '';
      if (selector === selectProducts) return [];
      if (selector === selectProductLoading) return false;
      if (selector === selectProductError) return null;
      return null;
    });

  });

  it('should initialize with products and bottom tabs', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      if (selector === selectProducts) return [
        { id: 1, name: 'Product 1', price: 10, priceUnit: 'dollar', image: 'img1.jpg' }
      ];
      if (selector === selectProductSearchQuery) return '';
      return null;
    });

    const { result } = renderHook(() => useHomeScreen(mockNavigation));

    expect(result.current.products).toHaveLength(1);

    expect(result.current.products[0].title).toBe('Product 1');
    expect(result.current.bottomTabItems).toHaveLength(4);
    expect(result.current.bottomTabItems[0].label).toBe('Shop');
  });

  it('should call hideHeader on component mount', () => {
    const { result } = renderHook(() => useHomeScreen(mockNavigation));
    
    act(() => {
      result.current.hideHeader();
    });

    expect(mockSetOptions).toHaveBeenCalledWith({ headerShown: false });
  });

  it('should dispatch searchQuery on search change', () => {
    const { result } = renderHook(() => useHomeScreen(mockNavigation));

    act(() => {
      result.current.onSearchChange('phone');
    });

    expect(mockDispatch).toHaveBeenCalledWith(setSearchQuery('phone'));
  });

  it('should debounce product fetching when searchQuery changes', async () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      if (selector === selectProductSearchQuery) return 'abc';
      if (selector === selectProducts) return [];
      return null;
    });


    renderHook(() => useHomeScreen(mockNavigation));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(fetchProducts({ name: 'abc' }));
    }, { timeout: 1000 });
  });

  it('should trigger fetchProducts manually on onRetry', () => {
    const { result } = renderHook(() => useHomeScreen(mockNavigation));

    act(() => {
      result.current.onRetry();
    });

    expect(mockDispatch).toHaveBeenCalledWith(fetchProducts({ name: undefined }));
  });

  it('should navigate to correct screens when bottom tabs pressed', () => {
    const { result } = renderHook(() => useHomeScreen(mockNavigation));

    // Categories
    act(() => { result.current.bottomTabItems[1].onPress(); });
    expect(mockNavigate).toHaveBeenCalledWith('Demo');

    // Saved
    act(() => { result.current.bottomTabItems[2].onPress(); });
    expect(mockNavigate).toHaveBeenCalledWith('Checkout');

    // Profile
    act(() => { result.current.bottomTabItems[3].onPress(); });
    expect(mockNavigate).toHaveBeenCalledWith('Profile');
  });
});
