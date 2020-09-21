const { v4: uuidv4 } = require("uuid");
const onlineUsers = {};
const liveRooms = {};
const countdownTimer = 5;

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
      io.to(socket.id).emit("MY_SOCKET_ID", socket.id)
    });

    socket.on("JOIN_ROOM", (roomId)=>{
      socket.join(roomId);
    })

    socket.emit("LEAVE_ROOM", roomId=>{
      socket.leave(roomId)
    })

    socket.on("SOMEONE_CHALLENGED_FOR_A_GAME", (data) => {
      io.to(data.challengedUser.socketId).emit("SOMEONE_CHALLEGED_YOU", data);
    });

    socket.on("CHALLENGE_DECISION", data=>{
      io.to(data.challenger.socketId).emit("CHALLENGE_DECISION", data)
    })

    socket.on("CHALLENGER_SIGNAL_TO_START_GAME", data=>{
      const roomId = uuidv4();
      liveRooms[roomId] = {
        ...data,
        roomId,
        readyPlayers:[],
        // challenger:{
        //   ...data,
        //   isReady:false,
        // },
        // challengedUser:{
        //   ...data,
        //   isReady:false
        // }
      }
      io.to(data.challengedUser.socketId).emit("GAME_IS_STARTING", {...data, roomId})
      io.to(data.challenger.socketId).emit("GAME_IS_STARTING", {...data, roomId})
    })

    socket.on("PLAYER_READY", roomId=>{
      if(liveRooms[roomId] === undefined) return;
      if(liveRooms[roomId].readyPlayers.indexOf(socket.id) == -1){
        liveRooms[roomId].readyPlayers.push(socket.id)
      }
        if(liveRooms[roomId].readyPlayers.length == 2){
        io.to(roomId).emit("GAME_START_COUNTDOWN", {
          countdownTimer
        })
      }
    })
    
    

    socket.on("disconnect", () => {
      delete onlineUsers[socket.email];
      io.emit("ONLINE_USERS", onlineUsers);
    });
  });
};

module.exports = sockets;
