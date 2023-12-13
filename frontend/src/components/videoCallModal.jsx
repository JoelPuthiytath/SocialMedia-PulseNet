import Modal from "@mui/material/Modal";
import { styled } from "@mui/system";
import CallEndIcon from "@mui/icons-material/CallEnd";
import { useEffect, useRef, useState, useLayoutEffect } from "react";

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
  const myVideo = useRef();

  const userVideo = useRef();

  const peerConnectionRef = useRef();

  useEffect(() => {
    const getMediaStream = async () => {
      try {
        console.log("Requesting media stream...");
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            setStream(stream);
            myVideo.current.srcObject = stream;
            console.log("myVideo :", myVideo.current.srcObject);
            const callUser = () => {
              const peerConnection = new RTCPeerConnection();
              console.log("callUser");
              if (stream) {
                console.log("inside stream");
                stream.getTracks().forEach((track) => {
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

              socket.current.on("callAccepted", (signal) => {
                console.log("call accepted");
                setCallAccepted(true);
                peerConnection.setRemoteDescription(
                  new RTCSessionDescription(signal)
                );
              });

              peerConnection.ontrack = (event) => {
                console.log("inside event track of callUser");
                if (event.streams && event.streams[0]) {
                  if (userVideo.current) {
                    userVideo.current.srcObject = event.streams[0];
                    console.log(
                      "Received video track:",
                      userVideo.current.srcObject
                    );
                  }
                }
              };

              peerConnectionRef.current = peerConnection;
            };

            if (!isIncomingCall) {
              callUser();
            }
          })
          .catch((error) => {
            console.error("Error accessing user media:", error);
          });
      } catch (error) {
        console.error("Error accessing media:", error);
      }
    };
    if (!stream) {
      getMediaStream();
      return;
    }
  }, []);

  const answerCall = (callerId, signalData) => {
    console.log("callerId:", callerId);
    console.log("signalData:", signalData);

    const peerConnection = new RTCPeerConnection();

    if (stream) {
      stream.getTracks().forEach((track) => {
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
    setCallAccepted(true);

    peerConnection.ontrack = (event) => {
      console.log("inside event track of anserCall");

      if (event.streams && event.streams[0]) {
        userVideo.current.srcObject = event.streams[0];
        console.log("userVideo checking :", userVideo.current.srcObject);
      }
    };

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
          {isIncomingCall ? "Incoming Video Call" : "Ongoing Video Call"}
        </h2>

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
