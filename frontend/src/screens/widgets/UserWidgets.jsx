import {
  ManageAccountsOutlined,
  EditOutlined,
  Message,
  LocationOnOutlined,
  WorkOutlineOutlined,
} from "@mui/icons-material";

import {
  Box,
  Typography,
  Divider,
  useTheme,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Link,
} from "@mui/material";
import UserImage from "../../components/UserImage";
import FlexBetween from "../../components/FlexBetween";
import WidgetWrapper from "../../components/WidgetWrapper";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAddFriendMutation,
  useAddSocialProfileMutation,
  useBlockUserMutation,
  useFetchBlockedUsersMutation,
  useGetUserByIdMutation,
  useGetUserMutation,
  useLogoutMutation,
  useRemoveFriendMutation,
  useReportUserMutation,
  useUnblockUserMutation,
} from "../../slices/UsersApiSlice";
import Loader from "../../loader/MoonLoader";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { toast } from "react-toastify";

import linkedinIcon from "../../assets/img/linkedin.png";
import { useCreateChatMutation } from "../../slices/chatApiSlice";
import {
  clearCredentials,
  setCredentials,
  setFriends,
} from "../../slices/AuthSlice";
import { useRef } from "react";

const ITEM_HEIGHT = 38;

const UserWidget = ({ userId, picturePath }) => {
  const { userInfo } = useSelector((state) => state.authUser);

  const isBlocked = userInfo.blockedUsers.some(
    (blockedUser) => blockedUser === userId
  );
  const isFriend = userInfo.following.some((frined) => frined._id === userId);
  // console.log(isFriend, "is friend");

  // console.log(isBlocked);
  const string = isFriend ? "Unfollow" : "Follow";
  const string2 = isBlocked ? "Unblock" : "Block";
  const options = [string, string2, "Report", "Cancel"];
  const options2 = ["Edit Profile", "Blocked Users", "Cancel"];

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // State for the reporting dialog
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isEditingTwitter, setIsEditingTwitter] = useState(false);
  const [twitterProfileLink, setTwitterProfileLink] = useState("");
  const [isEditingLinkedin, setIsEditingLinkedin] = useState(false);
  const [profileLink, setProfileLink] = useState("");
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [clickFetchblockedUsers, setClickFetchblockedUsers] = useState(false);

  const [user, setUser] = useState(null);
  const { palette } = useTheme();
  const navigate = useNavigate();
  const dark = palette.neutral.dark;
  const medium = palette.neutral.medium;
  const main = palette.neutral.main;
  const [getUserById, { isLoading }] = useGetUserByIdMutation();
  const [createChat] = useCreateChatMutation();
  const [reportUser] = useReportUserMutation();
  const [blockUser] = useBlockUserMutation();
  const [unblockUser] = useUnblockUserMutation();
  const [logout] = useLogoutMutation();
  const [addSocialProfile] = useAddSocialProfileMutation();
  const [fetchBlocedUsers] = useFetchBlockedUsersMutation();
  const [addFriend] = useAddFriendMutation();
  const [removeFriend] = useRemoveFriendMutation();
  const hasMounted = useRef(false);

  const dispatch = useDispatch();

  const getUserInfo = async () => {
    try {
      const data = await getUserById({ userId }).unwrap();
      console.log(data, "user data");
      setUser(data);
    } catch (error) {
      if (error.data.blocked) {
        await logout();
        dispatch(clearCredentials());
        navigate("/username");
        toast.warning("You are restricted to use this app");
      }
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setClickFetchblockedUsers(false);
  };

  useEffect(() => {
    getUserInfo();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) {
    return null;
  }

  const { firstName, lastName, address, followers, following } = user;

  const handleBlockUser = async () => {
    try {
      const userIdToBlock = userId;

      const data = await blockUser({ userIdToBlock }).unwrap();

      dispatch(setCredentials({ userInfo: { ...data } }));
      handleClose();

      getUserInfo();
    } catch (error) {
      toast(error);
    }
  };

  const handleUnBlock = async () => {
    try {
      // const userIdToUnblock = id === undefined ? userId : id;
      const userIdToUnblock = userId;
      const data = await unblockUser({ userIdToUnblock }).unwrap();
      console.log(data, "blockuser");
      dispatch(setCredentials({ userInfo: { ...data } }));
      handleClose();

      getUserInfo();
    } catch (error) {
      console.log(error);
    }

    // id === undefined ? handleClose() : navigate(`/profile/${id}`);
  };

  const handleFetchUsers = async () => {
    setClickFetchblockedUsers(true);
    setAnchorEl(null);
    const data = await fetchBlocedUsers().unwrap();

    setBlockedUsers(data);
  };

  async function openChat(e) {
    e.preventDefault();
    const senderId = userInfo._id;
    const receiverId = userId;

    try {
      await createChat({ senderId, receiverId }).unwrap();

      navigate("/messenger");
    } catch (error) {
      console.log(error);
      toast.error(error.data.message);
    }
  }

  const handleReportOption = () => {
    setReportDialogOpen(true);
    handleClose();
  };

  const handleReportDialogClose = () => {
    setReportDialogOpen(false);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleReportUser = async () => {
    try {
      const data = await reportUser({
        reportedUserId: userId,
        reportReason,
      }).unwrap();

      toast(data.message);
    } catch (error) {
      toast(error);
    }
    setReportDialogOpen(false);
  };

  const handleEditProfile = async () => {
    navigate("/login-profile");
  };

  const handleLinkedinEditClick = () => {
    setIsEditingLinkedin(!isEditingLinkedin);
  };

  const handleSaveLinkedinLink = async () => {
    const user = await addSocialProfile({ profileLink }).unwrap();

    dispatch(setCredentials({ userInfo: { ...user } }));
    setIsEditingLinkedin(false);
  };

  const handleLinkedinLinkClick = () => {
    // navigate(profileLink);
    window.open(user.socialProfile);
  };

  const handleFollow = async () => {
    try {
      const friendId = userId;
      console.log("haiiii");
      const data = await addFriend({ friendId }).unwrap();
      dispatch(
        setFriends({ followers: data.followers, following: data.following })
      );
      handleClose();

      getUserInfo();
    } catch (error) {
      console.log(error);
    }
  };
  // console.log(userInfo, "userInfo");
  const handleUnfollow = async () => {
    try {
      const friendId = userId;
      const data = await removeFriend({ friendId }).unwrap();
      dispatch(
        setFriends({ following: data.following, followers: data.followers })
      );
      handleClose();

      getUserInfo();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <WidgetWrapper>
      {/* FIRST ROW */}

      {isLoading ? (
        <>
          <Loader size={30} color="#36d7b7" />
        </>
      ) : (
        <>
          <FlexBetween gap="0.5rem" pb="1.1rem">
            <FlexBetween
              gap="1rem"
              onClick={() => navigate(`/profile/${userId}`)}
            >
              <UserImage image={picturePath} />
              <Box>
                <Typography
                  variant="h4"
                  color={dark}
                  fontWeight="500"
                  sx={{
                    "&:hover": {
                      color: palette.primary.light,
                      cursor: "pointer",
                    },
                  }}
                >
                  {firstName} {lastName}
                </Typography>
              </Box>
            </FlexBetween>
            {userInfo._id !== userId ? (
              <>
                <IconButton onClick={openChat}>
                  <Message />
                </IconButton>
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
                          option === "Follow"
                            ? handleFollow
                            : option === "Unfollow"
                            ? handleUnfollow
                            : option === "Block"
                            ? handleBlockUser
                            : option === "Unblock"
                            ? handleUnBlock
                            : option === "Report"
                            ? handleReportOption
                            : handleClose
                        }
                      >
                        {option}
                      </MenuItem>
                    ))}
                  </Menu>
                  <Dialog
                    open={reportDialogOpen}
                    onClose={handleReportDialogClose}
                  >
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
                        onClick={handleReportUser}
                      >
                        Submit Report
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
              </>
            ) : (
              <>
                <IconButton
                  aria-label="more"
                  id="long-button"
                  aria-controls={open ? "long-menu" : undefined}
                  aria-expanded={open ? "true" : undefined}
                  aria-haspopup="true"
                  onClick={handleClick}
                >
                  <ManageAccountsOutlined />
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
                  {options2.map((option) => (
                    <MenuItem
                      key={option}
                      onClick={
                        option === "Edit Profile"
                          ? handleEditProfile
                          : option === "Blocked Users"
                          ? handleFetchUsers
                          : handleClose
                      }
                    >
                      {option}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
          </FlexBetween>

          <Divider />
          <Box p="1rem 0">
            <Box display="flex" gap="1rem" mb="0.5rem">
              <Typography variant="h5" className="ms-2 text-info">
                Followers{" "}
                <Typography className="ms-4" color={medium}>
                  {isFriend ? followers?.length : userInfo.followers.length}
                </Typography>
              </Typography>
              <Typography variant="h5" className="ms-4 text-info">
                Following{" "}
                <Typography className="ms-3" color={medium}>
                  {isFriend ? following?.length : userInfo.following.length}
                </Typography>
              </Typography>
            </Box>
          </Box>
          <Divider />

          {clickFetchblockedUsers && (
            <Typography variant="h5" marginY={1}>
              blocked Accounts{" "}
              <span className="ms-5 me-2 text-danger">
                {" "}
                {blockedUsers.length}
              </span>
            </Typography>
          )}
          {clickFetchblockedUsers && blockedUsers.length > 0 ? (
            <>
              <div
                style={{
                  minHeight: "20vh",
                  height: "30vh",
                  overscrollBehaviorY: "auto",
                }}
              >
                <Table>
                  <TableBody>
                    {blockedUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell scope="5" style={{ width: "30%" }}>
                          <UserImage image={user.profilePic} size="40" />
                        </TableCell>
                        <TableCell
                          scope="auto"
                          style={{ fontSize: "0.9rem" }}
                          onClick={() => navigate(`/profile/${user._id}`)}
                        >
                          {user.firstName} {user.lastName}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <button
                className="my-3 float-right btn btn-sm btn-danger"
                onClick={handleClose}
              >
                close
              </button>
            </>
          ) : (
            <>
              <Box p="1rem 0">
                <Box display="flex" alignItems="center" gap="1rem" mb="0.5rem">
                  <LocationOnOutlined fontSize="large" sx={{ color: main }} />
                  <Typography
                    color={medium}
                  >{`${address.city}, ${address.state}, pin:${address.pinCode}`}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap="1rem">
                  <WorkOutlineOutlined fontSize="large" sx={{ color: main }} />
                  <Typography color={medium}>{address.city}</Typography>
                </Box>
              </Box>

              <Divider />

              <Divider />

              {/* FOURTH ROW */}
              <Box p="1rem 0">
                <Typography
                  fontSize="1rem"
                  color={main}
                  fontWeight="500"
                  mb="1rem"
                >
                  Social Profiles
                </Typography>

                <FlexBetween gap="1rem">
                  <FlexBetween gap="1rem">
                    <img
                      src={linkedinIcon}
                      alt="linkedin"
                      onClick={handleLinkedinLinkClick}
                    />
                    <Box>
                      <Typography color="primary" fontWeight="500">
                        Linkedin
                      </Typography>
                      <Typography color="textSecondary">
                        Network Platform
                      </Typography>
                    </Box>
                  </FlexBetween>
                  <IconButton onClick={handleLinkedinEditClick}>
                    <EditOutlined sx={{ color: "primary" }} />
                  </IconButton>
                </FlexBetween>
                {isEditingLinkedin && (
                  <Box mb="1rem" gap={2}>
                    <TextField
                      variant="standard"
                      id="profileLink"
                      label="Linkedin Profile Link"
                      value={profileLink}
                      onChange={(event) => setProfileLink(event.target.value)}
                    />
                    <Button
                      className="my-2 ms-2"
                      variant="contained"
                      color="primary"
                      onClick={handleSaveLinkedinLink}
                    >
                      Save
                    </Button>
                  </Box>
                )}
              </Box>
            </>
          )}
          {/* SECOND ROW */}
        </>
      )}
    </WidgetWrapper>
  );
};

export default UserWidget;
