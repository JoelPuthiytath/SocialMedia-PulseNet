import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, Button } from "@mui/material";
import PosViewModal from "./PosView";
import { useGetPostMutation } from "../../slices/PostApiSlice";
import { useNavigate, useParams } from "react-router-dom";

const Post = () => {
  const [isModalOpen, setIsModalOpen] = useState(true); // Set to true initially
  const [postData, setPostData] = useState({});
  const [getPost] = useGetPostMutation();
  const { postId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const data = await getPost({ postId }).unwrap();
        setPostData(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchPostDetails();
 
  }, [postId]);

  const handleCloseModal = () => {
    setIsModalOpen(false); // Set to false when the "Close" button is clicked
    navigate(-1);
  };

  return (
    <Dialog open={isModalOpen} maxWidth="md" fullWidth>
      <DialogTitle>Post Details</DialogTitle>
      <DialogContent>
        {Object.keys(postData).length > 0 ? (
          <PosViewModal
            key={postId}
            postId={postId}
            postUserId={postData.userId}
            name={`${postData.firstName} ${postData.lastName}`}
            description={postData.description}
            location={postData.location}
            picturePath={postData.picturePath}
            userProfilePic={postData.userProfilePic}
            likes={postData.likes}
            comments={postData.comments}
          />
        ) : (
          <div>Loading post data...</div>
        )}
      </DialogContent>
      {/* Close button */}
      <Button onClick={handleCloseModal} color="primary">
        Close
      </Button>
    </Dialog>
  );
};

export default Post;
