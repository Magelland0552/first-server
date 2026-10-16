
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("node:path");

const app = express();
const url = "mongodb+srv://rgmagelland_db_user:g4q7dZcByzSZznFT@cluster0.zdgtbxp.mongodb.net/";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

// CREATE ACCOUNT
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        message: "Enter a valid email and a password of 8–72 bytes.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, 12);

    await User.create({
      email: normalizedEmail,
      passwordHash,
    });

    console.log("Account created successfully!");

    res.status(201).json({
      message: "Account created successfully!",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    console.error(error);
    res.status(500).json({ message: "Registration failed." });
  }
});

// SIGN IN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (
      !user ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      return res.status(401).json({
        message: "Incorrect email or password.",
      });
    }

    console.log("Login successful!");

    res.json({ message: "Login successful!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed." });
  }
});

// START SERVER
async function start() {
  await mongoose.connect(url);

  console.log("MongoDB connected successfully!");

  app.listen(process.env.PORT || 3000, () => {
    console.log("Server running at http://localhost:3000");
  });
}

start().catch((error) => {
  console.error("MongoDB connection failed:", error.message);
  process.exitCode = 1;
});
