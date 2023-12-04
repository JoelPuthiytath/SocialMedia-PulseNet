import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, Button } from "@mui/material";
import PosViewModal from "./PosView";
import { useGetPostMutation } from "../../slices/PostApiSlice";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAdminGetPostMutation } from "../../slices/AdminApiSlice";
import AdminPosViewModal from "../../components/adminPostView";

const Post = () => {
  const [isModalOpen, setIsModalOpen] = useState(true); // Set to true initially
  const [postData, setPostData] = useState({});
  const location = useLocation();
  const isAdmin = location.state?.isAdmin || false;
  const [getPost] = useGetPostMutation();
  const [adminGetPost] = useAdminGetPostMutation();
  const { postId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPostDetails = async () => {
      if (postId) {
        // Ensure postId is not undefined or null
        try {
          if (isAdmin) {
            console.log("admin", isAdmin);
            const data = await adminGetPost({ postId }).unwrap();
            console.log(data);
            setPostData(data);
          } else {
            console.log("user", isAdmin);
            const data = await getPost({ postId }).unwrap();
            console.log(data);
            setPostData(data);
          }
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchPostDetails();
  }, [postId, isAdmin]);

  const handleCloseModal = () => {
    setIsModalOpen(false); // Set to false when the "Close" button is clicked
    navigate(-1);
  };

  return (
    <>
      <Dialog open={isModalOpen} maxWidth="md" fullWidth>
        <DialogTitle>Post Details</DialogTitle>
        <DialogContent>
          {Object.keys(postData).length > 0 ? (
            isAdmin ? (
              <>
                <AdminPosViewModal
                  key={postId}
                  postId={postId}
                  postUserId={postData.userId}
                  name={`${postData.userDetails.firstName} ${postData.userDetails.lastName}`}
                  description={postData.description}
                  location={postData.location}
                  picturePath={postData.picturePath}
                  userProfilePic={postData.userDetails.profilePic}
                />
              </>
            ) : (
              <>
                <PosViewModal
                  key={postId}
                  postId={postId}
                  postUserId={postData.userId}
                  name={`${postData.userDetails.firstName} ${postData.userDetails.lastName}`}
                  description={postData.description}
                  location={postData.location}
                  picturePath={postData.picturePath}
                  userProfilePic={postData.userDetails.profilePic}
                  likes={postData.likes}
                  comments={postData.comments}
                />
              </>
            )
          ) : (
            <div>Loading post data...</div>
          )}
        </DialogContent>
        {/* Close button */}
        <Button onClick={handleCloseModal} color="primary">
          Close
        </Button>
      </Dialog>
    </>
  );
};

export default Post;
