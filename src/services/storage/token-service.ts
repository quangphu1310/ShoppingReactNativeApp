import EncryptedStorage from 'react-native-encrypted-storage';

const AUTH_TOKEN_KEY = 'SHOPPING_APP_AUTH_TOKEN';

export class TokenService {
  static async saveToken(token: string): Promise<boolean> {
    try {
      await EncryptedStorage.setItem(AUTH_TOKEN_KEY, token);
      return true;
    } catch (error) {
      console.error('Failed to save auth token:', error);
      return false;
    }
  }

  static async getToken(): Promise<string | null> {
    try {
      const token = await EncryptedStorage.getItem(AUTH_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Failed to read auth token:', error);
      return null;
    }
  }

  static async clearToken(): Promise<boolean> {
    try {
      await EncryptedStorage.removeItem(AUTH_TOKEN_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear auth token:', error);
      return false;
    }
  }
}
