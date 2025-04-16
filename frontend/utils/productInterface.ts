
// types/product.ts
export interface Product {
  _id: string;
  title: string;
  price: number;
  imageUrl: string;
  imagePublicId?: string; 
  description?: string;
  category?: string;
  brand?: string;
  salePrice?: number;
  totalStock?: number;
  averageReview?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductDetails extends Product {
  // All properties from Product plus additional detailed fields
  imageUrl: string;
  imagePublicId: string;
  // You might want to add these for detailed view:
  specifications?: Record<string, string>; // Key-value pairs for specs
  reviews?: {
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];
  relatedProducts?: Product[];
  sellerInfo?: {
    name: string;
    rating: number;
    contact?: string;
  };
}

export interface ProductFormValues {
  image: File | null;
  title: string;
  description: string;
  category: string;
  brand: string;
  price: string;
  salePrice: string;
  totalStock: string;
}
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
