import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Avatar,
  Box,
  Divider,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Modal from "react-modal";
import InputEmoji from "react-input-emoji";

import WidgetWrapper from "../../components/WidgetWrapper";
import Friend from "../../components/Friend";
import FlexBetween from "../../components/FlexBetween";
import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  SendOutlined,
  ShareOutlined,
} from "@mui/icons-material";
import UserImage from "../../components/UserImage";
import {
  useAddPostCommentMutation,
  useLikeAndUnlikePostMutation,
} from "../../slices/PostApiSlice";
import { useCreateChatMutation } from "../../slices/chatApiSlice";
import { useAddMessagesMutation } from "../../slices/messageApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { setPost } from "../../slices/AuthSlice";

const PosViewModal = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userProfilePic,
  likes,
  comments,
}) => {
  const [showFullComment, setShowFullComment] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  // const [newComment ,setNewComment]=useState("")
  const [isComments, setIsComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.authUser);
  // console.log(userInfo, "<postwidget");
  const [likeAndUnlikePost] = useLikeAndUnlikePostMutation();
  const [addPostComment] = useAddPostCommentMutation();
  const [createChat] = useCreateChatMutation();
  const [addMessage] = useAddMessagesMutation();


  //   const postUserId = postData.userId;

  //   const navigate = useNavigate();

  // const [getFriends] = useGetFriendsMutation();
  const loggedInUserId = userInfo._id;
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;
  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

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
      transform: "translate(-50%, -50%)",
    },
  };

  const openShareModal = () => {
    setShareModalOpen(true);

    // console.log("share model is opend", isShareModalOpen);
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
        const selectedFriend = userInfo.friends.find(
          (friend) => friend._id === userId
        );

        // Construct the post link and share it with the selected friend
        const postLink = `/posts/${postId}`;

        const senderId = userInfo._id;
        let receiverId = selectedFriend._id;
        // console.log(senderId, "senderId");
        try {
          const data = await createChat({ senderId, receiverId }).unwrap();
          // console.log(data);
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
    console.log("comment sesssion", commentInput);
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
      // console.log("Comment submitted:", commentInput);

      setCommentInput("");
    } catch (error) {
      console.log(error);
    }
  };
  const handleToggleComment = () => {
    setShowFullComment(!showFullComment);
  };
  const commentLimit = isNonMobileScreens ? 50 : 30;
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
                <FavoriteBorderOutlined />
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
      >
        {/* <ShareModal /> */}
        <div>
          <Typography variant="h3" className="my-3">
            Share
          </Typography>
          {userInfo.friends.map((friend) => (
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
                <UserImage image={friend.profilePic} size="40px" />
                <Box
                  marginLeft={3}
                  // onClick={(e) => {
                  //   e.preventDefault();
                  //   openChat(friend._id);
                  // }}
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
                    {friend.userName}
                  </Typography>
                </Box>
              </label>
            </div>
          ))}
          <button className=" my-3" onClick={closeShareModal}>
            Close
          </button>
          <button className="my-3 ms-5 ps-4" onClick={sharePost}>
            Send
          </button>
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
              "-ms-overflow-style": "none",
              "&::-webkit-scrollbar": {
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

export default PosViewModal;
