import Modal from "@mui/material/Modal";
import { styled } from "@mui/system";
import CallEndIcon from "@mui/icons-material/CallEnd";
import PhoneIcon from "@mui/icons-material/Phone";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

// import global from "global";
// import * as process from "process";
// global.process = process;
// import Peer from "peerjs";
import { Button, IconButton } from "@mui/material";
// import "./videoCallModel.css";
const StyledModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const ModalContent = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: "8px",
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
  display: "flex",
  position: "relatiive",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  height: "80vh",
  maxWidth: "500px", // Adjust the modal width
}));

const VideoContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: theme.spacing(2),
}));

const Video = styled("video")(({ theme }) => ({
  width: "100%",
  maxWidth: "400px",
  borderRadius: "8px",
  marginBottom: theme.spacing(1),
}));

const CallerInfo = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  color: "white",
  transform: " translateY(-160%)",

  marginTop: theme.spacing(2),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  width: "100%",
}));

const ButtonContainer = styled("div")(({ theme }) => ({
  position: "absolute",
  bottom: theme.spacing(2),
  left: "50%",
  transform: "translateX(-50%) translateY(-130%)",
  display: "flex",
  zIndex: "15",
  gap: theme.spacing(2),
}));
const VideoCallModal = ({
  open,
  onClose,
  socket,
  currentUser,
  callerSignal,
  receiverId,
  caller,
  me,
  name,
  isIncomingCall,
}) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [stream, setStream] = useState();
  const myVideo = useRef(null);
  const [video, setVideo] = useState(null);
  const userVideo = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    console.log(userVideo);
    const getMediaStream = async () => {
      try {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            setStream(stream);
            console.log(stream.getTracks(), "checking my video tracks");
            if (myVideo.current) {
              myVideo.current.srcObject = stream;
            }
            console.log("myVideo :", myVideo.current.srcObject);

            const callUser = () => {
              const peerConnection = new RTCPeerConnection();
              console.log("callUser");
              if (stream) {
                stream.getTracks().forEach((track) => {
                  console.log("inside track", track);

                  peerConnection.addTrack(track, stream);
                });
              }

              peerConnection
                .createOffer()
                .then((offer) => {
                  return peerConnection.setLocalDescription(offer);
                })
                .then(() => {
                  socket.current.emit("callUser", {
                    userToCall: receiverId,
                    signalData: peerConnection.localDescription,
                    from: me,
                    name: name,
                  });
                });

              peerConnection.ontrack = (event) => {
                console.log("inside event track of callUser");

                if (event.streams && event.streams[0]) {
                  userVideo.current.srcObject = event.streams[0];

                  setVideo(event.streams[0]);

                  if (userVideo.current.srcObject) {
                    console.log(
                      "userVideo checking callUser :",
                      userVideo.current.srcObject
                    );
                  }
                }
              };

              socket.current.on("callAccepted", (signal) => {
                console.log("call accepted");
                setCallAccepted(true);
                peerConnection.setRemoteDescription(
                  new RTCSessionDescription(signal)
                );
              });

              peerConnectionRef.current = peerConnection;
            };

            if (!isIncomingCall) {
              callUser();
            }
          });
      } catch (error) {
        console.error(error);
      }
    };

    if (!stream) {
      getMediaStream();
    }
  }, []);
  
  const answerCall = (callerId, signalData) => {
    console.log("callerId:", callerId);
    console.log("signalData:", signalData);

    const peerConnection = new RTCPeerConnection();

    if (stream) {
      stream.getTracks().forEach((track) => {
        console.log("trackData", track);
        peerConnection.addTrack(track, stream);
      });
    }

    peerConnection.setRemoteDescription(new RTCSessionDescription(signalData));

    peerConnection
      .createAnswer()
      .then((answer) => {
        return peerConnection.setLocalDescription(answer);
      })
      .then(() => {
        socket.current.emit("answerCall", {
          signal: peerConnection.localDescription,
          to: callerId,
        });
      });
    peerConnection.ontrack = (event) => {
      console.log("inside event track of anserCall");

      if (event.streams && event.streams[0]) {
        userVideo.current.srcObject = event.streams[0];
        console.log(event.streams[0].getTracks(), "mediaStream");
        setVideo(event.streams[0]);

        if (userVideo.current.srcObject) {
          console.log("userVideo checking :", userVideo.current.srcObject);
        }
      }
    };

    setCallAccepted(true);

    peerConnectionRef.current = peerConnection;
  };

  useEffect(() => {
    socket.current.on("callEnded", () => {
      console.log("Call ended event received");
      setCallEnded(true);
      peerConnectionRef.current = null;

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current.distroy();
        peerConnectionRef.current = null;
      }
      onClose();
    });
  }, [socket.current, currentUser]);

  const handleCallEnd = () => {
    console.log("inside cal end");
    setCallEnded(true);
    onClose();
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });

      // Set srcObject to null to stop video playback
      if (myVideo.current) {
        myVideo.current.srcObject = null;
      }
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    socket.current.emit("callEnded", { userId: receiverId });
  };

  // useEffect(() => {
  //   if (userVideo.current && callAccepted && !callEnded && video) {
  //     userVideo.current.srcObject = video;
  //   } else {
  //     console.log("Video track is not available or not live.");
  //   }
  // }, [video, callAccepted, callEnded]);

  return (
    <StyledModal
      open={open}
      onClose={onClose}
      aria-labelledby="video-call-modal"
      aria-describedby="video-call-description"
    >
      <ModalContent>
        <h2 id="video-call-modal">
          {isIncomingCall ? "Incoming Video Call" : "Ongoing Video Call"}
        </h2>

        <VideoContainer>
          {stream && (
            <>
              <video
                playsInline
                ref={myVideo}
                autoPlay
                style={{
                  width: callAccepted ? "150px" : "400px",
                  marginBottom: "1rem",
                  position: callAccepted && !callEnded ? "absolute" : "static",
                  top: callAccepted && !callEnded ? 140 : "auto",
                  right: callAccepted && !callEnded ? 130 : "auto",
                  zIndex: callAccepted && !callEnded ? 1 : "auto",
                  border: callAccepted && !callEnded ? "1px solid red" : "none",
                  borderRadius: callAccepted && !callEnded ? "8px" : "0",
                  boxShadow: callAccepted && !callEnded ? 5 : "none",
                }}
              />
              {!isIncomingCall && !callAccepted && <h4>calling ....</h4>}
            </>
          )}
          {isIncomingCall && !callAccepted && (
            <CallerInfo>
              <h1>{name} is calling...</h1>
            </CallerInfo>
          )}
          <ButtonContainer>
            {isIncomingCall && !callAccepted && (
              <StyledButton
                variant="contained"
                color="primary"
                onClick={() => answerCall(caller, callerSignal)}
              >
                <PhoneIcon />
              </StyledButton>
            )}
            <StyledButton
              variant="contained"
              color="secondary"
              onClick={handleCallEnd}
            >
              <CallEndIcon />
            </StyledButton>
          </ButtonContainer>
        </VideoContainer>

        <VideoContainer>
          {callAccepted && !callEnded && (
            <>
              <video
                style={{
                  width: "100%",
                  height: "400px",
                  maxWidth: "400px",
                  border: "1px solid red",
                  borderRadius: "8px",
                }}
                playsInline
                ref={userVideo}
                autoPlay
                muted
              />
            </>
          )}
        </VideoContainer>

        {/* <StyledButton
          variant="contained"
          color="primary"
          onClick={() => answerCall(caller, callerSignal)}
        >
          <PhoneIcon />
        </StyledButton>
        <StyledButton
          variant="contained"
          color="secondary"
          style={{ borderRadius: "50%", width: "40px" }}
          onClick={handleCallEnd}
        >
          <CallEndIcon />
        </StyledButton> */}
      </ModalContent>
    </StyledModal>
  );
};

export default VideoCallModal;
