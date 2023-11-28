import express from "express";
import dotenv from "dotenv";
import userRouter from "./route/userRouter.js";
import postRouter from "./route/postRouter.js";
import chatRouter from "./route/chatRouter.js";
import adminRouter from "./route/adminRouter.js";
import messageRouter from "./route/messageRouter.js";
import cookieParser from "cookie-parser";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import morgan from "morgan";
import { getDirname } from "./utils/util.js";

dotenv.config();

const port = process.env.PORT || 5000;
connectDB();
const app = express();
const __dirname = getDirname(import.meta.url);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("tiny"));
app.use("/image", express.static(path.join(__dirname, "./utils/uploads")));
app.use("/api/users", userRouter);
app.use("/api/post", postRouter);
app.use("/api/admin", adminRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
  );
} else {
  console.log("haii");
  console.log(__dirname);
  app.get("/", (req, res) => res.send("server is running"));
}
app.use(notFound);
app.use(errorHandler);
app.listen(port, () => console.log("connected to the port" + port));
