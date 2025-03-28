export interface Review {
    _id: string; // MongoDB ObjectId as a string
    productId: string;
    userId: string;
    userName?: string; // Optional if not always provided
    reviewMessage?: string; // Optional since it may be empty
    reviewValue: number; // Must be between 1 and 5
    createdAt: string;
    updatedAt: string;
  }
  