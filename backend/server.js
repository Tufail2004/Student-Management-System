require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const port = Number(process.env.PORT) || 5000;
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/studentDB";

app.use(cors());
app.use(express.json());

const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const resultRoutes = require("./routes/resultRoutes");
const authRoutes = require("./routes/authRoutes");
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

mongoose.connect(mongoUri)
  .then(() => {
    console.log("MongoDB connected");
    if (process.env.NODE_ENV !== "production") {
      app.listen(port, () => console.log(`Server started on port ${port}`));
    }
  })
  .catch(err => {
    console.error("MongoDB connection failed:", err.message);
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  });

module.exports = app;
