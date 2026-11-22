const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  studentName: { type: String, required: true, trim: true },
  rollNo: { type: String, required: true, trim: true },
  course: { type: String, required: true, trim: true },
  status: { type: String, enum: ["Present", "Absent"], required: true }
}, { timestamps: true });

attendanceSchema.index({ date: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
