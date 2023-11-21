import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "light",
  userInfo: null,
  token: null,
  notifications: [],
  posts: [],
};

const AuthSlice = createSlice({
  name: "authUser",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setCredentials: (state, action) => {
      if (action.payload.userInfo) {
        state.userInfo = { ...state.userInfo, ...action.payload.userInfo };
      }
      if (action.payload.token) {
        state.token = action.payload.token;
      }
    },
    clearCredentials: (state) => {
      state.userInfo = null;
      state.token = null;
    },
    setFriends: (state, action) => {
      if (state.userInfo) {
        state.userInfo.friends = action.payload.friends;
      } else {
        console.error("user friends non-existent :(");
      }
    },
    setNotification: (state, action) => {
      console.log("setnotifacion......");
      const newNotification = {
        ...action.payload.notification,
        read: false,
      };

      state.notifications.push(newNotification);
    },
    setNotificationRead: (state, action) => {
      const { notificationId } = action.payload;
      const notification = state.notifications.find(
        (notification) => notification.id === notificationId
      );

      if (notification) {
        notification.read = true;
      }
    },

    setPosts: (state, action) => {
      state.posts = action.payload.posts;
    },
    setPost: (state, action) => {
      const updatedPosts = state.posts.map((post) => {
        if (post._id === action.payload.post._id) return action.payload.post;
        return post;
      });
      state.posts = updatedPosts;
    },
    DeleteUser: (state, action) => {
      const { id } = action.payload;

      if (id in state.userInfo) {
        delete state.userInfo[id];
      }
      state.posts = state.posts.filter((post) => post.userId !== id);

      state.token = null;
    },
  },
});

export const {
  setMode,
  setCredentials,
  clearCredentials,
  setFriends,
  DeleteUser,
  setNotification,
  setNotificationRead,
  setPosts,
  setPost,
} = AuthSlice.actions;
export default AuthSlice.reducer;
