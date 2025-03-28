import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // ✅ Local storage for Redux Persist
import { persistReducer, persistStore } from "redux-persist";

// ✅ Import Reducers
import authReducer from "./auth-slice";
import adminProductsSlice from "./admin/products-slice";
import adminOrderSlice from "./admin/order-slice";
import shopProductsSlice from "./shop/products-slice";
import shopCartSlice from "./shop/cart-slice";
import shopAddressSlice from "./shop/address-slice";
import shopOrderSlice from "./shop/order-slice";
import shopSearchSlice from "./shop/search-slice";
import shopReviewSlice from "./shop/review-slice";
import commonFeatureSlice from "./common-slice";

// ✅ Combine Reducers for Redux Persist
const rootReducer = combineReducers({
  auth: authReducer,

  adminProducts: adminProductsSlice,
  adminOrder: adminOrderSlice,

  shopProducts: shopProductsSlice,
  shopCart: shopCartSlice,
  shopAddress: shopAddressSlice,
  shopOrder: shopOrderSlice,
  shopSearch: shopSearchSlice,
  shopReview: shopReviewSlice,

  commonFeature: commonFeatureSlice,
});

// ✅ Redux Persist Configuration
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "shopCart", "shopAddress"], // ✅ Persist only necessary reducers
};

// ✅ Create Persisted Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ✅ Configure Redux Store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // ✅ Fix Redux Persist issues with non-serializable data
    }),
  devTools: process.env.NODE_ENV !== "production", // ✅ Enable Redux DevTools in development
});

// ✅ Create Redux Persistor
export const persistor = persistStore(store);

// ✅ Export RootState & AppDispatch for Type Safety
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
