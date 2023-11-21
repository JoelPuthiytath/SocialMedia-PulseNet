import {
  Box,
  Divider,
  IconButton,
  InputBase,
  Typography,
  useTheme,
} from "@mui/material";
import Friend from "../../components/Friend";
import WidgetWrapper from "../../components/WidgetWrapper";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFriends } from "../../slices/AuthSlice";
import {
  useGetFriendsMutation,
  useSearchUserMutation,
} from "../../slices/UsersApiSlice";
import FlexBetween from "../../components/FlexBetween";
import { Search } from "@mui/icons-material";

const FriendListWidget = ({ userId }) => {
  // console.log(userId, "<friendlist UserId");
  const dispatch = useDispatch();
  const { palette } = useTheme();
  const { friends } = useSelector((state) => state.authUser.userInfo);
  // console.log(friends, "<==checking friendListWidget");
  const [getFriends] = useGetFriendsMutation();
  const neutralLight = palette.neutral.light;
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchUser] = useSearchUserMutation();

  useEffect(() => {
    (async () => {
      const data = await getFriends({ userId }).unwrap();
      dispatch(setFriends({ friends: data }));
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const performSearch = async () => {
    const res = await searchUser({ searchTerm }).unwrap();
    console.log(res, "< this is what ia m cheking");
    setSearchResults(res);
  };

  return (
    <>
      <FlexBetween
        backgroundColor={neutralLight}
        borderRadius="9px"
        gap="3rem"
        padding="0.1rem 1.5rem"
      >
        <InputBase
          placeholder="Search..."
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
        />
        <IconButton onClick={performSearch}>
          <Search />
        </IconButton>
      </FlexBetween>
      {searchResults.length > 0 && (
        <>
          <Typography
            marginTop={"2rem"}
            color={palette.neutral.dark}
            variant="h5"
            fontWeight="500"
            sx={{ mb: "1.5rem" }}
          >
            Search Result
          </Typography>
          <WidgetWrapper>
            <Box display="flex" flexDirection="column" gap="1.5rem">
              {searchResults.map((friend) => (
                <Friend
                  key={friend._id}
                  friendId={friend._id}
                  name={`${friend.firstName} ${friend.lastName}`}
                  subtitle={friend.userName}
                  userProfilePic={friend.profilePic}
                />
              ))}
            </Box>
          </WidgetWrapper>
        </>
      )}

      {friends.length > 0 && (
        <WidgetWrapper marginTop={"2rem"}>
          <Typography
            color={palette.neutral.dark}
            variant="h5"
            fontWeight="500"
            sx={{ mb: "1.5rem" }}
          >
            Friend List
          </Typography>
          <Box display="flex" flexDirection="column" gap="1.5rem">
            {friends.map((friend) => (
              <Friend
                key={friend._id}
                friendId={friend._id}
                name={`${friend.firstName} ${friend.lastName}`}
                subtitle={friend.userName}
                userProfilePic={friend.profilePic}
              />
            ))}
          </Box>
        </WidgetWrapper>
      )}
    </>
  );
};

export default FriendListWidget;
