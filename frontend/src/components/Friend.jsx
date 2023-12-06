import {
  Chat,
  PersonAddOutlined,
  PersonRemoveOutlined,
} from "@mui/icons-material";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setFriends, setPosts } from "../slices/AuthSlice";
import FlexBetween from "./FlexBetween";
import UserImage from "./UserImage";
import { useAddFriendMutation } from "../slices/UsersApiSlice";
import PostMenu from "./PostMenu";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  useDeletePostMutation,
  useGetFeedPostMutation,
} from "../slices/PostApiSlice";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
const ITEM_HEIGHT = 38;

const Friend = ({
  friendId,
  name,
  subtitle,
  userProfilePic,
  postId,
  friendList = false,
}) => {
  const options = ["Edit", "Delete", "Cancel"];

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.authUser);
  const { _id: userId } = userInfo;

  const { following } = userInfo;

  const { palette } = useTheme();
  const primaryLight = palette.primary.light;
  const primaryDark = palette.primary.dark;
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [deletePost] = useDeletePostMutation();
  const [getFeedPost] = useGetFeedPostMutation();

  const [addFriend] = useAddFriendMutation();
  console.log(friendList, "frinedlist");

  const isFriend =
    userId !== friendId
      ? following.find((friend) => friend._id === friendId)
      : null;

  const patchFriend = async () => {
    try {
      const data = await addFriend({ friendId }).unwrap();
      dispatch(
        setFriends({ followers: data.followers, following: data.following })
      );
    } catch (error) {
      console.log(error.data.message, "checking add friend error");
      toast.error(error.data.message);
    }
  };
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const postDelete = async () => {
    await deletePost({ postId }).unwrap();
    const data = await getFeedPost().unwrap();
    dispatch(setPosts({ posts: data }));

    handleClose(); // Close the menu after deleting the post
  };

  return (
    <FlexBetween>
      {<Toaster position="top-right" reverseOrder={false}></Toaster>}
      <FlexBetween gap="1rem">
        <UserImage image={userProfilePic} size="55px" />
        <Box
          onClick={() => {
            navigate(`/profile/${friendId}`);
            navigate(0);
          }}
        >
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
            {name}
          </Typography>
          <Typography color={medium} fontSize="0.75rem">
            {subtitle}
          </Typography>
        </Box>
      </FlexBetween>
      {friendList === true ? null : (
        <>
          {isFriend !== null && (
            <>
              {isFriend ? (
                // <PersonRemoveOutlined sx={{ color: primaryDark }} />
                <PostMenu postId={postId} friendId={friendId} isFriend={true} />
              ) : (
                <>
                  <div className="d-flex align-items-center">
                    <IconButton onClick={patchFriend}>
                      {/* <PersonAddOutlined sx={{ color: primaryDark }} /> */}
                      <span className="btn btn-sm btn-outline-primary">
                        {" "}
                        Follow
                      </span>
                    </IconButton>
                    <PostMenu
                      postId={postId}
                      friendId={friendId}
                      isFriend={false}
                    />
                  </div>
                </>
              )}
            </>
          )}
          {userId === friendId && (
            <>
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
                      onClick={option === "Delete" ? postDelete : handleClose}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </Menu>
              </div>
            </>
          )}
        </>
      )}
    </FlexBetween>
  );
};

export default Friend;
