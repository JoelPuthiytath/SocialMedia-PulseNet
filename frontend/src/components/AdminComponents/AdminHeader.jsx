import {
  Close,
  DarkMode,
  Help,
  LightMode,
  Message,
  Notifications,
} from "@mui/icons-material";
import {
  IconButton,
  InputBase,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React, { useState } from "react";
import { FormControl } from "react-bootstrap";
import FlexBetween from "../FlexBetween";
import { Box } from "@mui/system";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@emotion/react";
import { adminClearCredentials } from "../../slices/AdminAuthSlice";
import { useAdminLogoutMutation } from "../../slices/AdminApiSlice";
import { setMode } from "../../slices/AuthSlice";

const AdminHeader = () => {
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state) => state.adminAuth);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const theme = useTheme();

  console.log(theme.palette.mode);
  const neutralLight = theme.palette.neutral.light;
  const dark = theme.palette.neutral.dark;
  const background = theme.palette.background.default;
  const primaryLight = theme.palette.primary.light;
  const alt = theme.palette.background.alt;
  const [adminLogout] = useAdminLogoutMutation();
  const fullName = adminInfo.name;
  const handleLogout = async () => {
    await adminLogout();
    dispatch(adminClearCredentials());
    navigate("/admin");
  };

  return (
    <>
      <FlexBetween className="ms-5" padding="1rem 6%" backgroundColor={alt}>
        <FlexBetween gap="1.75rem">
          <Typography
            fontWeight="bold"
            fontSize="clamp(1rem, 2rem, 2.25rem)"
            color="primary"
            onClick={() => navigate("/dashboard")}
            sx={{
              "&:hover": {
                color: primaryLight,
                cursor: "pointer",
              },
            }}
          >
            PulseNet
          </Typography>
          <img src={logo} width={100} alt="logo" />
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
            <Notifications sx={{ fontSize: "25px" }} />
            <Help sx={{ fontSize: "25px" }} />
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
                  <Typography>{fullName}</Typography>
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
              <Message sx={{ fontSize: "25px" }} />
              <Notifications sx={{ fontSize: "25px" }} />
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
    </>
  );
};

export default AdminHeader;
