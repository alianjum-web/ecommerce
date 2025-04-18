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
      title: { type: String, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },      
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
    default: Date.now
  },
  updateOrderDate: Date,
  paymentId: {
    type: String,
    required: function() {  //ensures that paymentId is only required when the payment has been successfully completed.and status is paid
      return this.paymentStatus === "paid"
    }
  },
},  { timestamps: true } );


// ✅ **Add Indexing for Faster Queries**
OrderSchema.index({ userId: 1, payerId: 1, orderDate: -1 });

export const Order = mongoose.model("Order", OrderSchema);

/*

0 – 5,000 orders → Indexing is optional (small dataset, queries will still be fast).
5,000 – 10,000 orders → Consider adding the index if queries start slowing down.
10,000+ orders → Indexing is highly recommended to keep performance smooth.
100,000+ orders → Indexing is a must, and you may also need sharding or caching.
If your client’s business is expected to grow rapidly, it’s better to add the index early.

 */