import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: null,
};

try {
  const storedUsers = localStorage.getItem("users");
  if (storedUsers) {
    initialState.users = JSON.parse(storedUsers);
  }
} catch (error) {
  console.error("Error parsing stored users:", error);
}

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
      localStorage.setItem("users", JSON.stringify(action.payload));
    },
    getUsers: (state, action) => {
      state.users = action.payload;
    },
    clearUsers: (state) => {
      state.users = null;
      localStorage.removeItem("users");
    },
    // DeleteUser: (state, action) => {
    //   const indexToRemove = state.users.findIndex(
    //     (item) => item._id === action.payload.id
    //   );
    //   if (indexToRemove !== -1) {
    //     state.users.splice(indexToRemove, 1);
    //   }
    // },
  },
});

export const { setUsers, clearUsers, getUsers } = userSlice.actions;

export default userSlice.reducer;
