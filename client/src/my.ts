// store/store.ts
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

// Import all your reducers...

// Enhanced no-op storage for server-side
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
  // Your reducers...
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "shopCart", "shopAddress"],
  version: 1,
  // Optional: Add state reconciler if you need migration
  migrate: (state: any) => {
    if (!state) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve(state);
  },
};

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

export const persistor = persistStore(store);

// Infer the RootState and AppDispatch types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;