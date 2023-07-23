import { Product } from 'src/product/schema/product.schema';

export interface ProductResponse {
  status: number;
  success: boolean;
  data: Product | null;
}

export interface GetAllProductsResponse {
  status: number;
  success: boolean;
  response: Product[];
}
