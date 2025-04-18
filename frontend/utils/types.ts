// src/types.ts
export type UserRole = "buyer" | "seller" | "admin";

export interface User {
  _id: string; // MongoDB ObjectId as a string
  userName: string;
  fullName: string;
  email: string;
  password: string;
  token?: string;
  role: UserRole; // Only these three roles are allowed
  createdAt?: string; // Will be set by server
  updatedAt?: string; // Will be set by server
}
export type RoutePermissions = {
  [key in UserRole]: string[];
};

export const ROUTE_PERMISSIONS: RoutePermissions = {
  admin: ["/admin", "/shop", "/seller"], // Admin can access everything
  seller: ["/seller/dashboard", "/seller/products", "/shop"], // Seller can access seller dashboard and shop
  buyer: ["/shop"], // Buyer can only access shop routes
};

export const DEFAULT_ROUTES: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  seller: "/seller/dashboard",
  buyer: "/shop/home",
};

export interface CartItem {
  _id: string;
  userId: string;
  title: string;
  image: string;
  price: number;
  productId: string;
  quantity: number;
  salePrice: number;
}

// Basic cart item (without title/image for cart use)
export interface CartItemBasic {
  productId: string;
  quantity: number;
}

// Address Interface
export interface AddressInfo {
  addressId?: string; // Optional because MongoDB generates _id
  userId: string; // Required based on the model
  address: string;
  city: string;
  pincode: string;
  phone: string;
  notes?: string;
  createdAt?: string; // Optional, since MongoDB timestamps them
  updatedAt?: string;
}

// Enum for order statuses
export enum OrderStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  Shipped = "shipped",
  Delivered = "delivered",
  Cancelled = "cancelled",
}

// Enum for payment methods
export enum PaymentMethod {
  CreditCard = "credit_card",
  PayPal = "paypal",
  BankTransfer = "bank_transfer",
  CashOnDelivery = "cash_on_delivery",
}

// Enum for payment statuses
export enum PaymentStatus {
  Pending = "pending",
  Paid = "paid",
  Failed = "failed",
}

type RegisterFormData = {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string; // For password confirmation field
};


interface AuthResponseData {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
  message?: string;
}