import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ API Base URL from Environment Variables
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/shop/products";

// ✅ Define TypeScript Interfaces
interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description?: string;
}

interface ProductState {
  isLoading: boolean;
  productList: Product[];
  productDetails: Product | null;
  error: string | null;
}

// ✅ Initial State with Explicit Type
const initialState: ProductState = {
  isLoading: false,
  productList: [],
  productDetails: null,
  error: null,
};

// ✅ Generic API Fetcher for Reusability
const fetchData = async <T>(callback: () => Promise<T>): Promise<T> => {
  try {
    return await callback();
  } catch (error: any) {
    throw error.response?.data?.message || "Something went wrong!";
  }
};

// ✅ Fetch All Filtered Products
export const fetchAllFilteredProducts = createAsyncThunk<
  Product[],
  { filterParams: Record<string, string>; sortParams?: string },
  { rejectValue: string }
>(
  "products/fetchAllFilteredProducts",
  async ({ filterParams, sortParams }, { rejectWithValue }) => {
    return fetchData(async () => {
      const query = new URLSearchParams({ ...filterParams, sortBy: sortParams }).toString();
      const response = await axios.get<{ data: Product[] }>(`${BASE_URL}/get?${query}`);
      return response.data.data;
    }).catch((error) => rejectWithValue(error));
  }
);

// ✅ Fetch Product Details
export const fetchProductDetails = createAsyncThunk<Product, string, { rejectValue: string }>(
  "products/fetchProductDetails",
  async (id, { rejectWithValue }) => {
    return fetchData(async () => {
      const response = await axios.get<{ data: Product }>(`${BASE_URL}/get/${id}`);
      return response.data.data;
    }).catch((error) => rejectWithValue(error));
  }
);

// ✅ Redux Slice
const shoppingProductSlice = createSlice({
  name: "shoppingProducts",
  initialState,
  reducers: {
    resetProductDetails: (state) => {
      state.productDetails = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔵 Fetch All Products
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
        state.productList = [];
        state.error = action.payload || "Failed to fetch products.";
      })

      // 🔵 Fetch Product Details
      .addCase(fetchProductDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action: PayloadAction<Product>) => {
        state.isLoading = false;
        state.productDetails = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.productDetails = null;
        state.error = action.payload || "Failed to fetch product details.";
      });
  },
});

// ✅ Export Actions & Reducer
export const { resetProductDetails } = shoppingProductSlice.actions;
export default shoppingProductSlice.reducer;

