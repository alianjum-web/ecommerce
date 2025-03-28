import axios from "axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

interface CartState {
    cartItems: CartItem[];
    isLoading: boolean;
    error: string | null;
}

const initialState: CartState = {
    cartItems: [],
    isLoading: false,
    error: null,
};

const fetchData = async <T>(callback: () => Promise<T>): Promise<T> => {
    try {
        return await callback();
    } catch (error: any) {
        throw error.response?.data?.message || "Something went wrong!"
    }
}

export const addToCart = createAsyncThunk<CartItem[],
{ userId: string; productId: string; quantity: number},
{ rejectValue: string }
>(
    "/cart/addToCart",
    async ({ userId, productId, quantity }, { rejectWithValue }) => {
        return fetchData(async() => {
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
    const response = await axios.get<{ data: CartItem[] }>(`${BASE_URL}/api/shop/cart/get/${userId}`);
    return response.data.data;
  }).catch((error) => rejectWithValue(error));
});

export const deleteCartItem = createAsyncThunk<
CartItem[],
{ userId: string; productId: string },
{ rejectValue: string }
>(
    "cart/daleteCartItem",
    async ({ userId, productId}, { rejectWithValue }) => {
        return fetchData(async () => {
            const response = await axios.delete<{ data: CartItem[] }>(
                `${BASE_URL}/api/shop/cart/${userId}/${productId}`
            );
    
            return response.data.data;
        }).catch((error) => rejectWithValue(error));
    }
)

export const updateCartQuantity = createAsyncThunk<
CartItem[],
{ userId: string; productId: string; quantity: number },
{ rejectValue: string }
 >(
    "cart/updateCartQuantity",
    async ({ userId, productId, quantity }, { rejectWithValue }) => {
        return fetchData(async () => {
            const response = await axios.put<{ data: CartItem[] }>(
                `${BASE_URL}/api/shop/cart/update-cart`,
                {
                    userId,
                    productId,
                    quantity,
                }
            );
    
            return response.data.data;
        }).catch((error) => rejectWithValue(error));
    }
)

const shoppingCartSlice = createSlice({
    name: "shoppingCart",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder 
            .addCase(addToCart.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addToCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
                state.isLoading = false;
                state.cartItems = action.payload;
            })
            .addCase(addToCart.rejected, (state,action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to add item to cart"
            })
            .addCase(fetchCartItems.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCartItems.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
                state.isLoading = false;
                state.cartItems = action.payload;
            })
            .addCase(fetchCartItems.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch cart items";
            })
            .addCase(deleteCartItem.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteCartItem.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
                state.isLoading = false;
                state.cartItems = action.payload;
            })
            .addCase(deleteCartItem.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to delete cart item.";
            })
            .addCase(updateCartQuantity.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateCartQuantity.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
                state.isLoading = false;
                state.cartItems = action.payload;
            })
            .addCase(updateCartQuantity.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to update cart"
            })
    }   
});

export default shoppingCartSlice.reducer;