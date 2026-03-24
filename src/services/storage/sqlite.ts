import { QuickSQLite } from 'react-native-quick-sqlite';

const DB_NAME = 'shopping_app.db';
const CURRENT_SCHEMA_VERSION = 1;

let _initialized = false;

/**
 * Initialize SQLite database and run migrations
 */
export const initializeDatabase = async (): Promise<void> => {
  if (_initialized) return;

  try {
    QuickSQLite.open(DB_NAME);
    await runMigrations();
    _initialized = true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

/**
 * Get the database connection (QuickSQLite instance)
 */
export const getDatabase = () => {
  if (!_initialized) {
    throw new Error(
      'Database not initialized. Call initializeDatabase() first.',
    );
  }
  return QuickSQLite;
};

/**
 * Run database migrations
 */
const runMigrations = async (): Promise<void> => {
  try {
    // Create schema_version table if not exists
    await QuickSQLite.executeAsync(
      DB_NAME,
      `
      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY
      );
    `,
    );

    const result = await QuickSQLite.executeAsync(
      DB_NAME,
      'SELECT version FROM schema_version LIMIT 1',
    );
    const currentVersion =
      result.rows && result.rows.length > 0
        ? (result.rows.item(0) as { version: number }).version
        : 0;

    // Run pending migrations
    if (currentVersion < 1) {
      await createUserProfileTable();
      await QuickSQLite.executeAsync(
        DB_NAME,
        'INSERT OR REPLACE INTO schema_version (version) VALUES (?)',
        [CURRENT_SCHEMA_VERSION],
      );
    }
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

/**
 * Create user_profile table (schema version 1)
 */
const createUserProfileTable = async (): Promise<void> => {
  await QuickSQLite.executeAsync(
    DB_NAME,
    `
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      age INTEGER,
      role TEXT DEFAULT 'user',
      updated_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `,
  );
};

/**
 * Close database connection
 */
export const closeDatabase = (): void => {
  if (_initialized) {
    QuickSQLite.close(DB_NAME);
    _initialized = false;
  }
};

/**
 * Clear all data (for testing/reset)
 */
export const clearAllData = async (): Promise<void> => {
  if (!_initialized) return;

  try {
    await QuickSQLite.executeAsync(DB_NAME, 'DELETE FROM user_profile;');
  } catch (error) {
    console.error('Failed to clear all data:', error);
    throw error;
  }
};
