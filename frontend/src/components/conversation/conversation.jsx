import React, { useEffect, useState } from "react";
import "./consversation.css";
import FlexBetween from "../FlexBetween";
import { Avatar, Box, Divider, Typography, useTheme } from "@mui/material";
import UserImage from "../UserImage";
import { useNavigate } from "react-router-dom";
import { useGetUserByIdMutation } from "../../slices/UsersApiSlice";
import Image from "../../assets/img/pulseNet.png";
import { Height } from "@mui/icons-material";
import Loader from "../../loader/MoonLoader";
import { toast } from "react-toastify";

const Conversation = ({ data, currentUser, online }) => {
  const { palette } = useTheme();
  const primaryLight = palette.primary.light;
  const primaryDark = palette.primary.dark;
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;

  const [getUserById, { isLoading }] = useGetUserByIdMutation();

  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userId = data.members.find((id) => id !== currentUser);
    const getUserData = async () => {
      try {
        const data = await getUserById({ userId }).unwrap();
        setUserData(data);
       
      } catch (error) {
        console.log(error);
      }
    };
    getUserData();
  }, []);

  return (
    <>
      {isLoading ? (
        <>
          <div className="d-flex justify-content-center my-4">
            {" "}
            <Loader size={30} color="#36d7b7" />
          </div>
        </>
      ) : (
        <>
          <FlexBetween>
            <div className="follower conversation ms-3 my-3">
              <FlexBetween gap="1rem">
                {online && <div className="online-dot"></div>}
                <UserImage
                  image={userData?.profilePic ? userData.profilePic : Image}
                  size="40px"
                />

                <Box className="name">
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
                    {userData?.userName}
                  </Typography>
                  <Typography color={medium} fontSize="0.75rem">
                    {online ? "Online" : userData?.address}
                  </Typography>
                </Box>
              </FlexBetween>
            </div>
          </FlexBetween>
          <Divider
            style={{ borderBottom: "2px solid lightGray" }} // Increase the border thickness here
          />
        </>
      )}
    </>
  );
};

export default Conversation;
