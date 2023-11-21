import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 10 * 24 * 60 * 60 * 1000,
    });
    return token;
  } catch (error) {
    console.log("error in generateToken file");
  }
};
const generateAdminToken = (res, adminId) => {
  const token = jwt.sign({ adminId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("jwtadmin", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export { generateToken, generateAdminToken };
