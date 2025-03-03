import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { loanApi } from "./appData";
import userReducer from "./slices/userSlice";
import refreshIntervalReducer from "./slices/refreshIntervalSlice";

// Persist configuration for the user slice
const userPersistConfig = {
  key: "user_cargo",
  storage,
};

// Persist configuration for the refreshInterval slice
const refreshIntervalPersistConfig = {
  key: "last_refresh_time",
  storage,
};

// Create persisted reducers
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedRefreshIntervalReducer = persistReducer(
  refreshIntervalPersistConfig,
  refreshIntervalReducer
);

// Configure the Redux store
export const store = configureStore({
  reducer: {
    [loanApi.reducerPath]: loanApi.reducer,
    user: persistedUserReducer,
    refreshInterval: persistedRefreshIntervalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for redux-persist
    }).concat(loanApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
// Create the persistor
export const persistor = persistStore(store);

// Enable listeners for RTK Query
setupListeners(store.dispatch);
