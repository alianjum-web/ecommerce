import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Review } from "@/utils/productReview";
import { error } from "console";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ReviewState {
    isLoading: boolean;
    reviews: Review[];
    error: string | null;
}

const initialState: ReviewState = {
    isLoading: false,
    reviews: [],
    error: null,
}

const fetchData = async <T>(callback: () => Promise<T>): Promise<T> => {
    try {
        return await callback()
    } catch (error: any) {
        throw error.response?.message || "Something went wrong!";
    }
}

export const addReview = createAsyncThunk<
Review[],
Review,
{ rejectValue: string }
>(
    "/order/addReview",
    async (formData, { rejectWithValue }) => {
        return fetchData(async () => {
            const response = await axios.post<{ data: Review[] }>(
                `${BASE_URL}api/shop/review/add`,
                formData
            );
    
            return response.data.data;
        }).catch((error) => rejectWithValue(error))
    }
);

export const getReviews = createAsyncThunk<
Review[],
string,
{ rejectValue: string }
>(
    "/order/getReviews", 
    async (id, { rejectWithValue }) => {
        return fetchData(async () => {
            const response = await axios.get<{ data: Review[] }>(
                `${BASE_URL}/api/shop/review/${id}`
            );
    
            return response.data.data;
        }).catch((error) => rejectWithValue(error))
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
                state.error = null;
            })
            .addCase(getReviews.fulfilled, (state, action: PayloadAction<Review[]>) => {
                state.isLoading = false;
                state.reviews = action.payload;
            })
            .addCase(getReviews.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch reviews"
            })
            .addCase(addReview.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addReview.fulfilled, (state, action: PayloadAction<Review[]>) => {
                state.isLoading = false;
                state.reviews = action.payload;
            })
            .addCase(addReview.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to add reviews"
            })
    }
});

export default reviewSlice.reducer;