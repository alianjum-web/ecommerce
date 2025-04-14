import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { AxiosError } from "axios";


const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface FeatureImage {
  _id: string;
  imageUrl: string;
}
interface FeatureImageResponse {
  success: boolean;
  data: FeatureImage;
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
};

export const getFeatureImages = createAsyncThunk<
  FeatureImage[],
  void,
  { rejectValue: string }
>("/feature/getFeatureImages", async (_, { rejectWithValue }) => {
  return fetchData(async () => {
    const response = await axios.get<{ data: FeatureImage[] }>(
      `${BASE_URL}/api/common/feature/get`
    );

    return response.data.data;
  }).catch((error) => rejectWithValue(error));
});

export const addFeatureImage = createAsyncThunk<
  FeatureImageResponse, // This is now the fulfilled return type
  string, // Argument type (image URL)
  { rejectValue: string }
>("/order/addFeatureImage", async (image, { rejectWithValue }) => {
  try {
    const response = await axios.post<FeatureImageResponse>(
      `${BASE_URL}/api/common/feature/add`,
      { image }
    );
    return response.data; // Return the full response
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to upload image");
    }
    return rejectWithValue("Failed to upload image");
  }
});



const commonSlice = createSlice({
  name: "commonSlice",
  initialState,
  reducers: {
    resetFeatureImages: (state) => {
      state.featureImageList = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFeatureImages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getFeatureImages.fulfilled,
        (state, action: PayloadAction<FeatureImage[]>) => {
          state.isLoading = false;
          state.featureImageList = action.payload;
        }
      )
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
      .addCase(
        addFeatureImage.fulfilled,
        (state, action: PayloadAction<FeatureImageResponse>) => {
          state.isLoading = false;
          if (action.payload.success) { 
            state.featureImageList.push(action.payload.data);
          }
        }
      )
      .addCase(addFeatureImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to add feature image.";
      });
  },
});

export const { resetFeatureImages } = commonSlice.actions;
export default commonSlice.reducer;
