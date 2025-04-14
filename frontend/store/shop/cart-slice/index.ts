import axios from "axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "@/utils/types";
import { RootState } from "@/store/store";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const syncCartWithServer = createAsyncThunk<
  CartItem[],
  void,
  { state: RootState; rejectValue: string }
>("cart/syncCartWithServer", async (_, { getState, rejectWithValue }) => {
  const { auth, shopCart } = getState();
  if (!auth.user) throw new Error("Not authenticated");

  try {
    // First push local changes to server
    if (shopCart.hasLocalChanges) {
      await axios.post(`${BASE_URL}/api/shop/cart/sync`, {
        userId: auth.user._id,
        items: shopCart.cartItems,
      });
    }

    // Then get latest from server
    const response = await axios.get<{ data: CartItem[] }>(
      `${BASE_URL}/api/shop/cart/get/${auth.user._id}`
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

interface CartState {
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null;
  hasLocalChanges: boolean; // Added property
}
const initialState: CartState = {
  cartItems: [],
  isLoading: false,
  error: null,
  hasLocalChanges: false, // Initialized property
};

const fetchData = async <T>(callback: () => Promise<T>): Promise<T> => {
  try {
    return await callback();
  } catch (error: any) {
    throw error.response?.data?.message || "Something went wrong!";
  }
};

export const addToCart = createAsyncThunk<
  CartItem[],
  { userId: string; productId: string; quantity: number },
  { rejectValue: string }
>(
  "/cart/addToCart",
  async ({ userId, productId, quantity }, { rejectWithValue }) => {
    return fetchData(async () => {
      const response = await axios.post<{ data: CartItem[] }>(
        `${BASE_URL}/api/shop/cart/add`,
        {
          userId,
          productId,
          quantity,
        }
      );

      return response.data.data;
    }).catch((error) => rejectWithValue(error));
  }
);

export const fetchCartItems = createAsyncThunk<
  CartItem[],
  string,
  { rejectValue: string }
>("cart/fetchCartItems", async (userId, { rejectWithValue }) => {
  return fetchData(async () => {
    const response = await axios.get<{ data: CartItem[] }>(
      `${BASE_URL}/api/shop/cart/get/${userId}`
    );
    return response.data.data;
  }).catch((error) => rejectWithValue(error));
});

export const deleteCartItem = createAsyncThunk<
  { success: boolean; data: CartItem[] },
  { userId: string; productId: string },
  { rejectValue: string }
>("cart/daleteCartItem", async ({ userId, productId }, { rejectWithValue }) => {
  return fetchData(async () => {
    const response = await axios.delete<{ success: boolean; data: CartItem[] }>(
      `${BASE_URL}/api/shop/cart/${userId}/${productId}`
    );

    return { success: true, data: response.data.data };
  }).catch((error) => rejectWithValue(error));
});

export const updateCartQuantity = createAsyncThunk<
  { success: boolean; data: CartItem[] }, //  <--  return type
  { userId: string; productId: string; quantity: number },
  { rejectValue: string }
>(
  "cart/updateCartQuantity",
  async ({ userId, productId, quantity }, { rejectWithValue }) => {
    return fetchData(async () => {
      const response = await axios.put<{ success: boolean; data: CartItem[] }>(
        `${BASE_URL}/api/shop/cart/update-cart`,
        {
          userId,
          productId,
          quantity,
        }
      );

      return { success: true, data: response.data.data };
    }).catch((error) => rejectWithValue(error));
  }
);

const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {
    setLocalChanges: (state, action: PayloadAction<boolean>) => {
      state.hasLocalChanges = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncCartWithServer.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        state.hasLocalChanges = false;
      })
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        addToCart.fulfilled,
        (state, action: PayloadAction<CartItem[]>) => {
          state.isLoading = false;
          state.cartItems = action.payload;
        }
      )
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to add item to cart";
      })
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchCartItems.fulfilled,
        (state, action: PayloadAction<CartItem[]>) => {
          state.isLoading = false;
          state.cartItems = action.payload;
        }
      )
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch cart items";
      })
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteCartItem.fulfilled,
        (
          state,
          action: PayloadAction<{ success: boolean; data: CartItem[] }>
        ) => {
          state.isLoading = false;
          state.cartItems = action.payload.data;
        }
      )
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete cart item.";
      })
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateCartQuantity.fulfilled,
        (
          state,
          action: PayloadAction<{ success: boolean; data: CartItem[] }>
        ) => {
          state.isLoading = false;
          state.cartItems = action.payload.data;
        }
      )
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update cart";
      });
  },
});

export default shoppingCartSlice.reducer;
