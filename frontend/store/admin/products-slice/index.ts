import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

interface AdminProductsState {
  isLoading: boolean;
  productList: Product[];
  error: string | null;
}

const initialState: AdminProductsState = {
  isLoading: false,
  productList: [],
  error: null
};

// Reuseable API call Helper Function
const fetchData = async <T>(callback: () => Promise<T>): Promise<T> => {
  try {
    return await callback();
  } catch (error: any) {
    throw error.response?.data?.message || "Something went wrong!";
  }
}

// create async function for API call
export const addNewProduct = createAsyncThunk<Product, Product>(
  "products/addNewProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const result = await axios.post<Product>(`${BASE_URL}/api/admin/product/add`,
        formData, {
          headers: { "Content-Type": "application/json" },
        }
      )

      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add Product")
    }
  }
)


export const fetchAllProducts = createAsyncThunk<Product[]>(
  "products/fetchAllProducts",
  async (_, { rejectWithValue }) => {
    return fetchData(async () => {
      const result = await axios.get<Product[]>(`${BASE_URL}/api/admin/product/get`);
      return result.data;
    }).catch((error) => rejectWithValue(error));
  }
);

export const editProduct = createAsyncThunk<Product, { id: number; formData: Product }>(
  "products/editProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    return fetchData(async () => {
      const result = await axios.put<Product>(`${BASE_URL}/api/admin/product/edit/${id}`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      return result.data;
    }).catch((error) => rejectWithValue(error));
  }
);

export const deleteProduct = createAsyncThunk<number, number>(
  "products/deleteProduct",
  async (id, { rejectWithValue }) => {
    return fetchData(async() => {
      await axios.delete(`${BASE_URL}/api/admin/product/delete/${id}`)
      return id;
    }).catch((error) => rejectWithValue(error));
  }
)

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
      .addCase(fetchAllProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.isLoading = false;
        state.productList = action.payload;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // add new product
      .addCase(addNewProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.productList.push(action.payload);
      })
      .addCase(editProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        const index = state.productList.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.productList[index] = action.payload;
      }) 
     // Delete Product
     .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<number>) => {
      state.productList = state.productList.filter((p) => p.id !== action.payload);
    });
},
});

export default adminProductsSlice.reducer;