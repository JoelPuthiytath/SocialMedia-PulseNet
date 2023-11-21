import {
  ManageAccountsOutlined,
  EditOutlined,
  Message,
  LocationOnOutlined,
  WorkOutlineOutlined,
} from "@mui/icons-material";

import { Box, Typography, Divider, useTheme, IconButton } from "@mui/material";
import UserImage from "../../components/UserImage";
import FlexBetween from "../../components/FlexBetween";
import WidgetWrapper from "../../components/WidgetWrapper";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAddSocialProfileMutation,
  useBlockUserMutation,
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
import twitterIcon from "../../assets/img/twitter.png";
import { useCreateChatMutation } from "../../slices/chatApiSlice";
import { clearCredentials, setCredentials } from "../../slices/AuthSlice";
import { useRef } from "react";

const ITEM_HEIGHT = 38;

const UserWidget = ({ userId, picturePath }) => {
  const { userInfo } = useSelector((state) => state.authUser);
  console.log(userInfo, "userInfo");
  console.log(userId, "userId");

  const isBlocked = userInfo.blockedUsers.some(
    (blockedUser) => blockedUser === userId
  );
  console.log(isBlocked);
  const string = isBlocked ? "Unblock" : "Block";

  const options = [string, "Report", "Cancel"];

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // State for the reporting dialog
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const [isEditingTwitter, setIsEditingTwitter] = useState(false);
  const [twitterProfileLink, setTwitterProfileLink] = useState("");
  const [isEditingLinkedin, setIsEditingLinkedin] = useState(false);
  const [profileLink, setProfileLink] = useState("");

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

    console.log(data, "<user In widgets");
    setUser(data);
  };

  useEffect(() => {
    if (!hasMounted.current) {
      getUserInfo();
      console.log("haii");
      hasMounted.current = true;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) {
    return null;
  }

  const { firstName, lastName, address, viewedProfile, impressions, friends } =
    user;

  const handleBlockUser = async () => {
    try {
      console.log("user blocked");
      const data = await blockUser({ userIdToBlock: userId }).unwrap();
      console.log(data, "cheking");
      dispatch(setCredentials({ userInfo: { ...data } }));
      toast("user successfully blocked");
    } catch (error) {
      toast(error);
    }
    handleClose();
  };

  const handleUnBlock = async () => {
    try {
      console.log("user blocked");
      const data = await unblockUser({ userIdToUnblock: userId }).unwrap();
      console.log(data, "cheking");
      dispatch(setCredentials({ userInfo: { ...data } }));
      toast("user unblocked");
    } catch (error) {
      toast(error);
    }
    handleClose();
  };

  async function openChat(e) {
    e.preventDefault();
    const senderId = userInfo._id;
    const receiverId = userId;
    console.log(senderId, "senderId");
    console.log(receiverId, "receiverId");
    await createChat({ senderId, receiverId }).unwrap();
    navigate("/messenger");
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
  };

  const handleReportUser = async () => {
    try {
      console.log("Report reason:", reportReason);

      const data = await reportUser({
        reportedUserId: userId,
        reportReason,
      }).unwrap();
      console.log(data, "reportData");
      toast(data.message);
    } catch (error) {
      toast(error);
    }
    setReportDialogOpen(false);
  };

  const handleLinkedinEditClick = () => {
    setIsEditingLinkedin(!isEditingLinkedin);
  };

  const handleSaveLinkedinLink = async () => {
    console.log("inside save social profile.");
    const user = await addSocialProfile({ profileLink }).unwrap();
    console.log(user, "after fetching");
    dispatch(setCredentials({ userInfo: { ...user } }));
    setIsEditingLinkedin(false);
  };

  const handleLinkedinLinkClick = () => {
    // navigate(profileLink);
    window.open(userInfo.socialProfile);
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
          <FlexBetween
            gap="0.5rem"
            pb="1.1rem"
            onClick={() => navigate(`/profile/${userId}`)}
          >
            <FlexBetween gap="1rem">
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
                <Typography color={medium}>
                  {friends?.length} friends
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
                <ManageAccountsOutlined />
              </>
            )}
          </FlexBetween>

          <Divider />

          {/* SECOND ROW */}
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

          {/* THIRD ROW */}
          {/* <Box p="1rem 0">
        <FlexBetween mb="0.5rem">
          <Typography color={medium}>Who's viewed your profile</Typography>
          <Typography color={main} fontWeight="500">
            {viewedProfile}
          </Typography>
        </FlexBetween>
        <FlexBetween>
          <Typography color={medium}>Impressions of your post</Typography>
          <Typography color={main} fontWeight="500">
            {impressions}
          </Typography>
        </FlexBetween>
      </Box> */}

          <Divider />

          {/* FOURTH ROW */}
          <Box p="1rem 0">
            <Typography fontSize="1rem" color={main} fontWeight="500" mb="1rem">
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
              <Box mb="1rem">
                <TextField
                  id="profileLink"
                  label="Linkedin Profile Link"
                  value={profileLink}
                  onChange={(event) => setProfileLink(event.target.value)}
                />
                <Button
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
    </WidgetWrapper>
  );
};

export default UserWidget;
