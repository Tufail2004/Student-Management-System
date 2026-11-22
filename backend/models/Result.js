const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  studentName: { type: String, required: true, trim: true },
  rollNo: { type: String, required: true, trim: true },
  course: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  marks: { type: Number, required: true, min: 0 },
  totalMarks: { type: Number, required: true, min: 1 }
}, { timestamps: true });

resultSchema.path("marks").validate(function (marks) {
  return marks <= this.totalMarks;
}, "Marks cannot exceed total marks.");

module.exports = mongoose.model("Result", resultSchema);
