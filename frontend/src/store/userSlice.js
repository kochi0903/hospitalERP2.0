import { createSlice } from "@reduxjs/toolkit";
import { userApi } from "../services/userApi";

const initialValue = {
  token: null,
  refresh_token: null,
  status: "idle",
  message: null,
  isLoading: false,
  isAuthenticated: false,
  statusCode: "",
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState: initialValue,
  reducers: {
    resetMessages: (state) => {
      state.message = null;
      state.statusCode = null;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoading = false;
      state.isAuthenticated = false;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      userApi.endpoints.loginUser.matchFulfilled,
      (state, { payload }) => {
        state.token = payload.token;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.user = payload.user || {};
      }
    );
    builder.addMatcher(userApi.endpoints.loginUser.matchPending, (state) => {
      state.isLoading = true;
      state.isAuthenticated = false;
    });
    builder.addMatcher(
      userApi.endpoints.loginUser.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = {};
        state.message = error?.data?.message || "Login failed";
      }
    );
    builder.addMatcher(
      userApi.endpoints.updateUser.matchFulfilled,
      (state, { payload }) => {
        state.user = payload.user || state.user;
        state.message = payload.message || "Profile updated successfully!";
        state.isLoading = false;
      }
    );
    builder.addMatcher(userApi.endpoints.updateUser.matchPending, (state) => {
      state.isLoading = true;
    });
    builder.addMatcher(
      userApi.endpoints.updateUser.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.message =
          error?.data?.message || `Profile update failed: ${error?.data}`;
      }
    );
  },
});

export const { resetMessages, logout } = userSlice.actions;
export default userSlice.reducer;
