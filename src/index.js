const express = require("express");
const path = require("path");
const http = require("http");
const socket = require("socket.io");
const badWords = require("bad-words");
const { genarateMessage, genarateLocationMessage } = require("./utils/message");
const {
  addUsers,
  getUser,
  removeUser,
  getUserInRoom,
} = require("./utils/users");
const { addRoom, removeRoom, getAllRooms } = require("./utils/rooms");
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socket(server);
const publicDirPath = path.join(__dirname, "../public");
app.use(express.static(publicDirPath));

io.on("connection", (socket) => {
  console.log("New Websocket connected ! ");

  socket.on("join", (options, callback) => {
    const { error, user } = addUsers({ id: socket.id, ...options });
    if (error) {
      return callback(error);
    }
    addRoom(user.room);
    socket.join(user.room);
    socket.emit("message", genarateMessage("Admin", "Welcome !"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        genarateMessage("Admin", `${user.username} has joined !`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUserInRoom(user.room),
    });

    callback();
  });

  socket.on("roomsListQuery", () => {
    socket.emit("roomsList", getAllRooms());
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const Profane = new badWords();
    if (Profane.isProfane(message)) {
      return callback("Profanity is not allowed");
    }

    io.to(user.room).emit("message", genarateMessage(user.username, message));
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      genarateLocationMessage(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longtitude}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        genarateMessage("Admin", `${user.username} has left !`)
      );
      removeRoom(user.room);
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUserInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
