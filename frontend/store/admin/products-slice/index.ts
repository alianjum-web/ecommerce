import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Product, ApiResponse } from "@/utils/productInterface";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";



interface AdminProductsState {
  isLoading: boolean;
  productList: Product[];
  error: string | null;
}

const initialState: AdminProductsState = {
  isLoading: false,
  productList: [],
  error: null,
};

// Reuseable API call Helper Function
const fetchData = async <T>(callback: () => Promise<T>): Promise<T> => {
  try {
    return await callback();
  } catch (error: any) {
    throw error.response?.data?.message || "Something went wrong!";
  }
};


export const fetchAllProducts = createAsyncThunk<Product[]>(
  "products/fetchAllProducts",
  async (_, { rejectWithValue }) => {
    return fetchData(async () => {
      const result = await axios.get<Product[]>(
        `${BASE_URL}/api/admin/product/get`
      );
      return result.data;
    }).catch((error) => rejectWithValue(error));
  }
);

// products-slice.ts
export const addNewProduct = createAsyncThunk<
  Product, // Return type when fulfilled
  Omit<Product, '_id' | 'createdAt' | 'updatedAt'>, // Input type
  { rejectValue: string }
>(
  "products/addNewProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post<ApiResponse<Product>>(
        `${BASE_URL}/api/admin/product/add`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to add product");
      }
      
      if (!response.data.data) {
        return rejectWithValue("No product data returned");
      }
      
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add Product"
      );
    }
  }
);

export const editProduct = createAsyncThunk<
  Product,
  { id: string; formData: Partial<Product> },
  { rejectValue: string }
>(
  "products/editProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put<ApiResponse<Product>>(
        `${BASE_URL}/api/admin/product/edit/${id}`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to edit product");
      }
      
      if (!response.data.data) {
        return rejectWithValue("No product data returned");
      }
      
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to edit Product"
      );
    }
  }
);


export const deleteProduct = createAsyncThunk<
  { success: boolean; id: string }, // Fulfilled return type
  string, // Argument type (id)
  { rejectValue: string }
>(
  "products/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete<{ 
        success: boolean;
        message?: string;
      }>(`${BASE_URL}/api/admin/product/delete/${id}`);
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to delete product");
      }
      
      return { success: true, id };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete product"
      );
    }
  }
);

const adminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchAllProducts.fulfilled,
        (state, action: PayloadAction<Product[]>) => {
          state.isLoading = false;
          state.productList = action.payload;
        }
      )
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // add new product
      .addCase(
        addNewProduct.fulfilled,
        (state, action: PayloadAction<Product>) => {
          state.productList.push(action.payload);
        }
      )
      .addCase(
        editProduct.fulfilled,
        (state, action: PayloadAction<Product>) => {
          const index = state.productList.findIndex(
            (p) => p._id === action.payload._id
          );
          if (index !== -1) state.productList[index] = action.payload;
        }
      )
      // Delete Product
      .addCase(
        deleteProduct.fulfilled,
        (state, action: PayloadAction<{ success: boolean, id: string }>) => {
          state.productList = state.productList.filter(
            (p) => p._id !== action.payload.id
          );
        }
      );
  },
});

export default adminProductsSlice.reducer;
