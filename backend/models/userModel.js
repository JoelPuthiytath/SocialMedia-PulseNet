import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema(
  {
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    firstName: {
      type: String,
      min: 2,
      max: 15,
    },
    lastName: {
      type: String,
      min: 2,
      max: 15,
    },
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: Number,
    },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
    },
    following: {
      type: Array,
    },
    followers: {
      type: Array,
    },
    address: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailToken: {
      type: String,
    },
    viwedProfile: {
      type: String,
      default: 0,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    socialProfile: {
      type: String,
    },
    impression: {
      type: String,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
