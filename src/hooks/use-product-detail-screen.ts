import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../stores/store';
import {
  fetchProductById,
  selectSelectedProduct,
  selectSelectedProductLoading,
  selectSelectedProductError,
} from '../slices/product-slice';
import { ProductItem } from '../models/product';
import { resolveProductImageUrl } from '../utils/url';

interface ProductError {
  message: string;
}

export interface UseProductDetailScreenReturn {
  product: ProductItem | null;
  loading: boolean;
  error: ProductError | null;
  mappedImageUrl: string | undefined;
  onRetry: () => void;
}

export const useProductDetailScreen = (
  productId: string | undefined,
): UseProductDetailScreenReturn => {
  const dispatch = useAppDispatch();
  const product = useAppSelector(selectSelectedProduct);
  const loading = useAppSelector(selectSelectedProductLoading);
  const error = useAppSelector(selectSelectedProductError);

  const fetchDetail = useCallback(() => {
    if (productId) {
      void dispatch(fetchProductById(productId));
    }
  }, [dispatch, productId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const mappedImageUrl = product ? resolveProductImageUrl(product.image) : undefined;

  return {
    product,
    loading,
    error,
    mappedImageUrl,
    onRetry: fetchDetail,
  };
};
