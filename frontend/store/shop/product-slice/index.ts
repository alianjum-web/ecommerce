// shop/product-slice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { Product, ProductDetails } from "@/utils/productInterface";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ProductState {
  isLoading: boolean;
  productList: Product[];
  productDetails: ProductDetails | null;
  error: string | null;
}

const initialState: ProductState = {
  isLoading: false,
  productList: [],
  productDetails: null,
  error: null
};

// Improved error handling with proper typing
interface ApiError {
  message: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}



export const fetchAllFilteredProducts = createAsyncThunk<
  Product[],
  { filterParams: Record<string, string>; sortParams?: string },
  { rejectValue: string }
>(
  "shopProducts/fetchAllFilteredProducts",
  async ({ filterParams, sortParams }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(filterParams);
      if (sortParams) queryParams.append("sortBy", sortParams);

      const response = await axios.get<{ data: Product[] }>(
        `${BASE_URL}/api/shop/products/get?${queryParams.toString()}`
      );
      return response.data.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(err.response?.data?.message || "Failed to fetch products");
    }
  }
);

export const fetchProductDetails = createAsyncThunk<
  ProductDetails,
  string,
  { rejectValue: string }
>(
  "shopProducts/fetchProductDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ data: ProductDetails }>(
        `${BASE_URL}/api/shop/products/get/${id}`
      );
      return response.data.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(err.response?.data?.message || "Failed to fetch product details");
    }
  }
);

const shoppingProductSlice = createSlice({
  name: "shopProducts",
  initialState,
  reducers: {
    resetProductDetails: (state) => {
      state.productDetails = null;
      state.error = null;
    },
    clearProductList: (state) => {
      state.productList = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.isLoading = false;
        state.productList = action.payload;
      })
      .addCase(fetchAllFilteredProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch filtered products";
      })
      .addCase(fetchProductDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action: PayloadAction<ProductDetails>) => {
        state.isLoading = false;
        state.productDetails = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.productDetails = null;
        state.error = action.payload || "Failed to fetch product details";
      });
  },
});

export const { resetProductDetails, clearProductList } = shoppingProductSlice.actions;
export default shoppingProductSlice.reducer;