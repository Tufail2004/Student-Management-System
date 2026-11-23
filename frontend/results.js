const API_BASE = "https://student-management-system-ros7.onrender.com/api";

const resultForm = document.getElementById("resultForm");

async function resultsResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}

function resultMessage(text, error = false) {
  const node = document.getElementById("resultMessage");
  node.textContent = text;
  node.classList.toggle("error", error);
}

async function initResults() {
  try {
    const students = await resultsResponse(await fetch(`${resultsApi}/students`));
    const select = document.getElementById("resultStudent");
    students.forEach(student => {
      const option = document.createElement("option");
      option.value = student._id;
      option.textContent = `${student.name} (${student.rollNo})`;
      select.appendChild(option);
    });
    await loadResults();
  } catch (error) {
    resultMessage(error.message, true);
  }
  resultForm.addEventListener("submit", addResult);
}

async function loadResults() {
  try {
    const results = await resultsResponse(await fetch(`${resultsApi}/results`));
    const body = document.getElementById("resultsRows");
    body.replaceChildren();
    results.forEach(result => {
      const row = document.createElement("tr");
      [result.studentName, result.rollNo, result.course, result.subject, result.marks, result.totalMarks].forEach(value => {
        const cell = document.createElement("td");
        cell.textContent = value ?? "";
        row.appendChild(cell);
      });
      body.appendChild(row);
    });
  } catch (error) {
    resultMessage(error.message, true);
  }
}

async function addResult(event) {
  event.preventDefault();
  const marks = Number(document.getElementById("marks").value);
  const totalMarks = Number(document.getElementById("totalMarks").value);
  if (marks > totalMarks) {
    resultMessage("Marks cannot exceed total marks.", true);
    return;
  }
  try {
    const result = await resultsResponse(await fetch(`${resultsApi}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: document.getElementById("resultStudent").value,
        subject: document.getElementById("subject").value.trim(),
        marks,
        totalMarks
      })
    }));
    resultForm.reset();
    resultMessage(`Result saved for ${result.studentName}.`);
    await loadResults();
  } catch (error) {
    resultMessage(error.message, true);
  }
}
