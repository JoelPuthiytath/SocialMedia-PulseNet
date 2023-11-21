import React, { useEffect, useRef, useState } from "react";
import InputEmoji from "react-input-emoji";
import UserImage from "../UserImage";
import Image from "../../assets/img/pulseNet.png";
import { format } from "timeago.js";
import Linkify from "react-linkify";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import "./message.css";
import {
  Box,
  Divider,
  Typography,
  useTheme,
  IconButton,
  SpeedDialAction,
  Grid,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useGetUserByIdMutation } from "../../slices/UsersApiSlice";
import SpeedDial from "@mui/material/SpeedDial";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import FileCopyIcon from "@mui/icons-material/FileCopyOutlined";
import VideoCallIcon from "@mui/icons-material/VideoCall";

import {
  useAddMessagesMutation,
  useDeleteMessageMutation,
  useGetMessagesMutation,
} from "../../slices/messageApiSlice";
import { useNavigate } from "react-router-dom";
import lottie from "lottie-web";
import typingAnimation from "../../animation/animation.json";
import LocalPhone from "@mui/icons-material/LocalPhone";
import videoCall from "../videoCall";
import Peer from "peerjs";
import { toast } from "react-toastify";

const Message = ({
  chat,
  currentUser,
  setSendMessage,
  receiveMessage,
  socket,
  online,
  // postId,
}) => {
  const { palette } = useTheme();
  const primaryLight = palette.primary.light;
  const primaryDark = palette.primary.dark;
  const dark = palette.neutral.dark;

  const main = palette.neutral.main;
  const medium = palette.neutral.medium;

  const [getUserById] = useGetUserByIdMutation();
  const [getMessages] = useGetMessagesMutation();
  const [addMessage] = useAddMessagesMutation();
  const [deleteMessage] = useDeleteMessageMutation();

  const [userData, setUserData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);

  const animationContainer = useRef(null);
  const typingRef = useRef(typing);
  const scroll = useRef();

  const actions = [
    { icon: <FileCopyIcon />, name: "Copy" },
    { icon: <DeleteOutlineIcon />, name: "Unsend" },
  ];

  useEffect(() => {
    const animation = lottie.loadAnimation({
      container: animationContainer.current,
      renderer: "svg", // or 'canvas', 'html'
      loop: true,
      autoplay: true,
      animationData: typingAnimation,
    });

    return () => {
      animation.destroy();
    };
  }, []);

  const handleChange = async (newMessage) => {
    try {
      console.log(newMessage);

      setNewMessage(newMessage);

      if (!typing) {
        setTyping(true);
        typingRef.current = true;
        socket?.current.emit("typing", {
          senderId: currentUser,
          receiverId: receiverId,
        });
      }

      const timerLength = 3000;
      let typingTimeout;

      // Clear the existing timeout (if any)
      clearTimeout(typingTimeout);

      // Set a new timeout
      var lastTypingTime = new Date().getTime();
      typingTimeout = setTimeout(() => {
        var timeNow = new Date().getTime();
        var timeDiff = timeNow - lastTypingTime;

        if (timeDiff >= timerLength && typingRef.current) {
          socket?.current.emit("stop-typing", {
            senderId: currentUser,
            receiverId: receiverId,
          });
          setTyping(false);
          typingRef.current = false;
        }
      }, timerLength);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const userId = chat?.members?.find((id) => id !== currentUser);
    const getUserData = async () => {
      try {
        const data = await getUserById({ userId }).unwrap();
        setUserData(data);
        console.log(data, " chatData");
      } catch (error) {
        console.log(error);
        toast.warning(error.data.message);
      }
    };
    if (chat !== null) getUserData();
  }, [chat, currentUser]);

  const fetchMessges = async () => {
    try {
      const chatId = chat._id;
      console.log(chatId, "chatId");
      const data = await getMessages({ chatId }).unwrap();
      setMessages(data);
      console.log(data, "messages");
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (chat !== null) fetchMessges();
  }, [chat]);

  const receiverId = chat?.members?.find((id) => id !== currentUser);

  const handleSend = async (e) => {
    e.preventDefault();
    if (newMessage) {
      socket.current.emit("stop-typing", {
        senderId: currentUser,
        receiverId: receiverId,
      });

      const message = {
        senderId: currentUser,
        text: newMessage,
        chatId: chat._id,
      };

      try {
        const data = await addMessage(message).unwrap();
        setMessages([...messages, data]);
        setNewMessage("");
        console.log(data, "addMessage");
      } catch (error) {
        console.log(error);
      }

      setSendMessage({ ...message, receiverId });
    }
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("typing", () => setIsTyping(true));
      socket.current.on("stop-typing", () => setIsTyping(false));
    }
  }, []);

  useEffect(() => {
    console.log("Message Arrived: ", receiveMessage);
    if (receiveMessage !== null && receiveMessage.chatId === chat._id) {
      setMessages([...messages, receiveMessage]);
    }
  }, [receiveMessage]);

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // handle unsend message

  const handleMouseEnter = (messageId) => {
    setHoveredMessage(messageId);
  };

  const handleMouseLeave = () => {
    setHoveredMessage(null);
  };

  const handleActionClick = async (actionName, messageId) => {
    if (actionName === "Unsend") {
      console.log(`Delete action clicked for message with ID: ${messageId}`);
      try {
        const data = await deleteMessage({
          messageId,
          chatId: chat._id,
        }).unwrap();
        console.log(data, "this is the data");

        if (data.success) {
          setMessages(data.message);
        }
        console.log(data.message, "message");
        console.log(data.success, "chaeking weather it is true or not");
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <>
      {userData && chat ? (
        <>
          <div
            className="messageBox"
            style={{
              height: "auto",
              minHeight: "calc(100vh - 12rem)",
            }}
          >
            <div
              className="conversation1"
              style={{ borderBottom: "2px solid lightGray", padding: "5px" }}
            >
              <Grid container spacing={1} alignItems="center">
                <Grid
                  item
                  xs={9}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <UserImage
                    image={userData?.profilePic ? userData.profilePic : Image}
                    size="40px"
                  />
                  <Box className="ms-3">
                    <Typography
                      color={main}
                      variant="h5"
                      fontWeight="500"
                      sx={{
                        "&:hover": {
                          color: palette.primary.light,
                          cursor: "pointer",
                        },
                      }}
                    >
                      {userData?.userName}
                    </Typography>
                    <Typography color={medium} fontSize="0.75rem">
                      {online ? "Online" : userData?.address}
                    </Typography>
                  </Box>
                </Grid>
                <Grid
                  item
                  xs={3}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <IconButton
                    className="me-2"
                    // onClick={() => {
                    //   navigate("/videoCall", { state: { chat } });
                    // }}
                  >
                    <VideoCallIcon fontSize="large" color={dark} />
                  </IconButton>
                  <IconButton className="me-5">
                    <LocalPhone color={dark} />
                  </IconButton>
                </Grid>
              </Grid>
            </div>

            <div className="messages-container">
              {messages &&
                messages.map((message) => (
                  <div
                    ref={scroll}
                    key={message._id}
                    className={
                      message.senderId === currentUser
                        ? "message own"
                        : "message"
                    }
                  >
                    <div
                      className="messageBody"
                      onMouseEnter={() => handleMouseEnter(message._id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {message.senderId === currentUser ? (
                        <Linkify>
                          {hoveredMessage === message._id && (
                            <Box
                              className="mx-3"
                              sx={{
                                height: 20, // Adjust the height according to your needs
                                transform: "translateZ(0px)",
                                flexGrow: 1,
                              }}
                            >
                              <SpeedDial
                                ariaLabel="SpeedDial"
                                sx={{
                                  height: "40px",
                                  width: "40px",
                                  padding: "5px",
                                }}
                                icon={<MoreVertIcon />}
                                direction="left"
                              >
                                {actions.map((action) => (
                                  <SpeedDialAction
                                    key={action.name}
                                    icon={action.icon}
                                    tooltipTitle={action.name}
                                    onClick={() =>
                                      handleActionClick(
                                        action.name,
                                        message._id
                                      )
                                    }
                                  />
                                ))}
                              </SpeedDial>
                            </Box>
                          )}
                          <Typography
                            className="messageText me-3"
                            variant="body1"
                          >
                            {message.text}
                          </Typography>
                        </Linkify>
                      ) : (
                        <>
                          <UserImage
                            image={
                              userData?.profilePic ? userData.profilePic : Image
                            }
                            size="40px"
                          />
                          <Linkify
                            componentDecorator={(
                              decoratedHref,
                              decoratedText,
                              key
                            ) => (
                              <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={decoratedHref}
                                key={key}
                                className="custom-link"
                              >
                                {decoratedText}
                              </a>
                            )}
                          >
                            <Typography
                              className="messageText ms-3"
                              variant="body1"
                            >
                              {message.text}
                            </Typography>
                          </Linkify>
                        </>
                      )}
                    </div>
                    <div className="messageTime me-3">
                      <Typography variant="caption">
                        {format(message.createdAt)}
                      </Typography>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          {istyping ? (
            // <div ref={animation} style={{ width: "60px" }}></div>
            <Typography variant="subtitle">Typing...</Typography>
          ) : (
            <></>
          )}

          <Divider
            style={{ borderBottom: "4px solid lightGray" }} // Increase the border thickness here
          />

          <div className="chat-sender mb-2">
            <div className="input-container">
              <InputEmoji
                className="sender-input"
                value={newMessage}
                // onChange={handleChange}
                onChange={(newMessage) => handleChange(newMessage)}
              />
            </div>

            <IconButton onClick={handleSend}>
              <SendIcon
                style={{ color: "#0095F6", height: "1.8rem", width: "1.8rem" }}
              />
            </IconButton>
          </div>
        </>
      ) : (
        <>
          <span className="chatbox-empty-message">
            Tap on a chat to start conversation...
          </span>
        </>
      )}
    </>
  );
};

export default Message;
