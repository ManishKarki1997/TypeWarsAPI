const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const socket = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const AuthController = require("./controllers/AuthController");
const SocketHandler = require("./sockets/socket");

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());
app.use(cors());

app.use("/api/auth", AuthController);

const db = require("./models/index");

const PORT = process.env.PORT || 4000;

// force: true
// db.sequelize.sync({}).then(() => {
//   const server = app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
//   const io = socket(server);
// });

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  const io = socket(server);
  SocketHandler(io);
});
