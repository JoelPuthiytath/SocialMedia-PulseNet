const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(8800, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5000",
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
    // remove user from active users
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log("User Disconnected", activeUsers);
    // send all active users to all users
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

  socket.emit("me", socket.id);

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

  socket.on("answerCall", (data) => {
    const user = activeUsers.find((user) => user.userId === data.to);
    if (user) {
      io.to(user.socketId).emit("callAccepted", data.signal);
    }
  });
});
