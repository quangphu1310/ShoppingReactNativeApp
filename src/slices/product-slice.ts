import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../reducers/root-reducer';
import {
  GetProductsQuery,
  GetProductsResponse,
  ProductItem,
} from '../models/product';
import { apiService } from '../services/api-service';

interface ProductError {
  message: string;
  statusCode?: number;
}

interface ProductState {
  data: ProductItem[];
  loading: boolean;
  error: ProductError | null;
  searchQuery: string;
}

const initialState: ProductState = {
  data: [],
  loading: false,
  error: null,
  searchQuery: '',
};

const getApiErrorMessage = (errorData: unknown): string | null => {
  if (!errorData) {
    return null;
  }

  if (typeof errorData === 'string') {
    return errorData;
  }

  const typedError = errorData as { error?: { message?: string } | string };

  if (typeof typedError.error === 'string') {
    return typedError.error;
  }

  if (typedError.error && typeof typedError.error.message === 'string') {
    return typedError.error.message;
  }

  return null;
};

export const fetchProducts = createAsyncThunk<
  ProductItem[],
  GetProductsQuery | undefined,
  { state: RootState; rejectValue: ProductError }
>('product/fetchProducts', async (query, { getState, rejectWithValue }) => {
  const token = getState().auth.token;

  if (!token) {
    return rejectWithValue({
      message: 'Missing authentication token. Please login again.',
      statusCode: 401,
    });
  }

  try {
    const result: GetProductsResponse = await apiService.getProducts(
      token,
      query,
    );

    if (!result.status) {
      return rejectWithValue({
        message: getApiErrorMessage(result) ?? 'Failed to fetch products.',
      });
    }

    return result.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const message =
        getApiErrorMessage(error.response?.data) ??
        error.message ??
        'Failed to fetch products.';

      return rejectWithValue({ message, statusCode });
    }

    return rejectWithValue({ message: 'An unexpected error occurred.' });
  }
});

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearProductError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProducts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProducts.fulfilled,
        (state, action: PayloadAction<ProductItem[]>) => {
          state.loading = false;
          state.data = action.payload;
        },
      )
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          ({
            message: action.error.message ?? 'Failed to fetch products.',
          } as ProductError);
      });
  },
});

export const { setSearchQuery, clearProductError } = productSlice.actions;

export const selectProducts = (state: RootState): ProductItem[] =>
  state.product.data;
export const selectProductLoading = (state: RootState): boolean =>
  state.product.loading;
export const selectProductError = (state: RootState): ProductError | null =>
  state.product.error;
export const selectProductSearchQuery = (state: RootState): string =>
  state.product.searchQuery;

export default productSlice.reducer;
