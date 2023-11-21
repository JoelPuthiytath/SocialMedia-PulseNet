import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/AuthSlice";
import adminAuthReducer from "./slices/AdminAuthSlice";
import socketReducer from "./slices/socketSlice";
import userReducer from "./slices/UserSlice";
import { apiSlice } from "./slices/ApiSlice";

import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import storage from "redux-persist/lib/storage";

const persistConfig = { key: "root", storage, version: 1 };
const persistedReducer = persistReducer(persistConfig, authReducer);

const store = configureStore({
  reducer: {
    authUser: persistedReducer,
    adminAuth: adminAuthReducer,
    socket: socketReducer,
    users: userReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiSlice.middleware),
  devTools: true,
});

export default store;
