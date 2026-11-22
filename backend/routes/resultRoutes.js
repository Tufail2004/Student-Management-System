const express = require("express");
const mongoose = require("mongoose");
const Result = require("../models/Result");
const Student = require("../models/Student");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.json(await Result.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: "Could not load results." });
  }
});

router.post("/", async (req, res) => {
  const { studentId, subject, marks, totalMarks } = req.body;
  if (!mongoose.isValidObjectId(studentId)) return res.status(400).json({ message: "Choose a valid student." });
  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found." });
    const result = await Result.create({
      studentId: student._id,
      studentName: student.name,
      rollNo: student.rollNo,
      course: student.course,
      subject,
      marks,
      totalMarks
    });
    res.status(201).json(result);
  } catch (err) {
    if (err.name === "ValidationError" || err.name === "CastError") return res.status(400).json({ message: err.message });
    res.status(500).json({ message: "Could not save result." });
  }
});

module.exports = router;
