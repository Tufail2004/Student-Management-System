const express = require("express");
const mongoose = require("mongoose");
const Student = require("../models/Student");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.json(await Student.find().sort({ name: 1 }));
  } catch (err) {
    res.status(500).json({ message: "Could not load students." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, rollNo, email, course } = req.body;
    const student = await Student.create({ name, rollNo, email, course });
    res.status(201).json(student);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "That roll number is already in use." });
    if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
    res.status(500).json({ message: "Could not save student." });
  }
});

router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid student ID." });
  try {
    const { name, rollNo, email, course } = req.body;
    const student = await Student.findByIdAndUpdate(req.params.id, { name, rollNo, email, course }, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ message: "Student not found." });
    res.json(student);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "That roll number is already in use." });
    if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
    res.status(500).json({ message: "Could not update student." });
  }
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid student ID." });
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found." });
    res.json({ message: "Student deleted." });
  } catch (err) {
    res.status(500).json({ message: "Could not delete student." });
  }
});

module.exports = router;
