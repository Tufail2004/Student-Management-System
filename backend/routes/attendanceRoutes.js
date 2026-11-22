const express = require("express");
const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");

const router = express.Router();

router.get("/", async (req, res) => {
  const { date } = req.query;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return res.status(400).json({ message: "Provide a date in YYYY-MM-DD format." });
  try {
    res.json(await Attendance.find({ date }).sort({ studentName: 1 }));
  } catch (err) {
    res.status(500).json({ message: "Could not load attendance." });
  }
});

router.post("/", async (req, res) => {
  const { date, attendance } = req.body;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "") || !Array.isArray(attendance)) {
    return res.status(400).json({ message: "Provide a date and attendance list." });
  }
  if (attendance.some(row => !mongoose.isValidObjectId(row.studentId)
    || !row.studentName || !row.rollNo || !row.course
    || !["Present", "Absent"].includes(row.status))) {
    return res.status(400).json({ message: "Each student needs a valid ID and attendance status." });
  }
  try {
    const operations = attendance.map(row => ({
      updateOne: {
        filter: { date, studentId: row.studentId },
        update: { $set: { date, studentId: row.studentId, studentName: row.studentName, rollNo: row.rollNo, course: row.course, status: row.status } },
        upsert: true
      }
    }));
    if (operations.length) await Attendance.bulkWrite(operations, { ordered: true });
    res.json({ message: "Attendance saved.", saved: attendance.length });
  } catch (err) {
    if (err.name === "ValidationError" || err.name === "CastError") return res.status(400).json({ message: err.message });
    res.status(500).json({ message: "Could not save attendance." });
  }
});

module.exports = router;
