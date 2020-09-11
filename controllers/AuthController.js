const express = require("express");
const Router = express.Router();
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const { User } = require("../models");

Router.post("/", async (req, res) => {
  try {
    const { email, username, password, avatar } = req.body;

    const existingUser = await User.findOne({
      [Op.or]: [{ email }, { username }],
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
      email,
      username,
      avatar,
      password: hashedPassword,
    });

    return res.status(200).send({
      error: false,
      message: "User created successfully",
      payload: {
        user,
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

    const token = jwt.sign({ username, id: user.id }, process.env.JWT_SECRET_KEY);

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

Router.get("/", passport.authenticate("jwt", { session: false }), async (req, res) => {
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
module.exports = Router;