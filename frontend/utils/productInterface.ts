export interface Product {
    _id: string; // Use _id for MongoDB consistency
    title: string; // Keep it 'title' instead of 'name'
    price: number;
    imageUrl: string;
    description?: string;
    category?: string;
    brand?: string;
    salePrice?: number;
    totalStock?: number;
    averageReview?: number;
    createdAt?: string;
    updatedAt?: string;
  }
  