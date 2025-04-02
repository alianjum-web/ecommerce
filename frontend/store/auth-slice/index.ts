import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface User {
    _id: string; // MongoDB ObjectId as a string
    userName: string;
    fullName: string;
    email: string;
    password: string;
    role: "buyer" | "seller" | "admin"; // Only these three roles are allowed
    createdAt: string;
    updatedAt: string;
  }
  

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    error: string | null;
}

const initialState: AuthState = { 
    isAuthenticated: false,
    isLoading: false,
    user: null,
    error: null,
};
// Generic API Fetcher for Reusability 
const fetchData = async <T>(callback: () => Promise<T>): Promise<T> => {
    try {
        return await callback();
    } catch (error: any) {
        throw error.response?.data?.message || "Something went wrong"
    }
}
export const registerUser = createAsyncThunk<User, FormData, {
    rejectValue: string }>(
    "auth/register",
    async (formData, { rejectWithValue }) => {
        return fetchData(async () => {
            const response = await axios.post<{user: User}>(
                `${BASE_URL}/api/auth/register`, formData, { withCredentials: true }
            );
            return response.data.user;
        }).catch((error) => rejectWithValue(error));
    }
);


export const loginUser = createAsyncThunk<User, FormData, { rejectValue: string }>(
    "auth/login",
    async (formData, { rejectWithValue }) => {
      return fetchData(async () => {
        const response = await axios.post<{ user: User }>(`${BASE_URL}/login`, formData, { withCredentials: true });
        return response.data.user;
      }).catch((error) => rejectWithValue(error));
    }
  );

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        return fetchData(async () => {
            const response = await axios.post(
                `${BASE_URL}/api/auth/logout`, {}, {
                    withCredentials: true
                }
            )
        }).catch((error) => rejectWithValue(error));
    }
);

export const checkAuth = createAsyncThunk<User, void, { rejectValue: string }>(
    "auth/checkAuth",
    async (_, { rejectWithValue }) => {
      return fetchData(async () => {
        const response = await axios.get<{ user: User }>(`${BASE_URL}/check-auth`, {
          withCredentials: true,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        });
        return response.data.user;
      }).catch((error) => rejectWithValue(error));
    }
  );
  

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        resetAuthState: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to register";
            })
            .addCase(loginUser.pending, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to log in.";
            })
            .addCase(checkAuth.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(checkAuth.rejected, (state, action) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = action.payload || "Authentication check failed"
            })
            .addCase(logoutUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
            });
    },
});

// export reducers and actions 
export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;