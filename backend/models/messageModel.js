import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
    },
    senderId: {
      type: String,
    },
    text: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
// MessageSchema.index({ chatId: 1, senderId: 1 });

const MessageModel = mongoose.model("Message", MessageSchema);
export default MessageModel;
