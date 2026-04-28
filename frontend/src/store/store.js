import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // defaults to localStorage
import { persistReducer, persistStore } from "redux-persist";
import { setupListeners } from "@reduxjs/toolkit/query";
import { combineReducers } from "redux";
import { userApi } from "../services/userApi";
import { expenseApi } from "../services/expenseApi";
import { billingApi } from "../services/billingApi";
import { statsApi } from "../services/statsApi";
import { auditApi } from "../services/auditApi";
import { settingsApi } from "../services/settingsApi";
import userReducer from "./userSlice";
import expenseReducer from "./expenseSlice";
import billingReducer from "./billingSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], 
};

const rootReducer = combineReducers({
  user: userReducer,
  expense: expenseReducer,
  bill: billingReducer,
  [userApi.reducerPath]: userApi.reducer,
  [expenseApi.reducerPath]: expenseApi.reducer,
  [billingApi.reducerPath]: billingApi.reducer,
  [statsApi.reducerPath]: statsApi.reducer,
  [auditApi.reducerPath]: auditApi.reducer,
  [settingsApi.reducerPath]: settingsApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure Store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      userApi.middleware,
      expenseApi.middleware,
      billingApi.middleware,
      statsApi.middleware,
      auditApi.middleware,
      settingsApi.middleware,
    ),
});
setupListeners(store.dispatch);
export const persistor = persistStore(store);
