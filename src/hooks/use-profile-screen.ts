import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { BottomTabItem } from '../components/BottomTab';
import { AuthUser } from '../models/auth';
import { getCurrentUser } from '../slices/auth-slice';
import { useAppDispatch } from '../stores/store';
import { useAuth } from './use-auth';
import { useLocalProfile } from './use-local-profile';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from 'react-native-heroicons/outline';
import React from 'react';

type ProfileNavigation = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export interface UseProfileScreenReturn {
  profile: AuthUser | null;
  loading: boolean;
  initials: string;
  bottomTabs: BottomTabItem[];
  onSettingsPress: () => void;
  onOrderHistoryPress: () => void;
  onLogoutPress: () => Promise<void>;
}

const renderHomeTabIcon = (_active: boolean, color: string): React.ReactNode =>
  React.createElement(HomeIcon, { color, size: 24, strokeWidth: 2 });

const renderSearchTabIcon = (_active: boolean, color: string): React.ReactNode =>
  React.createElement(MagnifyingGlassIcon, { color, size: 24, strokeWidth: 2 });

const renderProfileTabIcon = (_active: boolean, color: string): React.ReactNode =>
  React.createElement(UserIcon, { color, size: 24, strokeWidth: 2 });

/**
 * Business logic hook for ProfileScreen.
 * Handles profile sync from API, local profile reading, and navigation.
 */
export const useProfileScreen = (
  navigation: ProfileNavigation,
): UseProfileScreenReturn => {
  const dispatch = useAppDispatch();
  const { token, logout } = useAuth();
  const { profile, loading, refetch } = useLocalProfile();

  // Sync latest profile from API whenever screen gains focus
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const syncProfileFromApi = async (): Promise<void> => {
        if (!token) {
          return;
        }
        const action = await dispatch(getCurrentUser(token));
        if (isMounted && getCurrentUser.fulfilled.match(action)) {
          refetch();
        }
      };

      void syncProfileFromApi();

      return () => {
        isMounted = false;
      };
    }, [dispatch, refetch, token]),
  );

  const initials = profile
    ? `${profile.firstName?.charAt(0) ?? ''}${profile.lastName?.charAt(0) ?? ''}`
    : 'U';

  const onSettingsPress = useCallback((): void => {
    navigation.navigate('Demo');
  }, [navigation]);

  const onOrderHistoryPress = useCallback((): void => {
    navigation.navigate('OrderHistory');
  }, [navigation]);

  const bottomTabs: BottomTabItem[] = [
    {
      key: 'home',
      label: 'Home',
      icon: renderHomeTabIcon,
      onPress: () => navigation.navigate('Home'),
    },
    {
      key: 'search',
      label: 'Search',
      icon: renderSearchTabIcon,
      onPress: () => navigation.navigate('Demo'),
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: renderProfileTabIcon,
      onPress: () => navigation.navigate('Profile'),
    },
  ];

  return {
    profile,
    loading,
    initials,
    bottomTabs,
    onSettingsPress,
    onOrderHistoryPress,
    onLogoutPress: logout,
  };
};
