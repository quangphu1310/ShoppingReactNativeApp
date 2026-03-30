import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../slices/auth-slice';
import productReducer from '../slices/product-slice';

const rootReducer = combineReducers({
  auth: authReducer,
  product: productReducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
