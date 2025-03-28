import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Address {
  userId: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  notes: string;
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

const fetchData = async <T>(callback: () => Promise<T>): Promise<T> => {
  try {
    return await callback();
  } catch (error: any) {
    throw error.response?.data?.message || "Something went wrong!";
  }
};
export const addNewAddress = createAsyncThunk<
  Address[],
  { userId: string; formData: Address },
  { rejectValue: string }
>(
  "address/addNewAddress",
  async ({ userId, formData }, { rejectWithValue }) => {
    return fetchData(async () => {
      const response = await axios.post<{ data: Address[] }>(
        `${BASE_URL}/api/shop/address/add/${userId}`,
        formData
      );
      return response.data.data;
    }).catch((error) => rejectWithValue(error));
  }
);

export const fetchAllAddress = createAsyncThunk<
  Address[],
  string,
  { rejectValue: string }
>("/address/fetchAllAddress", async (userId, { rejectWithValue }) => {
  return fetchData(async () => {
    const response = await axios.get(
      `${BASE_URL}/api/shop/address/get/${userId}`
    );

    return response.data.data;
  }).catch((error) => rejectWithValue(error));
});

export const editAddress = createAsyncThunk<
  Address[],
  { userId: string; addressId: string; formData: Address },
  { rejectValue: string }
>(
  "address/editAddress",
  async ({ userId, addressId, formData }, { rejectWithValue }) => {
    return fetchData(async () => {
      const response = await axios.put<{ data: Address[] }>(
        `${BASE_URL}/api/shop/address/update/${userId}/${addressId}`,
        formData
      );
      return response.data.data;
    }).catch((error) => rejectWithValue(error));
  }
);

export const deleteAddress = createAsyncThunk<Address[],
{userId: string, addressId: string},
{ rejectValue: string }>(
  "/addressess/deleteAddresses",
  async ({ userId, addressId }, { rejectWithValue }) => {
    return fetchData(async () => {
      const response = await axios.delete<{ data: Address[] }>(
        `${BASE_URL}/api/shop/address/delete/${userId}/${addressId}`
      );
  
      return response.data.data;
    }).catch((error) => rejectWithValue(error));
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addNewAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addNewAddress.fulfilled, (state, action: PayloadAction<Address[]>) => {
        state.isLoading = false;
        state.addressList = action.payload;
      })
      .addCase(addNewAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to add new address";
      })
      .addCase(fetchAllAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllAddress.fulfilled, (state, action: PayloadAction<Address[]>) => {
        state.isLoading = false;
        state.addressList = action.payload;
      })
      .addCase(fetchAllAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch addresses.";
      })
      .addCase(editAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(editAddress.fulfilled, (state, action: PayloadAction<Address[]>) => {
        state.isLoading = false;
        state.addressList = action.payload;
      })
      .addCase(editAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to edit address.";
      })
      .addCase(deleteAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action: PayloadAction<Address[]>) => {
        state.isLoading = false;
        state.addressList = action.payload;
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete address.";
      });
  },
});

export default addressSlice.reducer;
