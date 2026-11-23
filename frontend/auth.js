const API_BASE = "https://student-management-system-ros7.onrender.com/api";


async function authRequest(path, body) {
  const response = await fetch(`${API_BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "The request could not be completed.");
  return data;
}

async function register() {
  const username = document.getElementById("regUser").value.trim();
  const password = document.getElementById("regPass").value;
  const role = document.getElementById("regRole").value;
  if (!username || !password) {
    alert("Enter a username and password.");
    return;
  }
  try {
    const result = await authRequest("register", { username, password, role });
    alert(result.message);
    window.location.href = "login.html";
  } catch (error) {
    alert(error.message);
  }
}

async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;
  if (!username || !password) {
    alert("Enter your username and password.");
    return;
  }
  try {
    const result = await authRequest("login", { username, password, role });
    const normalizedRole = result.user.role.toLowerCase();
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("role", normalizedRole);
    localStorage.setItem("token", result.token);
    localStorage.setItem("username", result.user.username);
    const destinations = { admin: "dashboard.html", teacher: "teacher.html", student: "student.html" };
    window.location.href = destinations[normalizedRole] || "login.html";
  } catch (error) {
    alert(error.message);
  }
}

function logout() {
  ["loggedIn", "role", "token", "username"].forEach(key => localStorage.removeItem(key));
  window.location.href = "login.html";
}

function protectPage(requiredRole) {
  const isLoggedIn = localStorage.getItem("loggedIn") === "true" && Boolean(localStorage.getItem("token"));
  if (!isLoggedIn) {
    window.location.href = "login.html";
    return false;
  }
  if (requiredRole && localStorage.getItem("role") !== requiredRole.toLowerCase()) {
    alert("Access denied.");
    window.location.href = "login.html";
    return false;
  }
  return true;
}
