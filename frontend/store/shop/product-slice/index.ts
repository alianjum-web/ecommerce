import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Product } from "@/utils/productInterface";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ProductState {
    isLoading: boolean;
    productList: Product[];
    productDetails: Product | null;
    error: string | null;
}

const initialState: ProductState = {
    isLoading: false,
    productList: [],
    productDetails: null,
    error: null
}

const fetchData = async <T>(callback: () => Promise<T>): Promise<T> => {
    try {
        return await callback();
    } catch (error: any) {
        throw error.response?.data?.message || "Something went wrong!";
    }
}

export const fetchAllFilteredProducts = createAsyncThunk<
  Product[],
  { filterParams: Record<string, string>; sortParams?: string },
  { rejectValue: string }
>(
  "products/fetchAllFilteredProducts",
  async ({ filterParams, sortParams }, { rejectWithValue }) => {
    return fetchData(async () => {
      const queryParams = new URLSearchParams(filterParams);
      if (sortParams) queryParams.append("sortBy", sortParams);

      const response = await axios.get<{ data: Product[] }>(`${BASE_URL}/api/shop/products/get?${queryParams.toString()}`);
      return response.data.data;
    }).catch((error) => rejectWithValue(error));
  }
);

export const fetchProductDetails = createAsyncThunk<
Product,
string,
{ rejectValue: string }
>(
    "/products/fetchProductDetails",
    async (id, { rejectWithValue }) => {
        return fetchData(async() => {
            const response = await axios.get<{ data: Product }>(
                `${BASE_URL}/api/shop/products/get/${id}`
            );
    
            return response.data.data;
        }).catch((error) => rejectWithValue(error));
    }
)

const shoppingProductSlice = createSlice({
    name: "shoppingProducts",
    initialState,
    reducers: {
        setProductDetails: (state) => {
            state.productDetails = null;
            state.error = null;
        },
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
                state.error = action.payload || "Failed to fetch filtered products"
            })
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
                state.error = action.payload || "Failed to fetch product details";
            });
    },
});

export const { setProductDetails } = shoppingProductSlice.actions;

export default shoppingProductSlice.reducer;