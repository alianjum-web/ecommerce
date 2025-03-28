import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    isLoading: false,
    reviews: [],
};
interface ProductReview {
    _id: string;
    productId: string; // ID of the reviewed product
    userId: string; // ID of the user who wrote the review
    userName?: string; // (Optional) Username of the reviewer
    reviewMessage?: string; // Review text
    reviewValue: number; // Star rating (1-5)
    createdAt: string;
    updatedAt: string;
  }
  
export const addReview = createAsyncThunk(
    "/order/addReview",
    async (formData) => {
        const response = await axios.post(
            `http://localhost:5000/api/shop/review/add`,
            formData
        );

        return response.data;
    }
);

export const getReviews = createAsyncThunk(
    "/order/getReviews", 
    async (id) => {
        const result = await axios.get(
            `http://loclahost:5000/api/shop/review/${id}`
        );

        return response.data;
    }
);

const reviewSlice = createSlice({
    name: "reviewSlice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getReviews.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getReviews.fulfilled, (state, action) => {
                state.isLoading = false;
                state.reviews = action.payload.data;
            })
            .addCase(getReviews.rejected, (state) => {
                state.isLoading = false;
                state.reviews = [];
            });
    }
});

export default reviewSlice.reducer;