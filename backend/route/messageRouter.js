import express from "express";
import {
  addMessage,
  getMessages,
  deleteMessage,
} from "../controller/messageController.js";

const router = express.Router();

router.post("/", addMessage);

router.get("/:chatId", getMessages);

router.delete("/unsend", deleteMessage);

export default router;
