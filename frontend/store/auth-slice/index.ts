// authSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { User } from "@/utils/types";
import type { RegisterFormData, LoginFormData } from "@/utils/auth";
import { persistConfig } from "../store";

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

// Improved apiCall helper with better error handling
const apiCall = async <T>(url: string, method: string, data?: any) => {
  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${url}`, // Removed duplicate /api/auth prefix
      data,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        "Something went wrong";
    throw new Error(errorMessage);
  }
};

export const registerUser = createAsyncThunk<User, RegisterFormData, { rejectValue: string }>(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await apiCall<{ user: User }>("/api/auth/register", "POST", formData);
      if (!data.user) throw new Error("User data not received");
      return data.user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginUser = createAsyncThunk<User, LoginFormData, { rejectValue: string }>(
  "auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await apiCall<{ user: User }>("/api/auth/login", "POST", formData);
      if (!data.user) throw new Error("User data not received");
      return data.user;
    } catch (error: any) {
      return rejectWithValue(error.message);
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
      return rejectWithValue(error.message);
    }
  }
);

export const checkAuth = createAsyncThunk<User, void, { rejectValue: string }>(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ user: User }>(`${BASE_URL}/api/auth/check-auth`, {
        withCredentials: true
      })
      
      if (!response.data.user) {
        // Clear invalid persisted data
        localStorage.removeItem(`persist:${persistConfig.key}`)
        throw new Error('Session expired')
      }
      
      return response.data.user
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isInitialized = true; // Ensure we mark as initialized even on reset
    },
  },
  extraReducers: (builder) => {
    builder
      // Register User
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.error = null;
      })
      
      // Login User
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.error = null;
      })
      
      // Check Auth
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.user = null;
      })
      
      // Logout User
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Logout failed";
      });

    // Generic matchers
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
          // If any auth request fails, consider user not authenticated
          // Except for logout which might fail but we still want to clear auth
          if (!action.type.includes('logout')) {
            state.isAuthenticated = false;
            state.user = null;
          }
        }
      );
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;