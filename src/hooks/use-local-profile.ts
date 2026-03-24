import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { AuthUser } from '../models/auth';
import { ProfileRepository } from '../services/storage/profile-repository';

interface UseLocalProfileReturn {
  profile: AuthUser | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to load user profile from local SQLite database
 * Automatically refetches when screen gains focus
 */
export const useLocalProfile = (): UseLocalProfileReturn => {
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(() => {
    setLoading(true);
    setError(null);

    ProfileRepository.getProfile()
      .then(localProfile => {
        setProfile(localProfile);
      })
      .catch(err => {
        console.error('useLocalProfile error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        setProfile(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Refetch profile when screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  return {
    profile,
    loading,
    error,
    refetch: loadProfile,
  };
};
