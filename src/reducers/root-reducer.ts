import { combineReducers } from '@reduxjs/toolkit';
import apiReducer from '../slices/api-slice';
import authReducer from '../slices/auth-slice';

const rootReducer = combineReducers({
  api: apiReducer,
  auth: authReducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
