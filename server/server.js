import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth/auth-routes";
import adminProductsRouter from "./routes/admin/products-routes";
import adminOrderRouter from "./routes/admin/order-routes";

import shopProductsRouter from "./routes/shop/products-routes";
import shopCartRouter from "./routes/shop/cart-routes";
import shopAddressRouter from "./routes/shop/address-routes";
import shopOrderRouter from "./routes/shop/order-routes";
import shopSearchRouter from "./routes/shop/search-routes";
import shopReviewRouter from "./routes/shop/review-routes";

import commonFeatureRouter from "./routes/common/feature-routes";

//create a database connection -> u can also
//create a separate file for this and then import/use that file here
dotenv.config();
const uri = process.env.MONGODB_URI;
mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);

app.use("/api/common/feature", commonFeatureRouter);

app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));
