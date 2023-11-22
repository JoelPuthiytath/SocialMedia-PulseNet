import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import { generateAdminToken } from "../utils/generateToken.js";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import Admin from "../models/adminModel.js";
import { error } from "console";
import PostReport from "../models/postReports.js";

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  try {
    const admin = await Admin.findOne({ email });
    if (admin && admin.password === password) {
      generateAdminToken(res, admin._id);
      res.status(202).json({
        id: admin._id,
        name: admin.name,
        email: admin.email,
        password: admin.password,
      });
      console.log(admin.email);
    } else {
      throw new Error("Invalid Username or Password");
    }
  } catch (err) {
    console.log(err);
    res.status(401);
    throw new Error(err?.data?.message || err.error);
  }
});

const logoutAdmin = asyncHandler(async (req, res) => {
  res.cookie("jwtAdmin", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out" });
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json(users);
  } catch (err) {
    res.status(401);
    throw new Error(err?.data?.message || err.error);
  }
});

const createUser = asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, userName, address, email, phone, password } =
      req.body;
    const userExists = await User.findOne({
      $or: [{ email }, { userName }],
    });
    console.log(userName, email, phone);
    if (userExists) {
      res.status(409).json({ message: "User already exists" });
    } else {
      const newUser = await User.create({
        firstName,
        lastName,
        userName,
        address,
        email,
        phone,
        password,
      });

      res.status(200).json({
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        userName: newUser.userName,
        address: newUser.address,
        email: newUser.email,
        phone: newUser.phone,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error?.data?.message || error.message });
  }
});

const deleteUsers = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.query.id);
    if (!user) {
      throw new Error("there isn't any user on this id");
    } else {
      await User.deleteOne({ _id: req.query.id });
      await Post.deleteOne({ userId: req.query.id });
      res.status(200).json({ id: req.query.id });
    }
  } catch (error) {
    res.status(500).json({ message: error?.data?.message || error.message });
  }
});

const getUser = async (req, res) => {
  const userId = req.query.id;
  console.log(req.params);
  console.log(req.query);
  console.log(userId);
  try {
    const user = await User.findById(userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error?.data?.message || error.message });
  }
};

const editUser = asyncHandler(async (req, res) => {
  const { id, firstName, lastName, userName, address, email, phone } = req.body;
  console.log(id);
  try {
    let user = await User.findById(id);
    if (user) {
      if (user.email != email) {
        let userExist = await User.findOne({ email: email });
        if (userExist) {
          res.status(409);
          throw new Error("this email id is already exists");
        }
      }
      if (user.userName != userName) {
        let usernameExist = await User.findOne({ userName: userName });
        if (usernameExist) {
          res.status(409);
          throw new Error("this username id is already exists");
        }
      }
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.userName = userName || user.userName;
      user.address = address || user.address;
      user.email = email || user.email;
      user.phone = phone || user.phone;
      const updatedUser = await user.save();
      res.status(200).json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        userName: updatedUser.userName,
        address: updatedUser.address,
        email: updatedUser.email,
        phone: updatedUser.phone,
      });
    } else {
      res.status(404);
      throw new Error("user not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error?.data?.message || error.message });
  }
});

const getPostReports = asyncHandler(async (req, res) => {
  try {
    const { page = 1, pageSize = 10, reporterId, postId } = req.query;
    console.log(req.query);

    // Define a query object based on filters
    const query = {};
    if (reporterId) {
      query.reporterId = reporterId;
    }
    if (postId) {
      query.postId = postId;
    }
    console.log(query, "qureys");

    // Fetch paginated and filtered reports
    const reports = await PostReport.find(query)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));
    console.log(reports, "reports");

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

const blockAndUnblockUser = asyncHandler(async (req, res) => {
  const { userId } = req.query;
  console.log(userId, "userid");

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.blocked = !user.blocked;

    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
const blockAndUnblockPost = asyncHandler(async (req, res) => {
  const { postId } = req.query;
  console.log(postId, "userid");

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    post.blocked = !post.blocked;

    await post.save();
    res.status(200).json({ success: true, post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
export {
  adminLogin,
  logoutAdmin,
  blockAndUnblockUser,
  blockAndUnblockPost,
  getAllUsers,
  createUser,
  deleteUsers,
  getUser,
  editUser,
  getPostReports,
};
