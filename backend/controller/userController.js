import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { generateToken } from "../utils/generateToken.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import otpGenerator from "otp-generator";
import { verificationMail, recoveryMail } from "../helper/mailer.js";
import UserReport from "../models/userReports.js";
import { equal } from "assert";
import mongoose from "mongoose";
//storage

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

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { userName, email, profilePic, password } = req.body.values;

    const existingUsername = await User.findOne({ userName });
    if (existingUsername) {
      console.log("Please use a unique username");
      return res.status(400).json({ message: "Please use a unique username" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Please use a unique email" });
    }

    const user = new User({
      userName,
      email,
      password,
      profilePic,
      emailToken: crypto.randomBytes(64).toString("hex"),
    });

    await user.save();
    res.status(201).json(user);
    const msg = verificationMail(user);
    console.log(msg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error", error });
  }
});

const verifyEamil = asyncHandler(async (req, res) => {
  console.log("emailVerify");
  try {
    const { emailToken } = req.body;
    console.log(req.body);
    if (!emailToken)
      return res.status(404).json({ message: "EmailToken not found..." });
    const user = await User.findOne({ emailToken });
    if (!user)
      return res
        .status(401)
        .json({ message: "Email verification failed, Invalid token" });
    (user.emailToken = null), (user.isVerified = true);
    await user.save();
    const token = generateToken(res, user._id);
    console.log(token, "<=== this is the registration token");

    res.status(200).json({ token, user });
    // res.status(200).json({
    //   _id: user._id,
    //   userName: user.userName,
    //   email: user.email,
    //   profilePic: user.profilePic,
    //   token,
    //   isVerified: user?.isVerified,
    // });
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});

const checkUsername = asyncHandler(async (req, res) => {
  try {
    const { userName } = req.query;
    console.log(userName, "<=== checkuUsername");
    if (!userName) return res.status(501).send({ message: "Invalid Username" });
    const newUser = await User.findOne({ userName }).select("-password");
    if (!newUser)
      return res.status(501).send({ message: "Couldn't Find the User" });
    if (newUser.blocked)
      return res
        .status(403)
        .json({ message: "User Is Blocked By Administrator" });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", error });
  }
});

const getUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.query;

    console.log(id, "<=== getuserId");
    if (!id) return res.status(501).send({ message: "Invalid Id" });
    const newUser = await User.findById(id).select("-password");
    if (newUser.blocked)
      return res.status(403).json({
        message: `${newUser.firstName} ${newUser.lastName} is a restricted User.`,
      });
    if (!newUser)
      return res.status(501).send({ message: "Couldn't Find the User" });
    res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", error });
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { userName, password } = req.body;
  console.log(req.body, "<== inside authUser");
  const user = await User.findOne({ userName });
  console.log(user);
  if (user && (await user.matchPassword(password))) {
    const token = generateToken(res, user._id);
    console.log(token, "<=== this is the authUser token");
    res.status(202).json({ token, user });
  } else {
    throw new Error("Invalid username or password");
  }
});

const generateOTP = asyncHandler(async (req, res) => {
  try {
    req.app.locals.OTP = await otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    console.log(req.app.locals.OTP);
    res.status(201).json({ code: req.app.locals.OTP });
  } catch (error) {
    console.log(error);
    res.status(201).json({ message: "there is an error while generating otp" });
  }
});

const verifyOTP = asyncHandler(async (req, res) => {
  console.log(req.query);
  const { code } = req.query;
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null;
    req.app.locals.resetSession = true;
    return res
      .status(201)
      .json({ message: "verify successfully ", success: true });
  }
  return res.status(400).send({ message: "Invalid OTP" });
});

const createResetSession = asyncHandler(async (req, res) => {
  if (req.app.locals.resetSession) {
    req.app.locals.resetSession = false;
    return res.status(201).send({ message: "Access granted" });
  }
  return res.status(440).send({ message: "Session expired!" });
});

const resetPassword = asyncHandler(async (req, res) => {
  try {
    if (!req.app.locals.resetSession)
      return res.status(440).send({ message: "Session expired!" });
    console.log(req.body);
    const { userName, password } = req.body;
    try {
      const user = await User.findOne({ userName });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.password = password;
      const newUser = await user.save();
      req.app.locals.resetSession = false;
      return res
        .status(200)
        .json({ message: "Password reset successful", success: true });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  } catch (error) {
    return res.status(401).json({ message: error });
  }
});

const registerMail = asyncHandler(async (req, res) => {
  recoveryMail(req, res);
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "user logged out" });
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    city,
    state,
    pinCode,
    profilePic,
  } = req.body;
  const user = await User.findById(req.user._id);
  console.log(user.email);
  if (user) {
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address.city = city || user.address.city;
    user.address.state = state || user.address.state;
    user.address.pinCode = pinCode || user.address.pinCode;
    user.profilePic = profilePic || user.profilePic;

    const updatedUser = await user.save();

    res.status(202).json(updatedUser);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const profilePic = asyncHandler((req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    try {
      console.log(req.file.filename);
      let user = await User.findOne(req.user._id);
      user.image = req.file.filename;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        userName: updatedUser.userName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        image: updatedUser.image,
      });
    } catch (error) {
      res.status(404);
      console.log(error?.data?.message || error.error);
      throw new Error("error in image upload");
    }
  });
});

const getUserFriends = asyncHandler(async (req, res) => {
  try {
    console.log(req.query, "cheking......");
    const { userId } = req.query;
    const user = await User.findById(userId);

    const followers = await Promise.all(
      user.followers.map((id) => User.findById(id))
    );
    const formattedFollowers = followers.map(
      ({ _id, firstName, lastName, userName, address, profilePic }) => {
        return { _id, firstName, lastName, userName, address, profilePic };
      }
    );
    const following = await Promise.all(
      user.following.map((id) => User.findById(id))
    );
    const formattedFollowing = following.map(
      ({ _id, firstName, lastName, userName, address, profilePic }) => {
        return { _id, firstName, lastName, userName, address, profilePic };
      }
    );
    res
      .status(200)
      .json({ followers: formattedFollowers, following: formattedFollowing });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: err.message });
  }
});
const addFriend = asyncHandler(async (req, res) => {
  try {
    const frId = req.query.friendId;
    const friendId = new mongoose.Types.ObjectId(frId);
    const id = req.user._id;

    if (id === friendId) {
      return res
        .status(422)
        .json({ message: "You cannot add yourself as a friend." });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.blockedUsers.includes(friendId)) {
      return res
        .status(403)
        .json({ message: "You cannot add a blocked user as a friend." });
    }
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: "Friend not found." });
    }
    if (!user.following.includes(friendId)) {
      user.following.push(friendId);
      await user.save();
    }
    if (!friend.followers.includes(id)) {
      friend.followers.push(id);
      await friend.save();
    }

    const following = await User.find({ _id: { $in: user.following } });
    const formattedFollowing = following.map(
      ({ _id, firstName, lastName, userName, address, profilePic }) => {
        return { _id, firstName, lastName, userName, address, profilePic };
      }
    );
    const followers = await User.find({ _id: { $in: user.followers } });
    const formattedFollowers = followers.map(
      ({ _id, firstName, lastName, userName, address, profilePic }) => {
        return { _id, firstName, lastName, userName, address, profilePic };
      }
    );
    res
      .status(200)
      .json({ followers: formattedFollowers, following: formattedFollowing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

const removeFriend = asyncHandler(async (req, res) => {
  try {
    console.log(req.query, "<= remove controller");
    const frId = req.query.friendId;
    const friendId = new mongoose.Types.ObjectId(frId);
    const id = req.user._id;
    console.log(friendId);
    console.log(id);

    const user = await User.findById(id);

    if (user.following.includes(friendId)) {
      user.following = user.following.filter(
        (friend) => friend.toString() !== friendId.toString()
      );

      const friend = await User.findById(friendId);
      if (friend) {
        friend.followers = friend.followers.filter(
          (followerId) => followerId.toString() !== id.toString()
        );
        console.log(friend.followers, "followers");

        await Promise.all([user.save(), friend.save()]);
        console.log("checking");
      } else {
        console.log("friend model not working");
      }

      const following = await Promise.all(
        user.following.map((id) => User.findById(id))
      );
      const formattedFollowing = following.map(
        ({ _id, firstName, lastName, userName, address, profilePic }) => {
          return { _id, firstName, lastName, userName, address, profilePic };
        }
      );
      const followers = await Promise.all(
        user.followers.map((id) => User.findById(id))
      );
      const formattedFollowers = followers.map(
        ({ _id, firstName, lastName, userName, address, profilePic }) => {
          return { _id, firstName, lastName, userName, address, profilePic };
        }
      );
      res
        .status(200)
        .json({ followers: formattedFollowers, following: formattedFollowing });
    } else {
      res.status(400).json({ message: "Friend not found in your list." });
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: err.message });
  }
});

const searchUser = asyncHandler(async (req, res) => {
  console.log(req.query);
  try {
    const { user } = req.query;
    const userExit = await User.find({
      $or: [
        { firstName: { $regex: new RegExp(user, "i") } },
        { lastName: { $regex: new RegExp(user, "i") } },
      ],
    }).select("-password");
    console.log(userExit);
    if (!userExit) return res.status(401).json({ message: "Not Found" });
    return res.status(200).json(userExit);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
});

const reportUser = asyncHandler(async (req, res) => {
  const { body } = req;
  const reporterId = req.user._id;
  try {
    const { reportedUserId, reportReason } = body;
    console.log(body);

    const report = new UserReport({
      reportedUserId,
      reporterId,
      reportReason,
    });

    await report.save();

    res.status(200).json({ message: "Report sent successfully" });
  } catch (error) {
    console.log("Error reporting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const utb = req.body.userIdToBlock;
  const userIdToBlock = new mongoose.Types.ObjectId(utb);
  console.log(userIdToBlock, "userIdToBlock");

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(userIdToBlock);

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.blockedUsers.includes(userIdToBlock)) {
      user.blockedUsers.push(userIdToBlock);

      if (user.following.includes(userIdToBlock)) {
        user.following = user.following.filter(
          (friendId) => friendId.toString() !== userIdToBlock.toString()
        );

        // Corrected the variable name here
        user.followers = user.followers.filter(
          (followerId) => followerId.toString() !== userIdToBlock.toString()
        );

        friend.followers = friend.followers.filter(
          (followerId) => followerId.toString() !== userId.toString()
        );

        friend.following = friend.following.filter(
          (followingId) => followingId.toString() !== userId.toString()
        );

        await friend.save(); // Save changes to the friend object
      }

      const result = await user.save();
      console.log(result, "result");
      res.status(200).json(result);
    } else {
      res.status(400).json({ error: "User is already blocked" });
    }
  } catch (error) {
    console.log("Error blocking user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const utub = req.body.userIdToUnblock;
  const userIdToUnblock = new mongoose.Types.ObjectId(utub);
  console.log(userIdToUnblock, "checking the id");
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.blockedUsers = user.blockedUsers.filter(
      (id) => !id.equals(userIdToUnblock.toString())
    );
    const result = await user.save();
    res.status(200).json(result);
  } catch (error) {
    console.log("Error unblocking User:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const addSocialProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { profileLink } = req.body;
  console.log(profileLink, "this is the profileLink");
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.socialProfile = profileLink;

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

const fetchBlockedUsers = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const blockedUsersDetails = await User.aggregate([
      {
        $match: {
          _id: { $in: user.blockedUsers },
        },
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          profilePic: 1,
        },
      },
    ]);

    res.status(200).json(blockedUsersDetails);
  } catch (error) {
    console.error("Error fetching blocked users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export {
  authUser,
  searchUser,
  generateOTP,
  registerMail,
  verifyOTP,
  verifyEamil,
  createResetSession,
  resetPassword,
  registerUser,
  checkUsername,
  logoutUser,
  updateUserProfile,
  getUser,
  profilePic,
  getUserFriends,
  addFriend,
  removeFriend,
  reportUser,
  blockUser,
  unblockUser,
  addSocialProfile,
  fetchBlockedUsers,
};
