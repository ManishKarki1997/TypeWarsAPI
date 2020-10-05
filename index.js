const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const socket = require("socket.io");
const cors = require("cors");
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/type_wars";

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


const PORT = process.env.PORT || 4000;

mongoose.set("useFindAndModify", false);
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Mongodb Connected");
  })
  .catch((err) => console.log("error ", err));


const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})
const io = socket(server)
SocketHandler(io)

// const server = app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   const io = socket(server);
//   SocketHandler(io);
// });
