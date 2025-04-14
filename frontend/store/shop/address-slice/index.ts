import { createSlice, createAsyncThunk, PayloadAction, ActionCreatorWithPreparedPayload } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "@/store/store";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface Address {
  _id: string;
  userId: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  notes: string; // Changed from optional to required
}

interface AddressState {
  isLoading: boolean;
  addressList: Address[];
  error: string | null;
}

const initialState: AddressState = {
  isLoading: false,
  addressList: [],
  error: null,
};

// Unified API response type
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Helper type for matcher predicates
type PendingAction = { type: string };
type RejectedAction = { type: string; payload?: string };
type FulfilledAddressAction = { type: string; payload: Address[] };

export const syncAddresses = createAsyncThunk<
  Address[],
  void,
  { state: RootState; rejectValue: string }
>("address/syncAddresses", async (_, { getState, rejectWithValue }) => {
  const { auth } = getState();
  if (!auth.user) throw new Error("Not authenticated");

  try {
    const response = await axios.get<ApiResponse<Address[]>>(
      `${BASE_URL}/api/shop/address/get/${auth.user._id}`
    );
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to sync addresses"
    );
  }
});

export const addNewAddress = createAsyncThunk<
  Address[],
  { userId: string; formData: Address },
  { rejectValue: string }
>(
  "address/addNewAddress",
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.post<ApiResponse<Address[]>>(
        `${BASE_URL}/api/shop/address/add/${userId}`,
        { ...formData, notes: formData.notes || "" } // Ensure notes is never undefined
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add address"
      );
    }
  }
);

export const fetchAllAddress = createAsyncThunk<
  Address[],
  string,
  { rejectValue: string }
>("address/fetchAllAddress", async (userId, { rejectWithValue }) => {
  try {
    const response = await axios.get<ApiResponse<Address[]>>(
      `${BASE_URL}/api/shop/address/get/${userId}`
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch addresses"
    );
  }
});

export const editAddress = createAsyncThunk<
  Address[],
  { userId: string; addressId: string; formData: Address },
  { rejectValue: string }
>(
  "address/editAddress",
  async ({ userId, addressId, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put<ApiResponse<Address[]>>(
        `${BASE_URL}/api/shop/address/update/${userId}/${addressId}`,
        { ...formData, notes: formData.notes || "" }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update address"
      );
    }
  }
);

export const deleteAddress = createAsyncThunk<
  Address[],
  { userId: string; addressId: string },
  { rejectValue: string }
>(
  "address/deleteAddress",
  async ({ userId, addressId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete<ApiResponse<Address[]>>(
        `${BASE_URL}/api/shop/address/delete/${userId}/${addressId}`
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete address"
      );
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(syncAddresses.fulfilled, (state, action: PayloadAction<Address[]>) => {
        state.addressList = action.payload;
      })
      .addMatcher(
        (action): action is PendingAction => action.type.endsWith("/pending"),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action): action is RejectedAction => action.type.endsWith("/rejected"),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload || "Request failed";
        }
      )
      .addMatcher(
        (action): action is FulfilledAddressAction => 
          action.type.endsWith("/fulfilled") && 
          Array.isArray(action.payload),
        (state, action) => {
          state.isLoading = false;
          state.addressList = action.payload;
        }
      );
  },
});

export default addressSlice.reducer;
