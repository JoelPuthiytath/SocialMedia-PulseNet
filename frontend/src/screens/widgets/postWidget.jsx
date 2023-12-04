import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  Height,
  SendOutlined,
  ShareOutlined,
} from "@mui/icons-material";
import InputEmoji from "react-input-emoji";
import {
  Alert,
  Avatar,
  Box,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FlexBetween from "../../components/FlexBetween";
import Friend from "../../components/Friend";
import WidgetWrapper from "../../components/WidgetWrapper";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost } from "../../slices/AuthSlice";
import {
  useAddPostCommentMutation,
  useLikeAndUnlikePostMutation,
} from "../../slices/PostApiSlice";
import { ShareModal } from "../../components/shareModel";
import Modal from "react-modal";

import "./postWidgetStyle.css";
import { useGetFriendsMutation } from "../../slices/UsersApiSlice";
import UserImage from "../../components/UserImage";
import { useCreateChatMutation } from "../../slices/chatApiSlice";
import { Link, useNavigate } from "react-router-dom";
import { useAddMessagesMutation } from "../../slices/messageApiSlice";

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userProfilePic,
  likes,
  comments,
  socket,
}) => {
  const [isComments, setIsComments] = useState(false);
  const [showFullComment, setShowFullComment] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  // const [newComment ,setNewComment]=useState("")
  const [commentInput, setCommentInput] = useState("");

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.authUser);

  // console.log(userInfo, "<postwidget");
  const [likeAndUnlikePost] = useLikeAndUnlikePostMutation();
  const [addPostComment] = useAddPostCommentMutation();
  const [createChat] = useCreateChatMutation();
  const [addMessage] = useAddMessagesMutation();

  const navigate = useNavigate();

  // const [getFriends] = useGetFriendsMutation();
  const loggedInUserId = userInfo._id;
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;
  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  Modal.setAppElement("#root");
  // this si for share the post (modal)
  const customStyles = {
    content: {
      top: "40%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      minHeight: "40vh",
      maxHeight: "80vh",
      overflowY: "scroll",
      width: "300px",
      marginRight: "-50%",
      transition: "opacity 1s",
      transform: "translate(-50%, -50%)",
    },
  };

  const openShareModal = () => {
    setShareModalOpen(true);
  };

  const closeShareModal = () => {
    setShareModalOpen(false);
  };

  const handleUserCheckboxChange = (userId) => {
    setSelectedUsers((prevSelectedUsers) => {
      if (prevSelectedUsers.includes(userId)) {
        // If the user is already selected, remove them
        return prevSelectedUsers.filter((id) => id !== userId);
      } else {
        // If the user is not selected, add them
        return [...prevSelectedUsers, userId];
      }
    });
  };

  const sharePost = async () => {
    if (selectedUsers.length > 0) {
      selectedUsers.forEach(async (userId) => {
        const selectedFriend = userInfo.followers.find(
          (friend) => friend._id === userId
        );

        // Construct the post link and share it with the selected friend
        // eslint-disable-next-line no-undef
        const postLink = `http://localhost:5000/posts/${postId}`;

        const senderId = userInfo._id;
        let receiverId = selectedFriend._id;

        try {
          const data = await createChat({ senderId, receiverId }).unwrap();

          const message = {
            senderId: senderId,
            text: postLink,
            chatId: data._id,
          };
          await addMessage(message).unwrap();
          setShareModalOpen(false);
        } catch (error) {
          console.log(error);
        }
      });
    } else {
      // Handle the case where no user is selected
      console.log("Please select at least one user to share the post with.");
    }
  };
  const handleNotification = (type) => {
    if (postUserId === userInfo._id) return null;
    socket.current.emit("sendNotification", {
      senderId: userInfo.userName,
      image: userInfo.profilePic,
      receiverId: postUserId,
      postId: postId,
      time: new Date().getTime(),
      type: type,
    });
  };

  const patchLike = async () => {
    const data = await likeAndUnlikePost({
      postId,
      userId: loggedInUserId,
    }).unwrap();
    dispatch(setPost({ post: data }));
  };

  // this si for cmt the post

  const handleChange = async (commentInput) => {
    setCommentInput(commentInput);
  };

  const handleCommentSubmit = async () => {
    if (commentInput.trim() === "") {
      console.log("comment is empty");
      return;
    }
    try {
      const comment = {
        postId: postId,
        userName: userInfo.userName,
        comment: commentInput,
        profilePic: userInfo.profilePic,
      };
      const data = await addPostComment(comment).unwrap();
      dispatch(setPost({ post: data }));

      setCommentInput("");
      handleNotification(2);
    } catch (error) {
      console.log(error);
    }
  };
  const handleToggleComment = () => {
    setShowFullComment(!showFullComment);
  };
  const commentLimit = isNonMobileScreens ? 50 : 30;

  // ########### END

  return (
    <WidgetWrapper m="2rem 0">
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userProfilePic={userProfilePic}
        postId={postId}
      />
      <Typography color={main} sx={{ mt: "1rem" }}>
        {description}
      </Typography>
      {picturePath && (
        <img
          width="100%"
          height="auto"
          alt="post"
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={`/image/${picturePath}`}
        />
        // <Typography>{picturePath}</Typography>
      )}
      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike}>
              {isLiked ? (
                <FavoriteOutlined sx={{ color: primary }} />
              ) : (
                <IconButton
                  onClick={() => {
                    handleNotification(1);
                  }}
                >
                  <FavoriteBorderOutlined />
                </IconButton>
              )}
            </IconButton>
            <Typography>{likeCount}</Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton onClick={() => setIsComments(!isComments)}>
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{comments.length}</Typography>
          </FlexBetween>
        </FlexBetween>

        <IconButton onClick={openShareModal}>
          <ShareOutlined />
        </IconButton>
      </FlexBetween>
      <Modal
        isOpen={isShareModalOpen}
        onRequestClose={closeShareModal}
        style={customStyles}
        contentLabel="Share Post Modal"
        appElement={document.getElementById("root")}
      >
        {/* <ShareModal /> */}
        <div>
          <Typography variant="h3" className="my-3">
            Share
          </Typography>
          {userInfo.followers.length < 1 ? (
            <>
              <Alert icon={false} severity="warning">
                Your following list is empty!
              </Alert>
              <p style={{ fontSize: "small", marginTop: "1.5rem" }}>
                <small>You can only share posts with your followers.</small>
              </p>
              <button
                className="my-3 float-right btn btn-primary"
                onClick={closeShareModal}
              >
                Close
              </button>
            </>
          ) : (
            <>
              {userInfo.followers.map((friend) => (
                <div
                  key={friend._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                  className="my-2"
                >
                  <input
                    className="mx-3"
                    type="checkbox"
                    value={friend._id}
                    id={friend._id}
                    checked={selectedUsers.includes(friend._id)}
                    onChange={() => handleUserCheckboxChange(friend._id)}
                  />
                  <label htmlFor={friend._id}>
                    <Box display={"flex"} alignItems={"center"}>
                      <UserImage image={friend.profilePic} size="40px" />
                      <Typography
                        className="ms-2"
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
                        {friend.userName}
                      </Typography>
                    </Box>
                  </label>
                </div>
              ))}
              <button className="my-3" onClick={closeShareModal}>
                Close
              </button>
              <button className="my-3 ms-5 ps-4" onClick={sharePost}>
                Send
              </button>
            </>
          )}
        </div>
      </Modal>
      {isComments && (
        <>
          <Box
            mt="0.3rem"
            height="40vh"
            style={{
              overflowY: "scroll",
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
              msOverflowStyle: "none",
              "&::WebkitScrollbar": {
                display: "none",
              },
            }}
          >
            {comments.map((item, i) => (
              <Box key={`${name}-${i}`}>
                <Divider />
                <div
                  style={{
                    alignItems: "center",
                    marginTop: "0.3rem",
                    // width: "auto",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {item.profilePic === "" ? (
                      <Avatar
                        src={`https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`}
                        sx={{ width: 40, height: 40 }}
                        alt="profile"
                      />
                    ) : (
                      <Avatar
                        alt="profile"
                        src={item.profilePic}
                        sx={{ width: 30, height: 30 }}
                      />
                    )}
                    <Typography
                      style={{
                        marginLeft: "0.6rem",
                        fontSize: 15,
                        marginTop: 5,
                      }}
                      variant="body1"
                    >
                      {item.userName}
                    </Typography>
                  </div>
                  <div>
                    <Typography
                      style={{
                        width: isNonMobileScreens ? "25rem" : "10rem",
                        marginLeft: "3.4375rem",
                        textAlign: "start",
                        whiteSpace: showFullComment ? "normal" : "nowrap",
                        overflowWrap: "break-word",
                        fontSize: "auto",
                        textOverflow: showFullComment ? "initial" : "ellipsis",
                      }}
                      variant="body1"
                    >
                      {showFullComment
                        ? item.comment
                        : item.comment.length > commentLimit
                        ? item.comment.slice(0, commentLimit) + "..."
                        : item.comment}
                    </Typography>
                    {item.comment.length > commentLimit && (
                      <Typography
                        variant="subtitle1"
                        style={{
                          cursor: "pointer",
                          color: "blue",
                          marginLeft: "3.4375rem",
                        }}
                        onClick={handleToggleComment}
                      >
                        {showFullComment ? "See Less" : "See More"}
                      </Typography>
                    )}
                  </div>
                  <Typography
                    style={{
                      marginLeft: "6.1rem",
                      textAlign: "start",
                      marginBottom: "0.4rem",
                      color: "#aaa",
                      fontSize: 11,
                    }}
                  >
                    Reply
                  </Typography>
                </div>
              </Box>
            ))}
            <Divider />
          </Box>
          <Box
            alignItems={"center"}
            justifyContent={"center"}
            display={"flex"}
            gap={4}
          >
            <Avatar
              alt="profile"
              src={userInfo.profilePic}
              sx={{ width: 40, height: 40 }}
            />
            <InputEmoji
              value={commentInput}
              placeholder="Write a comment"
              onChange={handleChange}
            />
            <IconButton onClick={handleCommentSubmit}>
              <SendOutlined />
            </IconButton>
          </Box>
        </>
      )}
    </WidgetWrapper>
  );
};

export default PostWidget;
