import mongoose, { Schema } from "mongoose";

const OrderSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Child who placed the order
  },
  payerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Father (or another person) who is paying
  },
  cartItems: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      title: String,
      image: String,
      price: String,
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  addressInfo: {
    addressId: String,
    address: String,
    city: String,
    pincode: String,
    phone: String,
    notes: String,
  },
  orderStatus: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["credit_card", "paypal", "bank_transfer", "cash_on_delivery"],
    required: true,
  },
  paymentStatus: {
    type: String,
     enum: ["pending", "paid", "failed" ],
     default: "pending",
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  orderUpdateDate: Date,
  paymentId: {
    type: String,
    required: function() {  //ensures that paymentId is only required when the payment has been successfully completed.
      return this.paymentStatus === "paid"
    }
  },
},  { timestamps: true } );
export const Order = mongoose.model("Order", OrderSchema);
