import express from "express";
import {
  protect,
  localVariables,
  verifyUser,
} from "../middleware/authMiddleware.js";
import {
  authUser,
  registerUser,
  logoutUser,
  checkUsername,
  registerMail,
  updateUserProfile,
  profilePic,
  generateOTP,
  verifyOTP,
  verifyEamil,
  searchUser,
  createResetSession,
  resetPassword,
  getUserFriends,
  getUser,
  addFriend,
  removeFriend,
  reportUser,
  blockUser,
  unblockUser,
  addSocialProfile,
} from "../controller/userController.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-email", verifyEamil);
router.post("/registerMail", registerMail);
router.post("/auth", verifyUser, authUser);

router.post("/logout", logoutUser);

router.get("/user", checkUsername);
router.get("/getUser", protect, getUser);

router.get("/generateOTP", verifyUser, localVariables, generateOTP);

router.get("/verifyOTP", verifyUser, verifyOTP);

router.get("/createResetSession", createResetSession);
router.put("/resetPassword", verifyUser, resetPassword);

router.route("/login-profile").put(protect, updateUserProfile);

router.put("/image", protect, profilePic);

router.get("/friends", protect, getUserFriends);
router.patch("/addFriends", protect, addFriend);
router.patch("/removeFriends", protect, removeFriend);

router.get("/search-user", protect, searchUser);
router.post("/reportUser", protect, reportUser);
router.put("/blockUser", protect, blockUser);
router.put("/unblockUser", protect, unblockUser);
router.put("/socialProfile", protect, addSocialProfile);

export default router;
