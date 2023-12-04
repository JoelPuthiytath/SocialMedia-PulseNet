import { Box, Typography, useTheme } from "@mui/material";

import WidgetWrapper from "./WidgetWrapper";
import Friend from "./Friend";
import FlexBetween from "./FlexBetween";
import UserImage from "./UserImage";

const AdminPosViewModal = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userProfilePic,
}) => {
  const { palette } = useTheme();
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;

  console.log(name, postId, "name and post id");

  return (
    <WidgetWrapper m="2rem 0">
      {/* <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userProfilePic={userProfilePic}
        postId={postId}
      /> */}
      <FlexBetween>
        <FlexBetween gap="1rem">
          <UserImage image={userProfilePic} size="55px" />
          <Box>
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
              {name}
            </Typography>
            <Typography color={medium} fontSize="0.75rem">
              {location}
            </Typography>
          </Box>
        </FlexBetween>
      </FlexBetween>

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
    </WidgetWrapper>
  );
};

export default AdminPosViewModal;
