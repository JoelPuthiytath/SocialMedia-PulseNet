import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "../../slices/AuthSlice";
import PostWidget from "./postWidget";
import {
  useGetFeedPostMutation,
  useGetUserPostMutation,
} from "../../slices/PostApiSlice";

const PostsWidget = ({ userId, isProfile, socket }) => {

  const dispatch = useDispatch();
  const { posts } = useSelector((state) => state.authUser);
  const [getFeedPost] = useGetFeedPostMutation();
  const [getUserPost] = useGetUserPostMutation();


  const getPosts = async () => {

    try {
      const data = await getFeedPost().unwrap();

      dispatch(setPosts({ posts: data }));
    } catch (error) {
      console.log(error);
    }
  };

  const userPosts = async () => {

    try {
      const data = await getUserPost({ userId }).unwrap();
   
      dispatch(setPosts({ posts: data }));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isProfile) {
  
      userPosts();
    } else {
  
      getPosts();
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {posts &&
        posts.map(
          ({
            _id,
            userId,
            description,
            location,
            picturePath,
            likes,
            comments,
            userDetails,
          }) => (
            <PostWidget
              key={_id}
              postId={_id}
              postUserId={userId}
              name={`${userDetails?.firstName} ${userDetails?.lastName}`}
              description={description}
              location={location}
              picturePath={picturePath}
              userProfilePic={userDetails?.profilePic}
              likes={likes}
              comments={comments}
              socket={socket}
            />
          )
        )}
    </>
  );
};

export default PostsWidget;
