module.exports = {
  preset: 'react-native',
  moduleNameMapper: {
    '^react-native-dotenv$': '<rootDir>/__mocks__/react-native-dotenv.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@reduxjs/toolkit|immer)/)',
  ],
};
