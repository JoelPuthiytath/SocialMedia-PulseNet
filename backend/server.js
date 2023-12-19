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
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

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
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       connectSrc: ["'self'", "http://localhost:8800"],
//     },
//   })
// );

app.use(morgan("tiny"));
const absolutePath = path.resolve(__dirname, "utils/uploads");
app.use("/image", express.static(absolutePath));

app.use("/api/users", userRouter);
app.use("/api/post", postRouter);
app.use("/api/admin", adminRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

// Socket.IO logic goes here

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
} else {
  console.log("haii");
  console.log(__dirname);
  app.get("/", (req, res) => res.send("server is running"));
}

app.use(notFound);
app.use(errorHandler);

const server = app.listen(port, () =>
  console.log("connected to the port" + port)
);

const io = new Server(server, {
  cors: {
    origin: process.env.HOSTED_URL,
    // origin: "http://localhost:5000",

    methods: ["GET", "POST"],
  },
});

let activeUsers = [];

io.on("connection", (socket) => {
  // add new User
  socket.on("new-user-add", (newUserId) => {
    // if user is not added previously
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
      console.log("New User Connected", activeUsers);
    }
    // send all active users to new user
    io.emit("get-users", activeUsers);
  });

  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log("User Disconnected", activeUsers);

    io.emit("get-users", activeUsers);
  });

  socket.on("send-message", (data) => {
    const { receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);
    console.log("Sending from socket to :", receiverId);
    console.log("Data: ", data);
    if (user) {
      try {
        io.to(user.socketId).emit("receive-message", data);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  });

  socket.on("typing", (data) => {
    const { senderId, receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);
    if (user) {
      io.to(user.socketId).emit("typing", { senderId });
    }
  });

  socket.on("stop-typing", (data) => {
    const { senderId, receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);
    if (user) {
      io.to(user.socketId).emit("stop-typing", { senderId });
    }
  });

  socket.on(
    "sendNotification",
    ({ senderId, image, receiverId, postId, time, type }) => {
      const user = activeUsers.find((user) => user.userId === receiverId);
      console.log("sendNotification is working");
      const notificationId = uuidv4();
      io.to(user.socketId).emit("getNotification", {
        notificationId,
        senderId,
        image,
        postId,
        time,
        type,
      });
    }
  );

  socket.on("getSocketId", (data) => {
    console.log(data.currentUser, "current user");
    const userId = data.currentUser;
    const user = activeUsers.find((user) => user.userId === userId);

    if (user) {
      io.to(socket.id).emit("me", user.socketId);
    } else {
      console.log("User not found");
    }
  });

  socket.on("callUser", (data) => {
    console.log("Received callUser event:", data);

    const userToCall = activeUsers.find(
      (user) => user.userId === data.userToCall
    );

    console.log("User to call:", userToCall);

    if (userToCall) {
      io.to(userToCall.socketId).emit("callUser", {
        signal: data.signalData,
        from: data.from,
        name: data.name,
      });
    }
  });

  socket.on("ice-candidate", ({ target, candidate }) => {
    const user = activeUsers.find(
      (user) => user.userId === target || user.socketId === target
    );

    console.log(user, "ice-candidate event received", target, candidate);

    if (user) {
      io.to(user.socketId).emit("ice-candidate", {
        candidate: candidate,
        sender: socket.id,
      });
    }
  });

  socket.on("answerCall", (data) => {
    console.log(data.to, "answerCall data to");

    io.to(data.to).emit("callAccepted", data.signal);
  });
  socket.on("callEnded", (data) => {
    console.log(data, "inside callEnd");
    const { userId } = data;
    const user = activeUsers.find((user) => user.userId === userId);

    if (user) {
      io.to(user.socketId).emit("callEnded");
    } else {
      console.log("User not found");
    }
  });
});
