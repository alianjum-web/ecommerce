import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";


export interface Order {
  _id: string;
  userId: string;
  payerId: string;
  cartItems: CartItem[];
  addressInfo: AddressInfo;
  orderStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentMethod: "credit_card" | "paypal" | "bank_transfer" | "cash_on_delivery";
  paymentStatus: "pending" | "paid" | "failed";
  totalAmount: number;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

export interface AddressInfo {
  addressId?: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  notes?: string;
}

// Define tyoes for APi response
interface Order {
  id: string;
  customerName: string;
  items: string[];
  totalAmount: number;
  status: string;
}

interface AdminOrderState {
  orderList: Order[];
  orderDetails: Order | null;
  isLoading: boolean;
  error: string | null;
}

//Initialize state with typescript type
const initialState: AdminOrderState = {
  orderList: [],
  orderDetails: null,
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

export const getAllOrdersForAdmin = createAsyncThunk<Order[], void, { rejectValue: string }>(
  "/order/getAllOrdersForAdmin",
  async (_, { rejectWithValue }) => {
    return fetchData(async () => {
      const response = await axios.get<{ data: Order[] }>(`${BASE_URL}/api/admin//api/admin/orders/get`);
      return response.data.data;
    }).catch((error) => rejectWithValue(error))
  }
);

export const getOrderDetailsForAdmin = createAsyncThunk<Order, string, { rejectValue: string }>(
  "order/getOrderDetailsForAdmin",
  async (id, { rejectWithValue }) => {
   return fetchData(async() => {
    const response = await axios.get<{ data: Order }>(`${BASE_URL}/api/admin/orders/details/${id}`);
    return response.data.data;
   }).catch((error) => rejectWithValue(error));
  }
);


export const updateOrderStatus = createAsyncThunk<
Order,
{ id: string; orderStatus: string },
{ rejectValue: string }
>(
  "order/updateOrderStatus",
  async ({id, orderStatus}, {rejectWithValue}) => {
    return fetchData(async () => {
      const response = await axios.put<{ data: Order }>(`${BASE_URL}/api/admin/orders/update/${id}`, { orderStatus });
      return response.data.data;
    }).catch((error) => rejectWithValue(error));
  }
)

const adminOrderSlice = createSlice({
  name: "adminOrders",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Orders
      .addCase(getAllOrdersForAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllOrdersForAdmin.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.isLoading = false;
        state.orderList = action.payload;
      })
      .addCase(getAllOrdersForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch orders.";
      })

      // Fetch Order Details
      .addCase(getOrderDetailsForAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderDetailsForAdmin.fulfilled, (state, action: PayloadAction<Order>) => {
        state.isLoading = false;
        state.orderDetails = action.payload;
      })
      .addCase(getOrderDetailsForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch order details.";
      })

      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<Order>) => {
        state.isLoading = false;
        state.orderList = state.orderList.map((order) =>
          order.id === action.payload.id ? action.payload : order
        );
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update order status.";
      });
  },
});


export const { resetOrderDetails } = adminOrderSlice.actions;
export default adminOrderSlice.reducer;
