import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import {
  addComment,
  getFeedPosts,
  getUserPosts,
  likePost,
  uploadPost,
  deletePost,
  reportPost,
  postById,
} from "../controller/postController.js";

const router = express.Router();

router.post("/createPost", protect, uploadPost);
router.get("/", protect, getFeedPosts);
router.get("/posts/:postId", protect, postById);
router.get("/getPosts", protect, getUserPosts);

router.patch("/like", protect, likePost);
router.put("/comment", protect, addComment);
router.put("/delete", protect, deletePost);
router.post("/reportPost", protect, reportPost);

export default router;
