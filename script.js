// ------------------------------
// Registration (Student)
// ------------------------------
function registerStudent(event) {
    event.preventDefault();

    let students = JSON.parse(localStorage.getItem("students")) || [];

    const student = {
        username: document.getElementById("regUsername").value,
        password: document.getElementById("regPassword").value,
        class: document.getElementById("regClass").value,
        dorm: document.getElementById("regDorm").value
    };

    // Prevent duplicate usernames
    if (students.find(s => s.username === student.username)) {
        alert("Username already exists!");
        return;
    }

    students.push(student);
    localStorage.setItem("students", JSON.stringify(students));

    alert("Registration successful! Please login.");
    window.location.href = "login.html";
}

// ------------------------------
// Login (Student)
// ------------------------------
function loginStudent(event) {
    event.preventDefault();

    let students = JSON.parse(localStorage.getItem("students")) || [];
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const student = students.find(s => s.username === username && s.password === password);

    if (student) {
        // ✅ Save login state
        localStorage.setItem("loggedInUser", JSON.stringify(student));
        alert("Login successful!");
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid credentials! Please try again.");
    }
}

// ------------------------------
// Protect Pages (Dashboard, Voting, etc.)
// ------------------------------
function checkLogin() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
        // Not logged in → redirect
        window.location.href = "login.html";
    }
}

// ------------------------------
// Logout
// ------------------------------
function logout() {
    localStorage.removeItem("loggedInUser");
    alert("You have been logged out.");
    window.location.href = "index.html"; // back to master/home page
      }
