import mongoose from "mongoose";

const { Schema } = mongoose;

const postReportSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  reporterId: { type: String, ref: "User", required: true },
  reportReason: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const PostReport = mongoose.model("PostReport", postReportSchema);

export default PostReport;
