import { configureStore } from "@reduxjs/toolkit";
import { dropsApi } from "../features/drops/dropsApi";

export const store = configureStore({
  reducer: {
    [dropsApi.reducerPath]: dropsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dropsApi.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
