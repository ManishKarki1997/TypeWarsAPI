const onlineUsers = {};

const sockets = (io) => {
  io.on("connection", (socket) => {
    socket.on("USER_JOIN", (data) => {
      socket.email = data.email;
      if (!onlineUsers[data.email]) {
        onlineUsers[data.email] = {
          ...data,
          socketId: socket.id,
        };
      }
      io.emit("ONLINE_USERS", onlineUsers);
    });

    socket.on("SOMEONE_CHALLENGED_FOR_A_GAME", (data) => {
      io.to(data.challengedUser.socketId).emit("SOMEONE_CHALLEGED_YOU", data);
    });

    socket.on("disconnect", () => {
      delete onlineUsers[socket.email];
      io.emit("ONLINE_USERS", onlineUsers);
    });
  });
};

module.exports = sockets;
