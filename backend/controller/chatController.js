import asyncHandler from "express-async-handler";
import ChatModel from "../models/chatModel.js";
import User from "../models/userModel.js";

// const createChat = asyncHandler(async (req, res) => {
//   console.log(req.body);

//   const newChat = new ChatModel({
//     members: [req.body.senderId, req.body.receiverId],
//   });
//   try {
//     const result = await newChat.save();
//     res.status(200).json(result);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "internal server error" });
//   }
// });

const createChat = asyncHandler(async (req, res) => {
  console.log(req.body);

  const senderId = req.body.senderId;
  const receiverId = req.body.receiverId;
  const sender = await User.findById(senderId);
  const receiver = await User.findById(receiverId);

  if (
    sender.blockedUsers.includes(receiverId) ||
    receiver.blockedUsers.includes(senderId)
  ) {
    res
      .status(403)
      .json({ message: "You can't make a chat with blocked user" });
  }

  const existingChat = await ChatModel.findOne({
    members: { $all: [senderId, receiverId] },
  });

  if (existingChat) {
    console.log("Chat already exists");
    res.status(200).json(existingChat);
  } else {
    const newChat = new ChatModel({
      members: [senderId, receiverId],
    });

    try {
      const result = await newChat.save();
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

const userChats = asyncHandler(async (req, res) => {
  console.log(req.params);
  try {
    const chat = await ChatModel.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(chat);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
});
const findChat = asyncHandler(async (req, res) => {
  try {
    const chat = await ChatModel.findOne({
      members: { $all: [req.params.firstId, req.params.secondId] },
    });
    res.status(200).json(chat);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
});

export { createChat, userChats, findChat };
