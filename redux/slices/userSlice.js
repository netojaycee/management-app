import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: null,

  first_name: "",

  last_name: "",

  username: "",

  email: "",

  phone_number: "",

  email_verified: false,

  verification_level: null,

  reputation_score: 0,

  active_contracts: null,

  kyc_status: "",

  profile_image: "",

  role: "",

  is_active: false,

  business: "",

  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user_cargo",

  initialState,

  reducers: {
    setUserInfo: (state, action) => {
      state.id = action.payload.id;

      state.first_name = action.payload.first_name;

      state.last_name = action.payload.last_name;
      state.username = action.payload.username;

      state.email = action.payload.email;

      state.phone_number = action.payload.phone_number;

      state.email_verified = action.payload.email_verified;

      state.verification_level = action.payload.verification_level;

      state.reputation_score = action.payload.reputation_score;

      state.active_contracts = action.payload.active_contracts;

      state.kyc_status = action.payload.kyc_status;

      state.profile_image = action.payload.profile_image;

      state.role = action.payload.role;

      state.is_active = action.payload.is_active;

      state.business = action.payload.business;

      state.isAuthenticated = true;
    },

    clearUserInfo: (state) => {
      return initialState; // Reset state to initial state when clearing user info
    },
  },
});

export const { setUserInfo, clearUserInfo } = userSlice.actions;

export default userSlice.reducer;
