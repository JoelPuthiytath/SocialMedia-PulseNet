import Modal from "@mui/material/Modal";
import { styled } from "@mui/system";
import CallEndIcon from "@mui/icons-material/CallEnd";
import { useEffect, useRef, useState } from "react";
// import global from "global";
// import * as process from "process";
// global.process = process;
// import Peer from "peerjs";

import { Button } from "@mui/material";

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
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
}));

const VideoCallModal = ({
  open,
  onClose,
  socket,
  myVideo,
  stream,
  currentUser,
  callerSignal,
  receiverId,
  caller,
  name,
  isIncomingCall,
}) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [me, setMe] = useState("");

  const userVideo = useRef();

  const peerConnectionRef = useRef();

  useEffect(() => {
    socket.current.emit("getSocketId", { currentUser });

    socket.current.on("me", (socketId) => {
      console.log("Received socketId:", socketId);
      setMe(socketId);
    });

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

  useEffect(() => {
    const callUser = () => {
      const peerConnection = new RTCPeerConnection();
      console.log("callUser");
      if (stream) {
        console.log("inside stream");
        stream.getTracks().forEach((track) => {
          console.log(track, "track");
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

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.current.emit("ice-candidate", {
            to: receiverId,
            candidate: event.candidate,
          });
        }
      };

      peerConnection.ontrack = (event) => {
        console.log("inside event track of callUser");
        if (event.streams && event.streams[0]) {
          console.log("Received video track:", event.streams[0]);
          if (userVideo.current) {
            userVideo.current.srcObject = event.streams[0];
          }
        }
      };

      socket.current.on("callAccepted", (signal) => {
        console.log("call accepted");
        setCallAccepted(true);
        peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
      });

      peerConnectionRef.current = peerConnection;
    };

    if (!isIncomingCall) {
      callUser();
    }
  }, [isIncomingCall, me, receiverId, socket, name, stream]);

  const answerCall = (callerId, signalData) => {
    console.log("callerId:", callerId);
    console.log("signalData:", signalData);

    const peerConnection = new RTCPeerConnection();

    if (stream) {
      console.log("inside answerCAll stream", stream);
      stream.getTracks().forEach((track) => {
        console.log("track", track);
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

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.emit("ice-candidate", {
          to: callerId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.ontrack = (event) => {
      console.log("inside event track of anserCall");

      if (event.streams && event.streams[0]) {
        console.log("Video tracks:", event.streams[0].getVideoTracks());
        userVideo.current.srcObject = event.streams[0];
        console.log("userVideo checking :", userVideo.current.srcObject);
      }
    };

    setCallAccepted(true);

    peerConnectionRef.current = peerConnection;
  };

  const handleCallEnd = () => {
    setCallEnded(true);
    onClose();

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    socket.current.emit("callEnded", { userId: receiverId });
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
          {isIncomingCall ? "Incoming Video Call" : "Ongoing Video Call"} Id:{" "}
          {me}
        </h2>
        <h3 style={{ textAlign: "center", color: "#fff" }}>id: {me}</h3>

        <div className="video">
          {stream && (
            <>
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                style={{ width: "300px", marginBottom: "1rem" }}
              />

              {!isIncomingCall && !callAccepted && <h4>calling ....</h4>}
            </>
          )}
        </div>

        <div className="video">
          {callAccepted && !callEnded && (
            <video
              playsInline
              ref={userVideo}
              autoPlay
              style={{
                width: "300px",
                marginBottom: "1rem",
                height: "200px",
                border: "1px solid red",
              }}
            />
          )}
        </div>

        {isIncomingCall && !callAccepted && (
          <div className="caller">
            <h1>{name} is calling...</h1>
            <Button
              variant="contained"
              color="primary"
              onClick={() => answerCall(caller, callerSignal)}
            >
              Answer
            </Button>
          </div>
        )}

        <div>
          <Button variant="contained" color="secondary" onClick={handleCallEnd}>
            End Call
          </Button>
        </div>
      </ModalContent>
    </StyledModal>
  );
};

export default VideoCallModal;
