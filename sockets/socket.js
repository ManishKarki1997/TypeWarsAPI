const { v4: uuidv4 } = require("uuid");
const onlineUsers = {};
const liveRooms = {};
const countdownTimer = 3;

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
      io.to(socket.id).emit("MY_SOCKET_ID", socket.id);
    });

    socket.on("JOIN_ROOM", (roomId) => {
      socket.join(roomId);
    });

    socket.emit("LEAVE_ROOM", (roomId) => {
      socket.leave(roomId);
    });

    socket.on("SOMEONE_CHALLENGED_FOR_A_GAME", (data) => {
      io.to(data.challengedUser.socketId).emit("SOMEONE_CHALLEGED_YOU", data);
    });

    socket.on("CHALLENGE_FOR_A_REMATCH",data=>{
      io.to(data.challengedUser.socketId).emit("SOMEONE_ASKED_FOR_A_REMATCH", data);
    });

    socket.on("CHALLENGE_DECISION", (data) => {
      io.to(data.challenger.socketId).emit("CHALLENGE_DECISION", data);
    });

    socket.on("CHALLENGER_SIGNAL_TO_START_GAME", (data) => {
      const roomId = uuidv4();

      // needed to notify opponent that this user has left the room
      onlineUsers[data.challenger.email] = {
        ...data.challenger,
        roomId
      }

      onlineUsers[data.challengedUser.email] = {
        ...data.challengedUser,
        roomId
      }

      liveRooms[roomId] = {
        ...data,
        roomId,
        readyPlayers: [],
        finishedTypingPlayers:{}
      };
      io.to(data.challengedUser.socketId).emit("GAME_IS_STARTING", { ...data, roomId });
      io.to(data.challenger.socketId).emit("GAME_IS_STARTING", { ...data, roomId });
    });

    socket.on("PLAYER_READY", (roomId) => {
      if (liveRooms[roomId] === undefined) return;
      if (liveRooms[roomId].readyPlayers.indexOf(socket.id) == -1) {
        liveRooms[roomId].readyPlayers.push(socket.id);
      }
      if (liveRooms[roomId].readyPlayers.length == 2) {
        io.to(roomId).emit("GAME_START_COUNTDOWN", {
          countdownTimer,
        });
      }
      io.to(roomId).emit("GAME_START_COUNTDOWN", {
        countdownTimer,
      });
    });

    socket.on("MY_TYPING_DATA", (data)=>{
      io.to(data.intendedTo.socketId).emit("OPPONENT_TYPING_DATA",data)
    })

    socket.on("TYPING_FINISHED", (data)=>{
      liveRooms[data.roomId].finishedTypingPlayers[data.user.email] = data.user
      
      if(Object.keys(liveRooms[data.roomId].finishedTypingPlayers).length == 2){
        // need to determine the winner
        io.to(data.roomId).emit("MATCH_FINISHED",{
          winner: data.user,
          gameDetails:liveRooms[data.roomId].finishedTypingPlayers
        })
      }
    })

    socket.on("disconnect", () => {
      const user = onlineUsers[socket.email]
      
      if(user && user.roomId!==undefined){
        io.to(user.roomId).emit("OPPONENT_LEFT_THE_GAME", user);
      }

      delete onlineUsers[socket.email];
      io.emit("ONLINE_USERS", onlineUsers);
    });
  });
};

module.exports = sockets;
