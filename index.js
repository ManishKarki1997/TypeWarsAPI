const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();
const passport = require("passport");
const JWTAuthenticationStrategy = require("./passport/authenticateJWT");

const AuthController = require("./controllers/AuthController");

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());
app.use(cors());

app.use("/api/auth", AuthController);

passport.use(JWTAuthenticationStrategy);

const db = require("./models/index");

const PORT = process.env.PORT || 3000;

app.use(passport.initialize());

// force : true
db.sequelize.sync({}).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
