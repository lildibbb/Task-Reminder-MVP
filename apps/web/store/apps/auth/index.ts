import { UserDataType } from "@/context/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  user: UserDataType | null;
  token: string | null;
  isInitialized: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isInitialized: false,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserDataType | null>) => {
      state.user = action.payload;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});
export const { setUser, setToken, setInitialized, setLoading, logout } =
  authSlice.actions;
export default authSlice.reducer;
