// src/types.ts
export interface CartItem {
    productId: string;
    title: string;
    image: string;
    price: number;
    quantity: number;
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
  