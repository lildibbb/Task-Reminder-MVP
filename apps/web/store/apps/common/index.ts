import { createSlice } from "@reduxjs/toolkit";

const appCommonSlice = createSlice({
  name: "appCommon",
  initialState: {
    isLogout: false,
    isOffline: 0,
    isMaintenanceMode: false,
    maintenanceModeEta: null,
  },
  reducers: {
    handleLogout: (state) => {
      state.isLogout = true;
    },
    resetLogout: (state) => {
      state.isLogout = false;
    },
    handleOffline: (state) => {
      state.isOffline += 1;
    },

    handleMaintenanceMode: (state, action) => {
      state.isMaintenanceMode = true;
      state.maintenanceModeEta = action.payload.etaTime;
    },
    handleResetMaintenanceMode: (state) => {
      state.isMaintenanceMode = false;
      state.maintenanceModeEta = null;
    },
  },
});

export const {
  handleLogout,
  resetLogout,
  handleOffline,
  handleMaintenanceMode,
  handleResetMaintenanceMode,
} = appCommonSlice.actions;

export default appCommonSlice.reducer;
