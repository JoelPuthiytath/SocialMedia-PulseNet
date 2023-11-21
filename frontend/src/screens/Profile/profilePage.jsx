import { Box, Typography, useMediaQuery } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/UserComponents/navbar/header";
import FriendListWidget from "../widgets/FriendListWidget";
import MyPostWidget from "../widgets/MyPostWidget";
import PostsWidget from "../widgets/MainPostsWidget";
import UserWidget from "../widgets/UserWidgets";
import { useGetUserByIdMutation } from "../../slices/UsersApiSlice";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
// import PageIndicator from "../../components/pageIndicator";

const ProfilePage = () => {
  // const [currentPage, setCurrentPage] = useState(1);
  // const totalPages = 5;

  // const handlePageChange = (page) => {
  //   setCurrentPage(page);
  // };

  const [user, setUser] = useState(null);
  const { userId } = useParams();
  const navigate = useNavigate();
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const [getUserById] = useGetUserByIdMutation();
  const hasMounted = useRef(false);

  const { userInfo } = useSelector((state) => state.authUser);
  const getUser = async () => {
    console.log("inside the useEffect", userId);
    try {
      const data = await getUserById({ userId }).unwrap();
      console.log(data, "<==profile page");

      setUser(data);
    } catch (error) {
      toast.warning(error.data.message);
      navigate("/");
    }
  };

  useEffect(() => {
    if (!hasMounted.current) {
      getUser();
      hasMounted.current = true;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return null;

  return (
    <Box>
      <Navbar />
      <Box
        width="100%"
        padding="2rem 6%"
        display={isNonMobileScreens ? "flex" : "block"}
        gap="0.5rem"
        justifyContent="space-between"
        style={{
          maxHeight: "calc(100vh - 6rem)",
          overflowY: "auto",
        }}
      >
        <Box
          flexBasis={isNonMobileScreens ? "30%" : undefined}
          style={{
            position: isNonMobileScreens ? "sticky" : "static",
            top: isNonMobileScreens ? "0" : "auto",
          }}
        >
          <UserWidget userId={userId} picturePath={user.profilePic} />
          <Box m="2rem 0" />
          {/* <FriendListWidget userId={userId} /> */}
        </Box>
        {userInfo.blockedUsers.some((blockedUser) => blockedUser === userId) ? (
          <>
            <Box
              flexBasis={isNonMobileScreens ? "60%" : undefined}
              mt={isNonMobileScreens ? undefined : "2rem"}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Typography variant="h2">
                Unblock the user to view the page
              </Typography>
            </Box>
          </>
        ) : (
          <>
            <Box
              flexBasis={isNonMobileScreens ? "60%" : undefined}
              mt={isNonMobileScreens ? undefined : "2rem"}
            >
              <MyPostWidget profilePic={userInfo.profilePic} />
              <Box m="2rem 0" />
              <PostsWidget userId={userId} isProfile={true} />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ProfilePage;
