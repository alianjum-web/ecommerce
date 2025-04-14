import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import {
  CartItem,
  AddressInfo,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/utils/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface Order {
  _id: string;
  userId: string;
  payerId: string;
  cartItems: CartItem[]; // Reused CartItem interface
  addressInfo: AddressInfo; // Reused AddressInfo interface
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  paymentId?: string;
  orderDate?: string;
  orderUpdateDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderState {
  approvalURL: string | null;
  isLoading: boolean;
  orderId: string | null;
  orderList: Order[];
  orderDetails: Order | null;
  error: string | null;
}
const initialState: OrderState = {
  approvalURL: null,
  isLoading: false,
  orderId: null,
  orderList: [],
  orderDetails: null,
  error: null,
};

const fetchData = async <T>(callback: () => Promise<T>): Promise<T> => {
  try {
    return await callback();
  } catch (error: any) {
    throw error.response?.data?.message || "Something went wrong";
  }
};

export const createNewOrder = createAsyncThunk<
  { approvalURL: string; orderId: string },
  Record<string, any>,
  { rejectValue: string }
>("/order/createNewOrder", async (orderData, { rejectWithValue }) => {
  return fetchData(async () => {
    const response = await axios.post<{ approvalURL: string; orderId: string }>(
      `${BASE_URL}/api/shop/order/create`,
      orderData
    );
    return response.data;
  }).catch((error) => rejectWithValue(error));
});

export const capturePayment = createAsyncThunk<
  { success: boolean },
  {
    paymentId: string;
    payerId: string;
    orderId: string;
  },
  { rejectValue: string }
>(
  "/order/capturePayment",
  async ({ paymentId, payerId, orderId }, { rejectWithValue }) => {
    return fetchData(async () => {
      const response = await axios.post<{ success: boolean }>(
        `${BASE_URL}/api/shop/order/capture`,
        {
          paymentId,
          payerId,
          orderId,
        }
      );

      return response.data;
    }).catch((error) => rejectWithValue(error));
  }
);

export const getAllOrdersByUserId = createAsyncThunk<
  Order[],
  { userId: string },
  { rejectValue: string }
>("/order/getAllOrdersByUserId", async (userId, { rejectWithValue }) => {
  return fetchData(async () => {
    const response = await axios.get<{ data: Order[] }>(
      `${BASE_URL}/api/shop/order/list/${userId}`
    );

    return response.data.data;
  }).catch((error) => rejectWithValue(error));
});

export const getOrderDetails = createAsyncThunk<
  Order,
  string,
  { rejectValue: string }
>("/order/getOrderDetails", async (id, { rejectWithValue }) => {
  return fetchData(async () => {
    const response = await axios.get<{ data: Order }>(
      `${BASE_URL}/api/shop/order/details/${id}`
    );

    return response.data.data;
  }).catch((error) => rejectWithValue(error));
});

const shoppingOrderSlice = createSlice({
  name: "shoppingOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createNewOrder.fulfilled,
        (
          state,
          action: PayloadAction<{ approvalURL: string; orderId: string }>
        ) => {
          state.isLoading = false;
          state.approvalURL = action.payload.approvalURL;
          state.orderId = action.payload.orderId;
          sessionStorage.setItem(
            "currentOrderId",
            action.payload.orderId // JSON.stringify if not work
          );
        }
      )
      .addCase(createNewOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.approvalURL = null;
        state.orderId = null;
        state.error = action.payload || "Failed to create order";
      })
      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getAllOrdersByUserId.fulfilled,
        (state, action: PayloadAction<Order[]>) => {
          state.isLoading = false;
          state.orderList = action.payload;
        }
      )
      .addCase(getAllOrdersByUserId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch orders";
        state.orderList = [];
      })
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getOrderDetails.fulfilled,
        (state, action: PayloadAction<Order>) => {
          state.isLoading = false;
          state.orderDetails = action.payload;
        }
      )
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.orderDetails = null;
        state.error = action.payload || "Failed to fetch order details.";
      });
  },
});

export const { resetOrderDetails } = shoppingOrderSlice.actions;

export default shoppingOrderSlice.reducer;
