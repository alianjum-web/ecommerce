import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { create } from "domain";
import { buildCreateApi, retry } from "@reduxjs/toolkit/query";
import { Satellite } from "lucide-react";

const initialState = {
    cartItems: [],
    isLoading: false,
};

export const addToCart = createAsyncThunk(
    "/cart/addToCart",
    async ({ userId, productId, quantity }) => {
        const response = await axios.post(
            "http://localhost:5000/api/shop/cart/add",
            {
                userId,
                productId,
                quantity,
            }
        );

        return response.data;
    }
);


export const fetchCartItems = createAsyncThunk(
    "/cart/fetchCartItems",
    async ( userId ) => {
        const response = await axios.get(
            `http://localhost:5000/api/shop/cart/get/${userId}`
        );

        return response.data;
    }
);

export const deleteCartItem = createAsyncThunk(
    "cart/daleteCartItem",
    async ({ userId, productId}) => {
        const response = await axios.delete(
            `http://localhost:5000/api/shop/cart/${userId}/${productId}`
        );

        return response.data;
    }
)

export const updateCartQuantity = createAsyncThunk(
    "cart/updateCartQuantity",
    async ({ userId, productId, quantity }) => {
        const response = await axios.put(
            "http://localhost:5000/api/shop/cart/update-cart",
            {
                userId,
                productId,
                quantity,
            }
        );

        return response.data;
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
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.isLoading = false;
                state.cartItems = action.payload.data;
            })
            .addCase(addToCart.rejected, (state) => {
                state.isLoading = false;
                state.cartItems = [];
            })
            .addCase(fetchCartItems.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCartItems.fulfilled, (state, action) => {
                state.isLoading = false;
                state.cartItems = action.payload.data;
            })
            .addCase(fetchCartItems.rejected, (state) => {
                state.isLoading = false;
                state.cartItems = [];
            })
            .addCase(updateCartQuantity.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateCartQuantity.fulfilled, (state, action) => {
                state.isLoading = false;
                state.cartItems = action.payload.data;
            })
            .addCase(updateCartQuantity.rejected, (state) => {
                state.isLoading = false;
                state.cartItems = [];
            })
            .addCase(updateCartQuantity.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateCartQuantity.fulfilled, (state, action) => {
                state.isLoading = false;
                state.cartItems = action.payload.data;
            })
            .addCase(updateCartQuantity.rejected, (state) => {
                state.isLoading = false;
                state.cartItems = [];
            })
    }   
});

export default shoppingCartSlice.reducer;