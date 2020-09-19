const express = require("express");
const Router = express.Router();
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const { User } = require("../models");

const verifyToken = require("../middlewares/verifyToken");

Router.post("/", async (req, res) => {
  try {
    const { name, email, username, password, avatar } = req.body;
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(409).send({
        error: true,
        message: "User with that email or username already exists.",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      id: uuidv4(),
      name,
      email,
      username,
      avatar,
      password: hashedPassword,
    });

    // const token = await jwt.sign({ email, username }, process.env.JWT_SECRET_KEY);

    // const userToken = await AuthToken.create({
    //   token,
    //   UserId: user.id,
    // });

    return res.status(200).send({
      error: false,
      message: "Signed up successfully.",
      payload: {
        user,
        // userToken,
      },
    });
  } catch (error) {
    console.log(error);
    return res.send({
      error: true,
      message: "Something went wrong.",
    });
  }
});

Router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.send({
        error: true,
        message: "Please provide both username and password to login.",
      });
    }

    const user = await User.findOne({
      where: {
        username,
      },
    });

    if (!user) {
      return res.status(404).send({
        error: true,
        message: "User with that username does not exist",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).send({
        error: true,
        message: "The credentials do not match with our records",
      });
    }

    const token = jwt.sign({ username, email: user.email, id: user.id }, process.env.JWT_SECRET_KEY);
    console.log("new created token is ", token);
    // await AuthToken.create({
    //   token,
    //   UserId: user.id,
    // });

    return res.send({
      error: false,
      message: "Logged in successfully",
      payload: {
        user,
        token,
      },
    });
  } catch (error) {
    console.log(error);
    return res.send({
      error: true,
      message: "Something went wrong while logging in.",
    });
  }
});

Router.get("/", async (req, res) => {
  try {
    const users = await User.findAll();
    return res.status(200).send({
      error: false,
      message: "Users successfully fetched",
      payload: {
        users,
      },
    });
  } catch (error) {
    console.log(error);
    return res.send({
      error: true,
      message: "Something went wrong.",
    });
  }
});

Router.get("/getUser", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.user.email } });
    return res.send({
      error: false,
      payload: {
        user,
      },
    });
  } catch (error) {
    console.error(error);
    return res.send({
      error: true,
      message: "Something went wrong",
    });
  }
});

module.exports = Router;
