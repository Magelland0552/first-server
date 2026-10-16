require("dotenv").config();
const mongoose = require("mongoose");

const uri = "mongodb+srv://rgmagelland_db_user:g4q7dZcByzSZznFT@cluster0.zdgtbxp.mongodb.net/";

async function testConnection() {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully!");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Connection failed:", error.message);
    process.exitCode = 1;
  }
}

testConnection();
