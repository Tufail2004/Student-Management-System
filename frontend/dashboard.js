const API_BASE = "https://student-management-system-ros7.onrender.com/api";

const tableBody = document.getElementById("tableBody");
const form = document.getElementById("studentForm");
const nameInput = document.getElementById("name");
const rollInput = document.getElementById("roll");
const emailInput = document.getElementById("email");
const courseInput = document.getElementById("course");
const message = document.getElementById("studentMessage");
let students = [];
let editingStudentId = null;

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}

function setMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

async function loadStudents() {
  try {
    students = await readResponse(await fetch(`${API_BASE}/students`));
    renderTable();
  } catch (error) {
    setMessage(error.message, true);
  }
}

function renderTable() {
  tableBody.replaceChildren();
  students.forEach(student => {
    const row = document.createElement("tr");
    [student.name, student.rollNo, student.email, student.course].forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = value || "";
      row.appendChild(cell);
    });
    const actions = document.createElement("td");
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "table-action";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editStudent(student._id));
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "table-action delete";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteStudent(student._id));
    actions.append(editButton, deleteButton);
    row.appendChild(actions);
    tableBody.appendChild(row);
  });
  searchStudent(document.querySelector(".search").value);
  document.getElementById("totalStudents").textContent = students.length;
  document.getElementById("totalCourses").textContent = new Set(students.map(student => student.course).filter(Boolean)).size;
}

function editStudent(id) {
  const student = students.find(item => item._id === id);
  if (!student) return;
  editingStudentId = id;
  nameInput.value = student.name;
  rollInput.value = student.rollNo;
  emailInput.value = student.email;
  courseInput.value = student.course;
  form.querySelector("button[type=submit]").textContent = "Update Student";
  nameInput.focus();
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const student = {
    name: nameInput.value.trim(),
    rollNo: rollInput.value.trim(),
    email: emailInput.value.trim(),
    course: courseInput.value.trim()
  };
  const url = editingStudentId ? `${API_BASE}/students/${editingStudentId}` : `${API_BASE}/students`;
  try {
    const savedStudent = await readResponse(await fetch(url, {
      method: editingStudentId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student)
    }));
    if (editingStudentId) {
      students = students.map(item => item._id === editingStudentId ? savedStudent : item);
      setMessage("Student updated.");
    } else {
      students.push(savedStudent);
      setMessage("Student added.");
    }
    students.sort((a, b) => a.name.localeCompare(b.name));
    editingStudentId = null;
    form.reset();
    form.querySelector("button[type=submit]").textContent = "Add Student";
    renderTable();
  } catch (error) {
    setMessage(error.message, true);
  }
});

async function deleteStudent(id) {
  try {
    await readResponse(await fetch(`${API_BASE}/students/${id}`, { method: "DELETE" }));
    students = students.filter(student => student._id !== id);
    if (editingStudentId === id) {
      editingStudentId = null;
      form.reset();
      form.querySelector("button[type=submit]").textContent = "Add Student";
    }
    renderTable();
    setMessage("Student deleted.");
  } catch (error) {
    setMessage(error.message, true);
  }
}

function searchStudent(value) {
  const query = value.trim().toLowerCase();
  tableBody.querySelectorAll("tr").forEach(row => {
    row.hidden = !row.cells[0].textContent.toLowerCase().includes(query)
      && !row.cells[1].textContent.toLowerCase().includes(query);
  });
}
