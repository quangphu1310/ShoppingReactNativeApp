export type PriceUnit = 'dollar' | 'euro' | 'inr';

export interface ProductItem {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  priceUnit: PriceUnit;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetProductsQuery {
  name?: string;
  priceUnit?: PriceUnit;
}

export interface GetProductsSuccessResponse {
  status: true;
  data: ProductItem[];
}

export interface GetProductsErrorResponse {
  status: false;
  error:
    | {
        message?: string;
      }
    | string;
}

export type GetProductsResponse =
  | GetProductsSuccessResponse
  | GetProductsErrorResponse;

export interface GetProductByIdSuccessResponse {
  status: true;
  data: ProductItem;
}

export type GetProductByIdResponse =
  | GetProductByIdSuccessResponse
  | GetProductsErrorResponse;
