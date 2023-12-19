import Modal from "@mui/material/Modal";
import { styled } from "@mui/system";
import CallEndIcon from "@mui/icons-material/CallEnd";
import PhoneIcon from "@mui/icons-material/Phone";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";

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
  // const [videoReady, setVideoReady] = useState(false);
  const [stream, setStream] = useState();
  const myVideo = useRef(null);
  const [video, setVideo] = useState(null);
  const userVideo = useRef(null);
  const peerConnectionRef = useRef(null);
  const [isAudioMuted, setIsAudioMuted] = useState(true);

  useEffect(() => {
    const initializeVideoCall = async (retryCount = 0) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setStream(stream);
        myVideo.current.srcObject = stream;
        console.log(myVideo.current.srcObject, "streaming");
      } catch (error) {
        console.error("Error getting user media:", error);
        if (retryCount < 3) {
          return initializeVideoCall(retryCount + 1);
        }
      }
    };

    initializeVideoCall();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  const answerCall = async (callerId, signalData) => {
    console.log("callerId:", callerId);
    console.log("signalData:", signalData);
    console.log("stream", stream);

    const peerConnection = new RTCPeerConnection();

    if (stream) {
      stream.getTracks().forEach((track) => {
        console.log("trackData", track);
        peerConnection.addTrack(track, stream);
      });
    }

    peerConnection.setRemoteDescription(new RTCSessionDescription(signalData));

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate:", event.candidate);
        socket.current.emit("ice-candidate", {
          target: callerId,
          candidate: event.candidate,
        });
      }
    };

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

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send the ICE candidate to the remote peer
        socket.current.emit("ice-candidate", {
          target: callerId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.ontrack = async (event) => {
      console.log("inside event track of anserCall");

      if (event.streams && event.streams[0]) {
        console.log(event.streams[0].getTracks(), "mediaStream");

        userVideo.current.srcObject = await event.streams[0];
        setVideo(event.streams[0]);

        if (userVideo.current.srcObject) {
          console.log("userVideo checking :", userVideo.current.srcObject);
        }
      }
    };

    socket.current.on("ice-candidate", (data) => {
      const { candidate } = data;

      peerConnection
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch((error) => {
          console.error("Error adding ICE candidate:", error);
        });
    });

    setCallAccepted(true);

    peerConnectionRef.current = peerConnection;
  };

  useEffect(() => {
    const callUser = async () => {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      });

      console.log("stream", stream);
      if (myVideo.current) {
        console.log(myVideo.current.srcObject, "my stream");
      }
      if (myVideo.current?.srcObject) {
        myVideo.current.srcObject.getTracks().forEach((track) => {
          console.log("inside track", track);

          peerConnection.addTrack(track, myVideo.current.srcObject);
        });
      }
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.current.emit("ice-candidate", {
            target: receiverId,
            candidate: event.candidate,
          });
        }
      };

      try {
        const offer = await peerConnection.createOffer();
        console.log("Offer created:", offer);
        await peerConnection.setLocalDescription(offer);
        console.log("Local description set:", peerConnection.localDescription);

        socket.current.emit("callUser", {
          userToCall: receiverId,
          signalData: peerConnection.localDescription,
          from: me,
          name: name,
        });
      } catch (error) {
        console.error(
          "Error creating offer or setting local description:",
          error
        );
      }

      socket.current.on("callAccepted", (signal) => {
        console.log("call accepted");
        setCallAccepted(true);
        peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
      });

      socket.current.on("ice-candidate", (data) => {
        const { candidate } = data;

        peerConnection
          .addIceCandidate(new RTCIceCandidate(candidate))
          .catch((error) => {
            console.error("Error adding ICE candidate:", error);
          });
      });

      peerConnection.ontrack = (event) => {
        console.log("inside event track of callUser");

        if (event.streams && event.streams[0]) {
          userVideo.current.srcObject = event.streams[0];
        }
      };
      peerConnectionRef.current = peerConnection;
    };

    if (!isIncomingCall) {
      callUser();
    }
  }, [isIncomingCall, me, name, receiverId, socket, stream]);

  useEffect(() => {
    socket.current.on("callEnded", () => {
      console.log("Call ended event received");
      setCallEnded(true);
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }

      if (myVideo.current) {
        myVideo.current.srcObject = null;
      }

      if (userVideo.current) {
        userVideo.current.srcObject = null;
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      onClose();
    });
  }, [socket.current, stream]);

  const handleCallEnd = () => {
    console.log("inside cal end");
    onClose();

    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    if (myVideo.current) {
      myVideo.current.srcObject = null;
    }

    if (userVideo.current) {
      userVideo.current.srcObject = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setCallEnded(true);

    socket.current.emit("callEnded", { userId: receiverId });
  };

  const toggleAudioMute = async () => {
    const tracks = await myVideo.current.srcObject.getAudioTracks();
    tracks.forEach((track) => {
      console.log(track);

      track.enabled = !isAudioMuted;
      console.log(track);
    });
    console.log(tracks);

    setIsAudioMuted(!isAudioMuted);
  };

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
            <StyledButton
              variant="contained"
              color={isAudioMuted ? "primary" : "secondary"}
              onClick={toggleAudioMute}
            >
              {isAudioMuted ? <MicIcon /> : <MicOffIcon />}
            </StyledButton>
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
          <>
            <video
              style={{
                width: "100%",
                height: "300px",
                maxWidth: "400px",
                display: callAccepted && !callEnded ? "block" : "none",
                border: "1px solid red",
                borderRadius: "8px",
              }}
              playsInline
              ref={userVideo}
              autoPlay
              muted
            />
          </>
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
