import {
  Alert,
  Box,
  Button,
  ButtonGroup,
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
import FollowersEmptyImg from "../../assets/img/kindpng_2281374.png";
// import { Button, ButtonGroup } from "react-bootstrap";
// import ButtonGroup from "@mui/material/ButtonGroup";
// import Button from "@mui/material/Button";

const FriendListWidget = ({ userId }) => {
  // console.log(userId, "<friendlist UserId");
  const dispatch = useDispatch();
  const { palette } = useTheme();
  const { followers, following } = useSelector(
    (state) => state.authUser.userInfo
  );
  // console.log(friends, "<==checking friendListWidget");
  const [getFriends] = useGetFriendsMutation();
  const neutralLight = palette.neutral.light;
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [clickFollowers, setClickFollowers] = useState(true);
  const [clickFollowing, setClickFollowings] = useState(false);
  const [clickSearch, setClickSearch] = useState(false);
  const [searchUser] = useSearchUserMutation();

  useEffect(() => {
    (async () => {
      const data = await getFriends({ userId }).unwrap();

      dispatch(
        setFriends({ followers: data.followers, following: data.following })
      );
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const performSearch = async () => {
    try {
      const res = await searchUser({ searchTerm }).unwrap();
      setSearchResults(res);
      setClickSearch(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleClickFollower = () => {
    setClickFollowers(!clickFollowers);
    setClickFollowings(false);
  };

  const handleClickFollowing = () => {
    setClickFollowings(!clickFollowing);
    setClickFollowers(false);
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
      {clickSearch && (
        <>
          {searchResults.length > 0 ? (
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
                      friendList={true}
                    />
                  ))}
                </Box>
              </WidgetWrapper>
            </>
          ) : (
            <>
              <Alert
                className="my-3"
                color="info"
                variant="outlined"
                action={
                  <IconButton
                    color="inherit"
                    size="small"
                    onClick={() => setClickSearch(false)} // Close button action
                  >
                    {/* <CloseIcon fontSize="inherit" /> */}x
                  </IconButton>
                }
              >
                {`There isn't any user named ${searchTerm}`}
              </Alert>
            </>
          )}
        </>
      )}
      <FlexBetween marginTop={3}>
        <ButtonGroup
          disableElevation
          variant="contained"
          aria-label="Disabled elevation buttons"
          color="inherit"
        >
          <Button onClick={handleClickFollower}>Followers</Button>
          <Button onClick={handleClickFollowing}>Following</Button>
        </ButtonGroup>
      </FlexBetween>

      {clickFollowers && followers?.length > 0 ? (
        <WidgetWrapper marginTop={"2rem"}>
          <Typography
            color={palette.neutral.dark}
            variant="h5"
            fontWeight="500"
            sx={{ mb: "1.5rem" }}
          >
            Followers{" "}
            <span className="float-right text-primary">{followers.length}</span>
          </Typography>
          <Box display="flex" flexDirection="column" gap="1.5rem">
            {followers.map((friend) => (
              <Friend
                key={friend._id}
                friendId={friend._id}
                name={`${friend.firstName} ${friend.lastName}`}
                subtitle={friend.userName}
                userProfilePic={friend.profilePic}
                friendList={true}
              />
            ))}
          </Box>
        </WidgetWrapper>
      ) : (
        clickFollowers && (
          <>
            <img className="mt-2" src={FollowersEmptyImg} width={150} />
            <span className="mt-2 ms-3">No followers yet!</span>
          </>
        )
      )}

      {clickFollowing && following?.length > 0 && (
        <WidgetWrapper marginTop={"2rem"}>
          <Typography
            color={palette.neutral.dark}
            variant="h5"
            fontWeight="500"
            sx={{ mb: "1.5rem" }}
          >
            Following{" "}
            <span className="float-right text-primary">{following.length}</span>
          </Typography>
          <Box display="flex" flexDirection="column" gap="1.5rem">
            {following.map((friend) => (
              <Friend
                key={friend._id}
                friendId={friend._id}
                name={`${friend.firstName} ${friend.lastName}`}
                subtitle={friend.userName}
                userProfilePic={friend.profilePic}
                friendList={true}
              />
            ))}
          </Box>
        </WidgetWrapper>
      )}
    </>
  );
};

export default FriendListWidget;
