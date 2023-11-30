import { Box, useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux";
import PostsWidget from "../widgets/MainPostsWidget";
import { useDispatch } from "react-redux";
import Header from "../../components/UserComponents/navbar/header";
import UserWidget from "../widgets/UserWidgets";
import MyPostWidget from "../widgets/MyPostWidget";
import FriendListWidget from "../widgets/FriendListWidget";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  connectSocket,
  disconnectSocket,
  selectSocket,
} from "../../slices/socketSlice";

const HomeScreen = () => {
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const { userInfo } = useSelector((state) => state.authUser);
  const { _id, profilePic } = userInfo;
  // const socket = useSelector(selectSocket);
  // const dispatch = useDispatch();
  const socket = useRef();

  // useEffect(() => {
  //   console.log("Before initializing socket");

  //   const initializeSocket = () => {
  //     console.log("Initializing socket...");
  //     dispatch(connectSocket());
  //   };

  //   if (!socketRef.current) {
  //     initializeSocket();
  //   }

  //   // Cleanup function
  //   return () => {
  //     console.log("Disconnecting socket");
  //     dispatch(disconnectSocket());
  //   };
  // }, [dispatch, socketRef]);

  // console.log("After initializing socket", socketRef.current);
  useEffect(() => {
    socket.current = io(process.env.REACT_APP_HOSTED_URL);
    socket.current.emit("new-user-add", userInfo._id);
  }, [userInfo._id]);

  return (
    <Box>
      <Header socket={socket} />
      <Box
        width="100%"
        padding="2rem 6%"
        display={isNonMobileScreens ? "flex" : "block"}
        gap="0.5rem"
        justifyContent="space-between"
        style={{
          maxHeight: "calc(100vh - 6rem)",
          overflowY: "auto",
        }}
      >
        <Box
          flexBasis={isNonMobileScreens ? "26%" : undefined}
          style={{
            position: isNonMobileScreens ? "sticky" : "static",
            top: isNonMobileScreens ? "0" : "auto",
          }}
        >
          <UserWidget userId={_id} picturePath={profilePic} />
        </Box>
        <Box
          flexBasis={isNonMobileScreens ? "42%" : undefined}
          mt={isNonMobileScreens ? undefined : "2rem"}
        >
          <MyPostWidget profilePic={profilePic} />
          <PostsWidget userId={_id} socket={socket} />
        </Box>
        {isNonMobileScreens && (
          <Box flexBasis="26%" style={{ position: "sticky" }}>
            {/* <AdvertWidget /> */}
            <Box m="2rem 0" />
            <FriendListWidget userId={_id} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HomeScreen;
