import Modal from "@mui/material/Modal";
import { styled } from "@mui/system";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import CallEndIcon from "@mui/icons-material/CallEnd";
import { useEffect, useState } from "react";

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

const VideoCallModal = ({ open, onClose, isIncomingCall, onCallEnd }) => {
  const [stream, setStream] = useState();
  
  const myVideo = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        console.log(stream, "stream");
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });

    socket.current.on("callUser", (data) => {
      console.log(data, "this is the data you're looking for");
      console.log("just checking");
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    });
  }, []);

  return (
    <StyledModal
      open={open}
      onClose={onClose}
      aria-labelledby="video-call-modal"
      aria-describedby="video-call-description"
    >
      <ModalContent>
        {isIncomingCall ? (
          <>
            <VideoCallIcon fontSize="large" color="primary" />
            <h2 id="video-call-modal">Incoming Video Call</h2>
            <p id="video-call-description">John Doe is calling...</p>
            <div>
              <button onClick={onCallEnd}>
                <CallEndIcon fontSize="large" color="error" />
              </button>
            </div>
          </>
        ) : (
          <>
            <VideoCallIcon fontSize="large" color="primary" />
            <h2 id="video-call-modal">Ongoing Video Call</h2>
            <p id="video-call-description">You are in a call with John Doe.</p>
            <div>
              <button onClick={onCallEnd}>
                <CallEndIcon fontSize="large" color="error" />
              </button>
            </div>
          </>
        )}
      </ModalContent>
    </StyledModal>
  );
};

export default VideoCallModal;
