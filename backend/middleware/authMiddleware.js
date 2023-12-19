import Jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Admin from "../models/adminModel.js";

const verifyUser = asyncHandler(async (req, res, next) => {
  try {
    console.log(req.query, "<== req.query");
    console.log(req.body, "<== req.body");

    const { userName } = req.method == "GET" ? req.query : req.body;
    console.log(userName, "<== verifyuser checking");
    const exist = await User.findOne({ userName });
    console.log(exist);
    if (!exist) return res.status(404).send({ message: "Can't find User!" });
    next();
  } catch (error) {
    console.log(error);
    return res.status(404).send({ message: "Authentication Error" });
  }
});

const protect = asyncHandler(async (req, res, next) => {
  let token;
  token = req.cookies.jwt;
  try {
    if (token) {
      try {
        const decode = Jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decode.userId).select("-password");
        next();
      } catch (error) {
        res.status(401);
        throw new Error("Not authorised , invalid token");
      }
    } else {
      res.status(401);
      throw new Error("Not authorised , No token");
    }
  } catch (error) {
    console.log("error is in the protect middileware ", error);
  }
});

const localVariables = (req, res, next) => {
  req.app.locals = {
    OTP: null,
    resetSession: false,
  };
  next();
};

const adminProtect = asyncHandler(async (req, res, next) => {
  let token;
  token = req.cookies.jwtadmin;

  if (token) {
    try {
      const decode = Jwt.verify(token, process.env.JWT_SECRET);
      req.admin = await Admin.findById(decode.adminId).select("-password");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorised , invalid token");
    }
  } else {
    res.status(401);
    throw new Error("Not authorised , No token");
  }
});

export { protect, adminProtect, localVariables, verifyUser };
