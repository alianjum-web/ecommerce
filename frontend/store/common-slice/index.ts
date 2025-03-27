import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
//   /api/common/feature

interface FeatureImage {
  id: string;
  url: string;
}

interface CommonState {
  isLoading: boolean;
  featureImageList: FeatureImage[];
  error: string | null;
  
}
const initialState: CommonState = {
  isLoading: false,
  featureImageList: [],
  error: null,
};

const fetchData = async <T>(callback: () => Promise<T>): Promise<T> => {
  try {
    return await callback();
  } catch (error: any) {
    throw error.response?.data?.message || "Something went wrong!";
  }
}

export const getFeatureImages = createAsyncThunk<FeatureImage[], void, { rejectValue: string }>(
  "/feature/getFeatureImages",
  async (_, { rejectWithValue }) => {
    return fetchData(async () => {
      const response = await axios.get<{ data: FeatureImage[]  }>(
        `${BASE_URL}/api/common/feature/get`
      );
  
      return response.data.data;
    }).catch((error) => rejectWithValue(error))
   
  }
);

export const addFeatureImage = createAsyncThunk<FeatureImage, string, { rejectValue: string }>(
  "/order/addFeatureImage",
  async (image, { rejectWithValue }) => {
    return fetchData(async () => {
      const response = await axios.post<{ data: FeatureImage }>(
        `${BASE_URL}/api/common/feature/add`,
        { image }
      );
  
      return response.data.data;
    }).catch((error) => rejectWithValue(error));
    
  }
);

const commonSlice = createSlice({
  name: "commonSlice",
  initialState,
  reducers: {
    resetFeatureImages: (state) => {
      state.featureImageList = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFeatureImages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFeatureImages.fulfilled, (state, action: PayloadAction<FeatureImage[]>) => {
        state.isLoading = false;
        state.featureImageList = action.payload;
      })
      .addCase(getFeatureImages.rejected, (state, action) => {
        state.isLoading = false;
        state.featureImageList = [];
        state.error = action.payload || "Failed to fetch fetch featureImages.";
      })
      // Add feature image
      .addCase(addFeatureImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addFeatureImage.fulfilled, (state, action: PayloadAction<FeatureImage>) => {
        state.isLoading = false;
        state.featureImageList.push(action.payload);
      })
      .addCase(addFeatureImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to add feature image.";
      })
  },
});

export const { resetFeatureImages } = commonSlice.actions;
export default commonSlice.reducer;
