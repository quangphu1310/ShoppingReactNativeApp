import { combineReducers } from '@reduxjs/toolkit';
import apiReducer from '../slices/api-slice';
import authReducer from '../slices/auth-slice';
import productReducer from '../slices/product-slice';

const rootReducer = combineReducers({
  api: apiReducer,
  auth: authReducer,
  product: productReducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
