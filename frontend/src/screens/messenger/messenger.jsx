import React, { useEffect, useRef, useState } from "react";
import Navbar from "../../components/UserComponents/navbar/header";
import "./messenger.css";
import {
  Divider,
  InputBase,
  TextField,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";

import Conversation from "../../components/conversation/conversation";
import Message from "../../components/message/message";
import SendIcon from "@mui/icons-material/Send";
import { useSelector } from "react-redux";
import { useUserChatsMutation } from "../../slices/chatApiSlice";
// import { selectSocket } from "../../slices/socketSlice";
// import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const Messenger = () => {
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const { palette } = useTheme();
  const mediumMain = palette.neutral.mediumMain;
  const medium = palette.neutral.medium;

  const { userInfo } = useSelector((state) => state.authUser);
  const [userChats] = useUserChatsMutation();
  // const { postId } = useParams();
  // console.log(`postId is ${postId}`);

  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [sendMessage, setSendMessage] = useState(null);
  const [receiveMessage, setReceiveMessage] = useState(null);

  // const socket = useSelector(selectSocket);
  const socket = useRef();

  const getChats = async () => {
    try {
      const userId = userInfo._id;
      const data = await userChats({ userId }).unwrap();
      setChats(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getChats();
  }, [userInfo]);

  useEffect(() => {
    socket.current = io(process.env.REACT_APP_HOSTED_URL);
    socket.current.emit("new-user-add", userInfo._id);
    socket.current.on("get-users", (users) => {
      setOnlineUsers(users);
    });
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [userInfo]);

  useEffect(() => {
    if (sendMessage !== null) {
      socket.current.emit("send-message", sendMessage);
    }
  }, [sendMessage]);

  useEffect(() => {
    socket.current.on("receive-message", (data) => {
      setReceiveMessage(data);
    });
  }, []);

  const checkOnlineStatus = (chat) => {
    const chatMember = chat?.members.find((member) => member !== userInfo._id);
    const online = onlineUsers.find((user) => user.userId === chatMember);
    return online ? true : false;
  };

  return (
    <>
      <Navbar socket={socket} />
      <div
        className="messenger"
        style={{
          backgroundColor: palette.background.alt,
          height: "auto",
          minHeight: "calc(100vh - 5.5rem)",
        }}
      >
        <div className="chatMenu">
          {/* <InputBase
            placeholder="search..."
            sx={{
              width: "60%",
              height: "3rem",
              backgroundColor: palette.neutral.light,
              borderRadius: "1rem",
              padding: "1rem 2rem",
              marginLeft: "1rem",
              marginTop: "1rem",
            }}
          /> */}
          {/* <Divider sx={{ height: "1rem" }} /> */}
          <div className="chat-container mt-3 ms-2">
            <h2>Chats</h2>
            <div className="chat-list">
              {chats.map((chat) => (
                <div key={chat._id} onClick={() => setCurrentChat(chat)}>
                  <Conversation
                    data={chat}
                    currentUser={userInfo._id}
                    online={checkOnlineStatus(chat)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          className="chatbox"
          style={{
            backgroundColor: palette.background.alt,
            height: "auto",
            minHeight: "calc(100vh - 5.5rem)",
          }}
        >
          <Message
            chat={currentChat}
            currentUser={userInfo._id}
            setSendMessage={setSendMessage}
            receiveMessage={receiveMessage}
            online={checkOnlineStatus(currentChat)}
            // postId={postId}
            socket={socket}
          />
        </div>
      </div>
    </>
  );
};

export default Messenger;
