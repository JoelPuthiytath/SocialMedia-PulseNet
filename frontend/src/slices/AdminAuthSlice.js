import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  adminInfo: localStorage.getItem("adminInfo")
    ? JSON.parse(localStorage.getItem("adminInfo"))
    : null,
  mode: "light",
};

const AdminSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      localStorage.setItem("mode", JSON.stringify(state.mode));
    },
    adminSetCredentials: (state, action) => {
      state.adminInfo = action.payload;
      localStorage.setItem("adminInfo", JSON.stringify(action.payload));
    },
    adminClearCredentials: (state) => {
      state.adminInfo = null;
      localStorage.removeItem("adminInfo");
    },
  },
});
export const { adminSetCredentials, adminClearCredentials, setMode } =
  AdminSlice.actions;
export default AdminSlice.reducer;
