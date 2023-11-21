import { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Typography,
  Select,
  MenuItem,
  FormControl,
  useTheme,
  useMediaQuery,
  Divider,
  Chip,
  Avatar,
} from "@mui/material";
import { format } from "timeago.js";

import {
  Search,
  Message,
  DarkMode,
  LightMode,
  Help,
  Menu,
  Close,
} from "@mui/icons-material";
import Notifications from "react-notifications-menu";
import { useDispatch, useSelector } from "react-redux";
import {
  setMode,
  clearCredentials,
  setNotification,
  setNotificationRead,
} from "../../../slices/AuthSlice";
import { Link, useNavigate } from "react-router-dom";
import FlexBetween from "../../../components/FlexBetween";
import {
  useGetUserByIdMutation,
  useLogoutMutation,
} from "../../../slices/UsersApiSlice";
import logo from "../../../assets/img/pulseNet.png";
import "./header.css";

const Navbar = ({ socket }) => {
  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const dark = theme.palette.neutral.dark;
  const background = theme.palette.background.default;
  const primaryDark = theme.palette.neutral.black;
  const alt = theme.palette.background.alt;

  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  const { userInfo, notifications } = useSelector((state) => state.authUser);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  const [logout] = useLogoutMutation();
  const fullName = `${userInfo?.firstName} ${userInfo?.lastName}`;
  // const [data, setData] = useState([]);

  useEffect(() => {
    socket?.current?.on("getNotification", (data) => {
      console.log(data, "getNotification useEffect data");
      dispatch(setNotification({ notification: data }));
    });
  }, [socket, dispatch]);

  console.log(
    notifications,
    "this is the notification navbar===================================="
  );
  const handleNotificationClick = (notificationId) => {
    // Perform any other actions related to clicking the notification
    // ...
    console.log(
      "inside handle notification mentoddddddddddddddddddddddddddddddddddd"
    );

    // Mark the notification as read
    dispatch(setNotificationRead({ notificationId }));
  };

  const newData = notifications.map(
    ({ senderId, image, postId, time, read, type, notificationId }) => {
      let action;

      if (type === 1) {
        action = "liked";
      } else if (type === 2) {
        action = "commented on";
      } else {
        action = "shared";
      }
      console.log(read);
      const messageClass = read ? "read-notification" : "unread-notification";
      return {
        image: image,
        message: (
          <span className={messageClass}>
            {`${senderId} ${action} your post.`}
          </span>
        ),
        detailPage: `/posts/${postId}`,
        receivedTime: format(time),
      };
    }
  );

  // setData((prevData) => [...prevData, ...newData]);

  // console.log(data, "this si the data");

  const handleLogout = async () => {
    console.log("logging out");
    await logout();
    dispatch(clearCredentials());
    navigate("/username");
  };

  return (
    <>
      <FlexBetween padding="1rem 6%" backgroundColor={alt}>
        <FlexBetween gap="1.75rem" position={"relative"}>
          <img
            src={logo}
            width={100}
            alt="logo"
            style={{ position: "absolute", left: 75, top: 10 }}
          />
          <Typography
            fontWeight="bold"
            zIndex={5}
            fontSize="clamp(1rem, 2rem, 2.25rem)"
            color={primaryDark}
            onClick={() => navigate("/")}
            sx={{
              "&:hover": {
                color: primaryDark,
                cursor: "pointer",
              },
            }}
          >
            PulseNet
          </Typography>
        </FlexBetween>

        {/* DESKTOP NAV */}
        {isNonMobileScreens ? (
          <FlexBetween gap="2rem">
            <IconButton onClick={() => dispatch(setMode())}>
              {theme.palette.mode === "dark" ? (
                <DarkMode sx={{ fontSize: "25px" }} />
              ) : (
                <LightMode sx={{ color: dark, fontSize: "25px" }} />
              )}
            </IconButton>

            <Notifications
              data={newData}
              header={{
                title: "Notifications",
                option: {
                  text: "View All",
                  onClick: () => console.log("Clicked"),
                },
              }}
              markAsRead={(data) => {
                console.log(data);

                handleNotificationClick(data.notificationId);
              }}
            />
            <IconButton
              onClick={() => {
                navigate("/messenger");
              }}
            >
              <Message sx={{ color: dark, fontSize: "25px" }} />
            </IconButton>
            {/* <Help sx={{ fontSize: "25px" }} /> */}
            <FormControl variant="standard" value={fullName}>
              <Select
                value={fullName}
                sx={{
                  // backgroundColor: neutralLight,
                  width: "auto",
                  borderRadius: "5rem",
                  p: "0.25rem 1rem",
                  // "& .MuiSvgIcon-root": {
                  //   pr: "0.25rem",
                  //   width: "3rem",
                  // },
                  // "& .MuiSelect-select:focus": {
                  //   backgroundColor: neutralLight,
                  // },
                }}
                input={<InputBase />}
              >
                <MenuItem value={fullName}>
                  <Chip
                    avatar={<Avatar alt="avatar" src={userInfo.profilePic} />}
                    label={fullName}
                    variant="outlined"
                  />
                </MenuItem>
                <MenuItem onClick={handleLogout}>Log Out</MenuItem>
              </Select>
            </FormControl>
          </FlexBetween>
        ) : (
          <IconButton
            onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
          >
            <Menu />
          </IconButton>
        )}

        {/* MOBILE NAV */}
        {!isNonMobileScreens && isMobileMenuToggled && (
          <Box
            position="fixed"
            right="0"
            bottom="0"
            height="100%"
            zIndex="10"
            maxWidth="500px"
            minWidth="300px"
            backgroundColor={background}
          >
            {/* CLOSE ICON */}
            <Box display="flex" justifyContent="flex-end" p="1rem">
              <IconButton
                onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
              >
                <Close />
              </IconButton>
            </Box>

            {/* MENU ITEMS */}
            <FlexBetween
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              gap="3rem"
            >
              <IconButton
                onClick={() => dispatch(setMode())}
                sx={{ fontSize: "25px" }}
              >
                {theme.palette.mode === "dark" ? (
                  <DarkMode sx={{ fontSize: "25px" }} />
                ) : (
                  <LightMode sx={{ color: dark, fontSize: "25px" }} />
                )}
              </IconButton>
              <IconButton
                onClick={() => {
                  navigate("/messenger");
                }}
              >
                <Message sx={{ color: dark, fontSize: "25px" }} />
              </IconButton>

              <Notifications
                data={newData}
                header={{
                  title: "Notifications",
                  option: {
                    text: "View All",
                    onClick: () => console.log("Clicked"),
                  },
                }}
                markAsRead={(data) => {
                  console.log(data);
                }}
              />
              <Help sx={{ fontSize: "25px" }} />
              <FormControl variant="standard" value={fullName}>
                <Select
                  value={fullName}
                  sx={{
                    backgroundColor: neutralLight,
                    width: "150px",
                    borderRadius: "0.25rem",
                    p: "0.25rem 1rem",
                    "& .MuiSvgIcon-root": {
                      pr: "0.25rem",
                      width: "3rem",
                    },
                    "& .MuiSelect-select:focus": {
                      backgroundColor: neutralLight,
                    },
                  }}
                  input={<InputBase />}
                >
                  <MenuItem value={fullName}>
                    <Typography>{fullName}</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Log Out</MenuItem>
                </Select>
              </FormControl>
            </FlexBetween>
          </Box>
        )}
      </FlexBetween>
      <Divider sx={{ height: "0.2rem" }} />
    </>
  );
};

export default Navbar;
