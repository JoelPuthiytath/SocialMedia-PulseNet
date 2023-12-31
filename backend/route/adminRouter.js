import express from "express";
import { adminProtect } from "../middleware/authMiddleware.js";
import {
  adminLogin,
  getAllUsers,
  createUser,
  editUser,
  deleteUsers,
  logoutAdmin,
  getUser,
  getPostReports,
  blockAndUnblockUser,
  blockAndUnblockPost,
  deletePost,
} from "../controller/adminController.js";
import { postById } from "../controller/postController.js";
const router = express.Router();

router.post("/login", adminLogin);
router.post("/logout", logoutAdmin);

router
  .route("/users")
  .get(adminProtect, getAllUsers)
  .post(adminProtect, createUser)
  .delete(adminProtect, deleteUsers);

router.route("/edit").get(adminProtect, getUser).put(adminProtect, editUser);
router.get("/postReports", adminProtect, getPostReports);
router.get("/patchBlock", adminProtect, blockAndUnblockUser);
router.get("/postBlock", adminProtect, blockAndUnblockPost);
router.get("/posts/:postId", adminProtect, postById);
router.delete("/postDelete", adminProtect, deletePost);

export default router;
