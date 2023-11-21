import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "../../slices/AuthSlice";
import PostWidget from "./postWidget";
import {
  useGetFeedPostMutation,
  useGetUserPostMutation,
} from "../../slices/PostApiSlice";

const PostsWidget = ({ userId, isProfile, socket }) => {
  console.log(isProfile, "cheking is profile");
  const dispatch = useDispatch();
  const { posts } = useSelector((state) => state.authUser);
  const [getFeedPost] = useGetFeedPostMutation();
  const [getUserPost] = useGetUserPostMutation();
  console.log(userId, "this is the userid");

  const getPosts = async () => {
    const data = await getFeedPost().unwrap();

    dispatch(setPosts({ posts: data }));
  };

  const userPosts = async () => {
    const data = await getUserPost({ userId }).unwrap();
    dispatch(setPosts({ posts: data }));
  };

  useEffect(() => {
    // console.log("useEffect check in Mina");
    if (isProfile) {
      console.log("userPosts");
      userPosts();
    } else {
      console.log("feeed postss");
      getPosts();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {posts &&
        posts.map(
          ({
            _id,
            userId,
            firstName,
            lastName,
            description,
            location,
            picturePath,
            userProfilePic,
            likes,
            comments,
          }) => (
            <PostWidget
              key={_id}
              postId={_id}
              postUserId={userId}
              name={`${firstName} ${lastName}`}
              description={description}
              location={location}
              picturePath={picturePath}
              userProfilePic={userProfilePic}
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
