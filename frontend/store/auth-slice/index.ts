// authSlice.ts
import { createAsyncThunk, createSlice, PayloadAction, isRejectedWithValue } from "@reduxjs/toolkit";
import axios from "axios";
import type { User } from "@/utils/types";
import type { RegisterFormData, LoginFormData } from "@/utils/auth";
import { persistConfig } from "../store";
import type { RootState } from "../store";

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
const apiCall = async <T>(url: string, method: string, data?: any): Promise<T> => {
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
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        "Something went wrong";
    throw new Error(errorMessage);
  }
};

type ThunkApiConfig = {
  state: RootState;
  rejectValue: string;
}

export const registerUser = createAsyncThunk<User, RegisterFormData, ThunkApiConfig>(
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

export const loginUser = createAsyncThunk<User, LoginFormData, ThunkApiConfig>(
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

export const logoutUser = createAsyncThunk<void, void, ThunkApiConfig>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await apiCall("/api/auth/logout", "POST");
      return; // Explicitly return undefined on success
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkAuth = createAsyncThunk<User, void, ThunkApiConfig>(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ user: User }>(`${BASE_URL}/api/auth/check-auth`, {
        withCredentials: true
      });
      
      if (!response.data.user) {
        localStorage.removeItem(`persist:${persistConfig.key}`);
        throw new Error('Session expired');
      }
      
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to check authentication');
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
      state.isInitialized = true;
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
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.isInitialized = true;
        state.error = action.payload || 'Authentication check failed';
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
      })

      // Generic matchers
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        isRejectedWithValue,
        (state, action) => {
          const payloadAction = action as PayloadAction<string | undefined>;
          state.isLoading = false;
          state.error = payloadAction.payload || "Request failed";
          if (!payloadAction.type.includes('logout')) {
            state.isAuthenticated = false;
            state.user = null;
          }
        }
      );
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;