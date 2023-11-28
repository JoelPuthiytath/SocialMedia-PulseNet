import Modal from "@mui/material/Modal";
import { styled } from "@mui/system";
import CallEndIcon from "@mui/icons-material/CallEnd";
import { useEffect, useRef, useState } from "react";

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
  myVideo,
  callAccepted,
  isIncomingCall,
  callEnded,
  userVideo,
  onCallEnd,
  answerCall, // Add answerCall prop
}) => {
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
            <h2 id="video-call-modal">Incoming Video Call</h2>
            <div className="video">
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                style={{ width: "300px" }}
              />
            </div>
            <p id="video-call-description">John Doe is calling...</p>
            <button color="#65a30d" className="btn" onClick={answerCall}>
              Accept
            </button>
            <div>
              <button onClick={onCallEnd}>
                <CallEndIcon fontSize="large" color="error" />
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="video-call-modal">Ongoing Video Call</h2>
            <div className="video">
              <video
                className="my-3"
                playsInline
                ref={myVideo}
                autoPlay
                style={{ width: "300px" }}
              />
              <span className="mt-3" id="video-call-description">
                Calling
              </span>
            </div>

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
