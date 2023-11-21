import asyncHandler from "express-async-handler";
import MessageModel from "../models/messageModel.js";

const addMessage = asyncHandler(async (req, res) => {
  try {
    const { chatId, senderId, text } = req.body;
    console.log(req.body);

    const message = new MessageModel({
      chatId,
      senderId,
      text,
    });
    const newMessage = await message.save();
    res.status(200).json(newMessage);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
});
const getMessages = asyncHandler(async (req, res, next) => {
  try {
    const { chatId } = req.params;
    console.log(chatId, "chat id is <==");
    const chat = await MessageModel.find({ chatId });
    res.status(200).json(chat);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId, chatId } = req.body;
  try {
    const result = await MessageModel.deleteOne({ _id: messageId });
    console.log(result, "after deletion");
    if (result.deletedCount === 1) {
      const message = await MessageModel.find({ chatId });
      res.status(200).json({ success: true, message });
    } else {
      res.status(404).json({ error: "Message not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
});

export { addMessage, getMessages, deleteMessage };
