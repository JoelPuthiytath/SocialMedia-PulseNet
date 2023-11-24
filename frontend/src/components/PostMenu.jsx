import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  useDeletePostMutation,
  useReportPostMutation,
} from "../slices/PostApiSlice";
import { useRemoveFriendMutation } from "../slices/UsersApiSlice";
import { setFriends } from "../slices/AuthSlice";
import { useDispatch, useSelector } from "react-redux";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { toast } from "react-toastify";

const ITEM_HEIGHT = 38;

export default function LongMenu({ postId, friendId }) {
  console.log(postId, "postId");

  const options = ["Unfollow", `${postId ? "Report" : "Cancel"}`];

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  // const [deletePost] = useDeletePostMutation();
  const [removeFriend] = useRemoveFriendMutation();
  const [reportPost] = useReportPostMutation();
  const dispatch = useDispatch();

  // State for the reporting dialog
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const unFriendUser = async () => {
    const data = await removeFriend({ friendId }).unwrap();
    dispatch(
      setFriends({ following: data.following, followers: data.followers })
    );
    console.log("removeFriend");
    handleClose();
  };

  const handleReportOption = () => {
    setReportDialogOpen(true);
    handleClose();
  };

  const handleReportDialogClose = () => {
    setReportDialogOpen(false);
  };

  const handleReportSubmit = async () => {
    // Handle the report submission here (send the report reason to the server or perform any other action)
    // You can use the reportReason state for this purpose
    try {
      console.log("Report reason:", reportReason);
      const data = await reportPost({ postId, reportReason }).unwrap();
      console.log(data, "reportData");
      toast(data.message);
    } catch (error) {
      toast(error);
    }
    setReportDialogOpen(false);
  };

  return (
    <div>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? "long-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        style={{
          fontSize: "16px",
          width: "32px",
          height: "32px",
        }}
      >
        <MoreVertIcon style={{ fontSize: "16px" }} />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          "aria-labelledby": "long-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: "20ch",
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option}
            onClick={
              option === "Unfollow"
                ? unFriendUser
                : option === "Report"
                ? handleReportOption
                : handleClose
            }
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
      <Dialog open={reportDialogOpen} onClose={handleReportDialogClose}>
        <DialogTitle>Report Post</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason for Reporting"
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          />
          <Button
            className="mt-2"
            variant="contained"
            color="primary"
            onClick={handleReportSubmit}
          >
            Submit Report
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
