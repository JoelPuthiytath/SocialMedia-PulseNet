import { createSlice } from "@reduxjs/toolkit";
import io from "socket.io-client";

const initialState = {
  socket: null,
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    connectSocket: (state) => {
      console.log("connect socket");
      state.socket = io("http://localhost:8800");
    },
    disconnectSocket: (state) => {
      if (state.socket) {
        state.socket.disconnect();
        state.socket = null;
      }
    },
  },
});

export const { connectSocket, disconnectSocket } = socketSlice.actions;
export const selectSocket = (state) => state.socket; // Corrected selector
export default socketSlice.reducer;
