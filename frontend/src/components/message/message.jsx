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
import { Link, useNavigate } from "react-router-dom";
import lottie from "lottie-web";
import typingAnimation from "../../animation/animation.json";
import Peer from "peerjs";

import { toast } from "react-toastify";
import VideoCallModal from "../videoCallModal";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

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
  const [VideoCall, setVideoCall] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [callEnded, setCallEnded] = useState(false);

  const animationContainer = useRef(null);
  const typingRef = useRef(typing);
  const scroll = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const myVideo = useRef();

  const { userInfo } = useSelector((state) => state.authUser);

  const navigate = useNavigate();

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

      const data = await getMessages({ chatId }).unwrap();
      setMessages(data);
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

      // socket.current.on("me", (id) => {
      //   setMe(id);
      // });
      // socket.current.on("callUser", (data) => {
      //   setVideoCall(true);
      //   setIsIncomingCall(true);
      //   setCaller(data.from);
      //   setCallerSignal(data.signal);
      // });
      // socket.current.on("callAccepted", (signal) => {
      //   connectionRef.current.signal(signal);
      //   setCallAccepted(true);
      // });
    }
  }, []);

  useEffect(() => {
    if (receiveMessage !== null && receiveMessage.chatId === chat._id) {
      setMessages([...messages, receiveMessage]);
    }
  }, [receiveMessage]);

  useEffect(() => {
    // socket.current.on("me", (id) => {
    //   setMe(id);
    // });
    // navigator.mediaDevices
    //   .getUserMedia({ video: true, audio: true })
    //   .then((stream) => {
    //     setStream(stream);
    //     myVideo.current.srcObject = stream;
    //   })
    //   .catch((error) => {
    //     console.error("Error accessing media devices:", error);
    //   });

    // socket.current?.on("callUser", (data) => {
    //   setVideoCall(true);
    //   setIsIncomingCall(true);
    //   setCaller(data.from);
    //   setCallerSignal(data.signal);
    // });

    // socket.current?.on("callAccepted", (signal) => {
    //   connectionRef.current.signal(signal);
    //   setCallAccepted(true);
    // });

    return () => {
      connectionRef.current && connectionRef.current.destroy();
      stream && stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const answerCall = () => {
    setVideoCall(true);
    setIsIncomingCall(true);
    setCaller(userData.userId);
    setCallerSignal(callerSignal);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
      debug: 3, // Enable debug logging
    });
    peer.on("signal", (data) => {
      // Send the signal to the caller
      console.log(data, "inside answer call peer signal");
      socket.current.emit("answerCall", {
        signal: data,
        to: caller,
      });
    });

    peer.on("stream", (remoteStream) => {
      console.log("answer call stream");
      userVideo.current.srcObject = remoteStream;
    });

    // Set the signal received from the caller
    peer.signal(callerSignal);

    connectionRef.current = peer;
    setCallAccepted(true);
  };

  const callUser = () => {
    if (!stream) {
      console.error("No stream available");
      return;
    }

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
      debug: 3, // Enable debug logging
    });

    peer.on("signal", (data) => {
      console.log(data, "signelData");
      socket.current.emit("callUser", {
        userToCall: receiverId,
        signalData: data,
        from: currentUser,
        name: userData.userName,
      });
    });
    peer.on("stream", (remoteStream) => {
      console.log("inside the stream");
      userVideo.current.srcObject = remoteStream;
    });
    peer.on("open", (id) => {
      console.log("Peer connection opened successfully", id);
      console.log(`me id is ${me}`);
    });

    peer.on("error", (err) => {
      console.error("Peer error: call user", err);
    });

    peer.on("close", () => {
      console.log("inside the peer close");
      setCallEnded(true);
      setIsModalOpen(false);
      setVideoCall(false);
    });

    socket.current.on("callAccepted", (signal) => {
      console.log("inside teh callAccepted");
      peer.signal(signal); // Signal the peer to complete the connection
      setCallAccepted(true);
    });

    connectionRef.current = peer;
  };

  // handle unsend message

  const handleMouseEnter = (messageId) => {
    setHoveredMessage(messageId);
  };

  const handleMouseLeave = () => {
    setHoveredMessage(null);
  };

  const handleCallClick = () => {
    // callUser();
    // setIsModalOpen(true);
    // setVideoCall(true);
    // console.log(VideoCall, "video call");
    toast.warning(
      "🚧 Feature in progress! We're working hard behind the scenes. Thanks for your patience!"
    );
  };

  const handleActionClick = async (actionName, messageId) => {
    if (actionName === "Unsend") {
      try {
        const data = await deleteMessage({
          messageId,
          chatId: chat._id,
        }).unwrap();

        if (data.success) {
          setMessages(data.message);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleCallEnd = () => {
    // Handle the logic when the call ends
    setCallEnded(true);
    setIsModalOpen(false); // Close the modal when the call ends
    setVideoCall(false);
    connectionRef.current.destroy();
  };

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
              className="conversation"
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
                      {online ? "Online" : userData?.address.state}
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
                  <IconButton className="me-5" onClick={handleCallClick}>
                    <VideoCallIcon fontSize="large" color={dark} />
                  </IconButton>
                </Grid>
              </Grid>
            </div>

            {/* {(VideoCall || isIncomingCall) && (
              <VideoCallModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                isIncomingCall={isIncomingCall}
                myVideo={myVideo}
                callAccepted={callAccepted}
                callEnded={callEnded}
                userVideo={userVideo}
                onCallEnd={handleCallEnd}
                answerCall={answerCall}
              />
            )} */}

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
                            className="messageText me-4"
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
          {userData.blockedUsers.includes(currentUser) ? (
            <>
              <Typography
                variant="h3"
                className="d-flex aligh-items-center justify-content-center"
              >
                can't send messages ! You are blocked
              </Typography>
            </>
          ) : userInfo.blockedUsers.includes(receiverId) ? (
            <>
              <Typography
                variant="h4"
                className="d-flex aligh-items-center justify-content-center"
              >
                Unblock the User to send messages
                <Link
                  className="text-decoration-none ms-3"
                  to={`/profile/${receiverId}`}
                >
                  Click Here
                </Link>
              </Typography>
            </>
          ) : (
            <>
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
                    style={{
                      color: "#0095F6",
                      height: "1.8rem",
                      width: "1.8rem",
                    }}
                  />
                </IconButton>
              </div>
            </>
          )}
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
