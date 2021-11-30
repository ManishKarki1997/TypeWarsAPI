require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const socket = require("socket.io");
const cors = require("cors");
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/type_wars";

const AuthController = require("./controllers/AuthController");
const SocketHandler = require("./sockets/socket");

app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

app.get("/", (req, res) => {
  return res.send("Welcome to the TypeWars API");
});
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
});
const io = socket(server);
SocketHandler(io);
