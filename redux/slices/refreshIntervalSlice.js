import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  lastRefreshTime: null, // Store the last token refresh time
};

const refreshIntervalSlice = createSlice({
  name: "last_refresh_time",
  initialState,
  reducers: {
    setLastRefreshTime: (state, action) => {
      state.lastRefreshTime = action.payload;
    },
    clearLastRefreshTime: (state) => {
      state.lastRefreshTime = null;
    },
  },
});

export const { setLastRefreshTime, clearLastRefreshTime } =
  refreshIntervalSlice.actions;

export default refreshIntervalSlice.reducer;
