// authSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { User } from "@/utils/types";
import type { RegisterFormData, LoginFormData } from "@/utils/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
  isInitialized: false,
};

// Helper function for API calls
const apiCall = async <T>(url: string, method: string, data?: any) => {
  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${url}`,
      data,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Something went wrong";
  }
};

export const registerUser = createAsyncThunk<User, RegisterFormData, { rejectValue: string }>(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await apiCall<{ user: User }>("/api/auth/register", "POST", formData);
      return data.user;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

export const loginUser = createAsyncThunk<User, LoginFormData, { rejectValue: string }>(
  "auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await apiCall<{ user: User }>("/api/auth/login", "POST", formData);
      return data.user;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await apiCall("/api/auth/logout", "POST");
      return undefined; // Explicitly return undefined
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

export const checkAuth = createAsyncThunk<User, void, { rejectValue: string }>(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiCall<{ user: User }>("/api/auth/check-auth", "GET");
      return data.user;
    } catch (error: any) {
      return rejectWithValue(error);
    }
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
    },
  },
  extraReducers: (builder) => {
    // First handle all specific cases
    builder
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
      });

    // Then add matchers
    builder
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error = action.payload || "Request failed";
        }
      );
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;