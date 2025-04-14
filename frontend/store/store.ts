import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

import authReducer from "./auth-slice";
import adminProductsSlice from "./admin/products-slice";
import adminOrderSlice from "./admin/order-slice";
import shopProductsSlice from "./shop/product-slice";
import shopCartSlice from "./shop/cart-slice";
import shopAddressSlice from "./shop/address-slice";
import shopOrderSlice from "./shop/order-slice";
import shopSearchSlice from "./shop/search-slice";
import shopReviewSlice from "./shop/review-slice";
import commonFeatureSlice from "./common-slice";
import formReducer from "./slices/formSlices";

// Create a no-op storage for server-side
const createNoopStorage = () => {
  return {
    getItem(_key: string): Promise<null> {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: unknown): Promise<unknown> {
      return Promise.resolve(value);
    },
    removeItem(_key: string): Promise<void> {
      return Promise.resolve();
    },
  };
};


const storage = typeof window !== "undefined" ? 
  createWebStorage("local") : 
  createNoopStorage();

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
  form: formReducer,
});


export const persistConfig = {
  key: "root",
  storage: {
    ...storage,
    // Add size limit handling
    setItem: (key: string, value: string) => {
      try {
        if (value.length > 5 * 1024 * 1024) { // 5MB limit
          console.warn('State too large, only persisting critical data')
          const parsed = JSON.parse(value)
          // Only persist auth data if limit exceeded
          return storage.setItem(key, JSON.stringify({
            auth: parsed.auth
          }))
        }
        return storage.setItem(key, value)
      } catch (error) {
        console.error('Failed to persist state:', error)
        return Promise.resolve(); // Ensure a value is returned in the catch block
      }
    }
  },
  whitelist: ["auth", "shopCart", "shopAddress"],
  version: 1,
  migrate: (state: any) => {
    if (!state) return Promise.resolve(undefined)
    return Promise.resolve(state)
  },
}

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ['some.nested.path'], // Add if needed
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});
// Add to your store configuration
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === `persist:${persistConfig.key}`) {
      store.dispatch({ type: 'REHYDRATE_FROM_STORAGE' })
    }
  })
}

export const persistor = persistStore(store);

// Infer the RootState and AppDispatch types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;