const API_BASE = "https://student-management-system-ros7.onrender.com/api";

let attendanceStudents = [];
const attendanceSelections = new Map();

function localDateString() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

async function attendanceResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}

function attendanceMessage(text, error = false) {
  const node = document.getElementById("attendanceMessage");
  node.textContent = text;
  node.classList.toggle("error", error);
}

async function initAttendance() {
  const dateInput = document.getElementById("attendanceDate");
  dateInput.value = localDateString();
  dateInput.addEventListener("change", loadAttendanceForDate);
  document.getElementById("saveAttendance").addEventListener("click", saveAttendance);
  try {
    attendanceStudents = await attendanceResponse(await fetch(`${attendanceApi}/students`));
    document.getElementById("studentCount").textContent = attendanceStudents.length;
    await loadAttendanceForDate();
  } catch (error) {
    attendanceMessage(error.message, true);
  }
}

async function loadAttendanceForDate() {
  const date = document.getElementById("attendanceDate").value;
  if (!date) return;
  try {
    const saved = await attendanceResponse(await fetch(`${attendanceApi}/attendance?date=${encodeURIComponent(date)}`));
    attendanceSelections.clear();
    saved.forEach(row => attendanceSelections.set(row.studentId, row.status));
    renderAttendanceRows();
    attendanceMessage("");
  } catch (error) {
    attendanceMessage(error.message, true);
  }
}

function renderAttendanceRows() {
  const body = document.getElementById("attendanceRows");
  body.replaceChildren();
  attendanceStudents.forEach(student => {
    const row = document.createElement("tr");
    [student.name, student.rollNo, student.course].forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = value || "";
      row.appendChild(cell);
    });
    const statusCell = document.createElement("td");
    ["Present", "Absent"].forEach(status => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `attendance-choice ${status.toLowerCase()}${attendanceSelections.get(student._id) === status ? " selected" : ""}`;
      button.textContent = status;
      button.setAttribute("aria-pressed", attendanceSelections.get(student._id) === status ? "true" : "false");
      button.addEventListener("click", () => {
        attendanceSelections.set(student._id, status);
        renderAttendanceRows();
        updateAttendanceSummary();
      });
      statusCell.appendChild(button);
    });
    row.appendChild(statusCell);
    body.appendChild(row);
  });
  updateAttendanceSummary();
}

function updateAttendanceSummary() {
  let present = 0;
  let absent = 0;
  attendanceSelections.forEach(status => {
    if (status === "Present") present += 1;
    if (status === "Absent") absent += 1;
  });
  document.getElementById("presentCount").textContent = present;
  document.getElementById("absentCount").textContent = absent;
  document.getElementById("studentCount").textContent = attendanceStudents.length;
}

async function saveAttendance() {
  if (!attendanceStudents.every(student => attendanceSelections.has(student._id))) {
    attendanceMessage("Choose Present or Absent for every student before saving.", true);
    return;
  }
  const attendance = attendanceStudents.map(student => ({
    studentId: student._id,
    studentName: student.name,
    rollNo: student.rollNo,
    course: student.course,
    status: attendanceSelections.get(student._id)
  }));
  try {
    const result = await attendanceResponse(await fetch(`${attendanceApi}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: document.getElementById("attendanceDate").value, attendance })
    }));
    attendanceMessage(result.message || "Attendance saved.");
  } catch (error) {
    attendanceMessage(error.message, true);
  }
}
