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
  useAddSocialProfileMutation,
  useBlockUserMutation,
  useFetchBlockedUsersMutation,
  useGetUserByIdMutation,
  useGetUserMutation,
  useLogoutMutation,
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
import { clearCredentials, setCredentials } from "../../slices/AuthSlice";
import { useRef } from "react";

const ITEM_HEIGHT = 38;

const UserWidget = ({ userId, picturePath }) => {
  const { userInfo } = useSelector((state) => state.authUser);

  const isBlocked = userInfo.blockedUsers.some(
    (blockedUser) => blockedUser === userId
  );
  // console.log(isBlocked);
  const string = isBlocked ? "Unblock" : "Block";

  const options = [string, "Report", "Cancel"];
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
  const hasMounted = useRef(false);

  const dispatch = useDispatch();
  // console.log(userName, "< username in widgets");
  const getUserInfo = async () => {
    // const data = await getUser({ userName }).unwrap();
    const data = await getUserById({ userId }).unwrap();
    if (data.blocked) {
      await logout();
      dispatch(clearCredentials());
      toast.warning("You are restricted to use this app");
    }

  
    setUser(data);
  };

  useEffect(() => {
    // if (!hasMounted.current) {
    getUserInfo();
  
    //   hasMounted.current = true;
    // }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) {
    return null;
  }

  const {
    firstName,
    lastName,
    address,
    viewedProfile,
    impressions,
    followers,
    following,
  } = user;

  const handleBlockUser = async () => {
    try {
    
      const userIdToBlock = userId;
   
      const data = await blockUser({ userIdToBlock }).unwrap();
    
      dispatch(setCredentials({ userInfo: { ...data } }));
    } catch (error) {
      toast(error);
    }
    handleClose();
  };

  const handleUnBlock = async () => {
    try {
      // const userIdToUnblock = id === undefined ? userId : id;
      const userIdToUnblock = userId;
     
      const data = await unblockUser({ userIdToUnblock }).unwrap();
    
      dispatch(setCredentials({ userInfo: { ...data } }));
    } catch (error) {
      console.log(error);
    }
    handleClose();

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

  const handleClose = () => {
    setAnchorEl(null);
    setClickFetchblockedUsers(false);
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
                          option === "Block"
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
                  {followers?.length}
                </Typography>
              </Typography>
              <Typography variant="h5" className="ms-4 text-info">
                Following{" "}
                <Typography className="ms-3" color={medium}>
                  {following?.length}
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
                  minHeight: "30vh",
                  height: "40vh",
                  overscrollBehaviorY: "auto",
                }}
              >
                <Table>
                  <TableBody>
                    {blockedUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell scope="3" style={{ width: "30%" }}>
                          <UserImage image={user.profilePic} size="40" />
                        </TableCell>
                        <TableCell scope="auto" style={{ width: "40%" }}>
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell scope="4" style={{ width: "30%" }}>
                          <button
                            className="btn btn-outline-primary btn-sm font-xsm"
                            onClick={() => handleUnBlock(user._id)}
                          >
                            <small>Unblock</small>
                          </button>
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
                  <Typography color={medium}>{address}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap="1rem">
                  <WorkOutlineOutlined fontSize="large" sx={{ color: main }} />
                  <Typography color={medium}>{address}</Typography>
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
