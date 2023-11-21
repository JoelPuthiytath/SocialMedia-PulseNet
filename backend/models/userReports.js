import mongoose from "mongoose";

const { Schema } = mongoose;
const userReportSchema = new Schema({
  reportedUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reportReason: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const UserReport = mongoose.model("UserReport", userReportSchema);

export default UserReport;
