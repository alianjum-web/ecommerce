import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { error } from "console";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ProductSearchResult {
  _id: string;
  imageUrl: string;
  imagePublicId: string;
  title: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  salePrice?: number; // Optional as it might not always be present
  totalStock: number;
  averageReview: number; // 1-5 range
  createdAt: string;
  updatedAt: string;
}

interface SearchState {
  isLoading: boolean;
  searchResults: ProductSearchResult[];
  error: string | null;
}

const initialState: SearchState = {
  isLoading: false,
  searchResults: [],
  error: null,
};

const fetchData = async <T>(callback: () => Promise<T>): Promise<T> => {
  try {
    return await callback();
  } catch (error: any) {
    throw error.response?.data?.message || "Something went wrong!";
  }
};

export const getSearchResults = createAsyncThunk<
  ProductSearchResult[],
  string,
  { rejectValue: string }
>("/order/getSearchResults", async (keyword, { rejectWithValue }) => {
  return fetchData(async () => {
    const response = await axios.get<{ data: ProductSearchResult[] }>(
      `${BASE_URL}/api/shop/search/${keyword}`
    );

    return response.data.data;
  }).catch((error) => rejectWithValue(error));
});

const searchSlice = createSlice({
  name: "searchSlice",
  initialState,
  reducers: {
    resetSearchResults: (state) => {
      state.searchResults = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSearchResults.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSearchResults.fulfilled, (state, action: PayloadAction<ProductSearchResult[]>) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(getSearchResults.rejected, (state, action) => {
        state.isLoading = false;
        state.searchResults = [];
        state.error = action.payload || "Failed to fetch search results.";
      });
  },
});

export const { resetSearchResults } = searchSlice.actions;

export default searchSlice.reducer;
