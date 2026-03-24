import { QuickSQLite } from 'react-native-quick-sqlite';
import { AuthUser } from '../../models/auth';

const DB_NAME = 'shopping_app.db';

/**
 * Repository for managing user profile in SQLite
 */
export class ProfileRepository {
  /**
   * Save or update user profile
   */
  static async upsertProfile(user: AuthUser): Promise<void> {
    try {
      const now = new Date().toISOString();

      await QuickSQLite.executeAsync(
        DB_NAME,
        `
        INSERT OR REPLACE INTO user_profile 
        (id, username, email, first_name, last_name, age, role, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          user.id,
          user.username,
          user.email,
          user.firstName,
          user.lastName,
          user.age,
          user.role,
          now,
        ],
      );
    } catch (error) {
      console.error('Failed to upsert profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile from local database
   */
  static async getProfile(): Promise<AuthUser | null> {
    try {
      const result = await QuickSQLite.executeAsync(
        DB_NAME,
        `
        SELECT 
          id,
          username,
          email,
          first_name,
          last_name,
          age,
          role,
          updated_at,
          created_at
        FROM user_profile
        LIMIT 1
      `,
      );

      if (!result.rows || result.rows.length === 0) {
        return null;
      }

      const row = result.rows.item(0) as any;
      return this.mapRowToUser(row);
    } catch (error) {
      console.error('Failed to get profile:', error);
      return null;
    }
  }

  /**
   * Delete user profile from local database
   */
  static async clearProfile(): Promise<void> {
    try {
      await QuickSQLite.executeAsync(DB_NAME, 'DELETE FROM user_profile');
    } catch (error) {
      console.error('Failed to clear profile:', error);
      throw error;
    }
  }

  /**
   * Map database row to AuthUser object
   */
  private static mapRowToUser(row: any): AuthUser {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      age: row.age,
      role: row.role || 'user',
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    };
  }
}
