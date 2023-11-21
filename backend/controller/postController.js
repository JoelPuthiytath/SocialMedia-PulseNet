import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import PostReport from "../models/postReports.js";
import { validationResult } from "express-validator";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const destinationFolder = path.join(__dirname, "../utils/uploads");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, destinationFolder);
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const uploadPost = (req, res) => {
  upload.single("picturePath")(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: "Post Upload failed." });
    }

    try {
      const { userId, description } = req.body;
      const user = await User.findById(userId);
      const newPost = new Post({
        userId,
        firstName: user.firstName,
        lastName: user.lastName,
        location: user.address,
        description,
        userProfilePic: user.profilePic,
        picturePath: req?.file?.filename || "",
        likes: {},
        comments: [],
      });
      await newPost.save();

      const post = await Post.find().sort({ createdAt: -1 });
      res.status(201).json(post);
    } catch (err) {
      res.status(409).json({ message: err.message });
    }
  });
};

const getFeedPosts = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await User.findById(userId).populate("blockedUsers");
    const blockedUserIds = await User.find({ blocked: true }).distinct("_id");
    const allBlockedUserIds = [
      ...user.blockedUsers.map((blockedUser) => blockedUser._id),
      ...blockedUserIds,
    ];
    const posts = await Post.find({
      userId: { $nin: allBlockedUserIds },
    }).sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const getUserPosts = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.query;
    const isBlocked = await User.findById(userId).select("blocked");

    if (isBlocked && isBlocked.blocked) {
      return res.status(200).json([]);
    }
    const userPosts = await Post.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(userPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const likePost = asyncHandler(async (req, res) => {
  try {
    const { postId, userId } = req.body;
    console.log(req.body.postId);

    const post = await Post.findById(postId);
    const isLiked = post.likes.get(userId);
    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { likes: post.likes },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: err.message });
  }
});
const addComment = asyncHandler(async (req, res) => {
  const { postId, comment, profilePic } = req.body;
  try {
    const comments = {
      user: req.user._id,
      userName: req.user.userName,
      comment,
      profilePic,
    };
    const post = await Post.findById(postId);
    post.comments.push(comments);
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
});

// const deletePost = asyncHandler(async (req, res) => {
//   const { postId } = req.body;
//   try {
//     const result = await Post.deleteOne({ _id: postId });
//     const posts = await Post.find({ _id: postId });

//     if (result.deletedCount === 1) {
//       res.status(200).json(posts);
//     } else {
//       res.status(404).json({ error: "Post not found" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.body;

  try {
    // Find the post to be deleted
    const post = await Post.findOne({ _id: postId });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Delete the post
    const result = await Post.deleteOne({ _id: postId });

    if (result.deletedCount === 1) {
      // Find the remaining posts after deleting
      const remainingPosts = await Post.find().sort({ createdAt: -1 });

      res.status(200).json(remainingPosts);
    } else {
      res.status(500).json({ error: "Failed to delete the post" });
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const reportPost = asyncHandler(async (req, res) => {
  const { body } = req;
  const reporterId = req.user.userName;

  try {
    const { postId, reportReason } = body;
    console.log(body);

    const report = new PostReport({
      postId,
      reporterId,
      reportReason,
    });

    await report.save();

    res.status(200).json({ message: "Report sent successfully" });
  } catch (error) {
    console.log("Error reporting post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const postById = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  console.log(postId, "post id is this");
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export {
  uploadPost,
  getFeedPosts,
  getUserPosts,
  likePost,
  addComment,
  deletePost,
  reportPost,
  postById,
};
