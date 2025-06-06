const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

io.on("connection", (socket) => {
  let roomId;

  // When a user joins a room
  socket.on("join-room", (room) => {
    roomId = room;
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);

    // Notify all users in the room that a new user has joined
    socket.to(roomId).emit("user-connected", socket.id);

    // Handle signaling between users (offer, answer, candidates)
    socket.on("signal", (data) => {
      socket.to(roomId).emit("signal", { id: socket.id, signal: data });
    });

    // Handle disconnect call from the client
    socket.on("disconnect-call", () => {
      socket.to(roomId).emit("user-disconnected", socket.id);
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", socket.id);
    });

    // End the call for all users in the room
    socket.on("end-call", () => {
      socket.to(roomId).emit("call-ended");
    });
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
