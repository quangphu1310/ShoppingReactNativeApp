import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Product } from '../components/ProductCard';
import { BottomTabItem } from '../components/BottomTab';
import { useAppDispatch, useAppSelector } from '../stores/store';
import {
  fetchProducts,
  selectProductError,
  selectProductLoading,
  selectProducts,
  selectProductSearchQuery,
  setSearchQuery,
} from '../slices/product-slice';
import { resolveProductImageUrl } from '../utils/url';
import {
  HomeIcon,
  SquaresPlusIcon,
  HeartIcon,
  UserIcon,
} from 'react-native-heroicons/outline';

type HomeNavigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface ProductError {
  message: string;
}

export interface UseHomeScreenReturn {
  // Data
  products: Product[];
  searchQuery: string;
  isLoading: boolean;
  error: ProductError | null;
  activeTabKey: string;
  bottomTabItems: BottomTabItem[];

  // Handlers
  onSearchChange: (value: string) => void;
  onRetry: () => void;
  onAddToCart: (productId: string) => void;
  onWishlistPress: (productId: string) => void;
  onCategoryPress: (categoryId: string) => void;
  onBellPress: () => void;
  onCartPress: () => void;
  hideHeader: () => void;
}

// Tab icon renderers
const renderShopTabIcon = (_active: boolean, color: string): React.ReactNode =>
  React.createElement(HomeIcon, { color, size: 24, strokeWidth: 2 });

const renderCategoriesTabIcon = (_active: boolean, color: string): React.ReactNode =>
  React.createElement(SquaresPlusIcon, { color, size: 24, strokeWidth: 2 });

const renderSavedTabIcon = (_active: boolean, color: string): React.ReactNode =>
  React.createElement(HeartIcon, { color, size: 24, strokeWidth: 2 });

const renderProfileTabIcon = (_active: boolean, color: string): React.ReactNode =>
  React.createElement(UserIcon, { color, size: 24, strokeWidth: 2 });

/**
 * Business logic hook for HomeScreen.
 * Handles search debounce, product fetching, data mapping, and navigation.
 */
export const useHomeScreen = (navigation: HomeNavigation): UseHomeScreenReturn => {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector(selectProductSearchQuery);
  const productData = useAppSelector(selectProducts);
  const productLoading = useAppSelector(selectProductLoading);
  const productError = useAppSelector(selectProductError);
  const [activeTabKey, setActiveTabKey] = useState('shop');

  // Hide default stack header
  const hideHeader = useCallback((): void => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Search with debounce
  const onSearchChange = useCallback(
    (value: string): void => {
      dispatch(setSearchQuery(value));
    },
    [dispatch],
  );

  useEffect(() => {
    const debounceId = setTimeout(() => {
      dispatch(
        fetchProducts({
          name: searchQuery.trim() ? searchQuery.trim() : undefined,
        }),
      );
    }, 350);

    return () => {
      clearTimeout(debounceId);
    };
  }, [dispatch, searchQuery]);

  // Map API data → UI model
  const products = useMemo<Product[]>(() => {
    return productData.map(item => ({
      id: String(item.id),
      title: item.name,
      category: item.priceUnit.toUpperCase(),
      price: item.price,
      image: resolveProductImageUrl(item.image),
      isSale: false,
    }));
  }, [productData]);

  // Retry / pull-to-refresh
  const onRetry = useCallback((): void => {
    dispatch(
      fetchProducts({
        name: searchQuery.trim() ? searchQuery.trim() : undefined,
      }),
    );
  }, [dispatch, searchQuery]);

  // Interaction handlers
  const onAddToCart = useCallback((productId: string) => {
    console.log('Added to cart:', productId);
  }, []);

  const onWishlistPress = useCallback((productId: string) => {
    console.log('Wishlist toggled:', productId);
  }, []);

  const onCategoryPress = useCallback((_categoryId: string): void => {
    // Keep category chips as UI mock for now
  }, []);

  const onBellPress = useCallback(() => {
    console.log('Bell pressed');
  }, []);

  const onCartPress = useCallback(() => {
    console.log('Cart pressed');
  }, []);

  // Bottom tab config
  const bottomTabItems: BottomTabItem[] = [
    {
      key: 'shop',
      label: 'Shop',
      onPress: () => setActiveTabKey('shop'),
      icon: renderShopTabIcon,
    },
    {
      key: 'categories',
      label: 'Categories',
      onPress: () => {
        setActiveTabKey('categories');
        navigation.navigate('Demo');
      },
      icon: renderCategoriesTabIcon,
    },
    {
      key: 'saved',
      label: 'Saved',
      onPress: () => {
        setActiveTabKey('saved');
        navigation.navigate('Checkout');
      },
      icon: renderSavedTabIcon,
    },
    {
      key: 'profile',
      label: 'Profile',
      onPress: () => {
        setActiveTabKey('profile');
        navigation.navigate('Profile');
      },
      icon: renderProfileTabIcon,
    },
  ];

  return {
    products,
    searchQuery,
    isLoading: productLoading,
    error: productError,
    activeTabKey,
    bottomTabItems,
    onSearchChange,
    onRetry,
    onAddToCart,
    onWishlistPress,
    onCategoryPress,
    onBellPress,
    onCartPress,
    hideHeader,
  };
};
