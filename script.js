// =========================
// School Voting System Script
// =========================

// -------- GLOBAL VARIABLES --------
let students = JSON.parse(localStorage.getItem("students")) || [];
let nominations = JSON.parse(localStorage.getItem("nominations")) || [];
let candidates = JSON.parse(localStorage.getItem("candidates")) || [];
let votes = JSON.parse(localStorage.getItem("votes")) || {};
let resultsPublished = JSON.parse(localStorage.getItem("resultsPublished")) || false;
let classes = JSON.parse(localStorage.getItem("classes")) || [
  "Form Three Georgia", "Form Four Georgia", "Harvard", "Dates",
  "Doesn't", "My Army", "Phoenix", "Oxford", "Cambridge"
];
let dorms = JSON.parse(localStorage.getItem("dorms")) || [
  "Sent Pole", "Pope Francis", "Wilson Peters", "Bishop Crawl", "Send Williams"
];
let posts = JSON.parse(localStorage.getItem("posts")) || [
  "Head Boy", "Head Girl", "Games Captain", "Dining Hall Captain", "Library Captain"
];
let academicYear = localStorage.getItem("academicYear") || new Date().getFullYear();
let votingDeadline = localStorage.getItem("votingDeadline") || null;
let adminPassword = localStorage.getItem("adminPassword") || "admin123";

// Save function
function saveData() {
  localStorage.setItem("students", JSON.stringify(students));
  localStorage.setItem("nominations", JSON.stringify(nominations));
  localStorage.setItem("candidates", JSON.stringify(candidates));
  localStorage.setItem("votes", JSON.stringify(votes));
  localStorage.setItem("resultsPublished", JSON.stringify(resultsPublished));
  localStorage.setItem("classes", JSON.stringify(classes));
  localStorage.setItem("dorms", JSON.stringify(dorms));
  localStorage.setItem("posts", JSON.stringify(posts));
  localStorage.setItem("academicYear", academicYear);
  localStorage.setItem("votingDeadline", votingDeadline);
  localStorage.setItem("adminPassword", adminPassword);
}

// -------- AUTHENTICATION --------
function registerStudent(username, className, dorm) {
  if (students.find(s => s.username === username)) {
    alert("Student already registered!");
    return;
  }
  let newStudent = {
    username,
    className,
    dorm,
    hasVoted: false,
    voteHistory: []
  };
  students.push(newStudent);
  saveData();
  alert("Registration successful! You can now log in.");
  window.location.href = "login.html";
}

function loginStudent(username) {
  let student = students.find(s => s.username === username);
  if (!student) {
    alert("Student not found!");
    return;
  }
  localStorage.setItem("loggedInUser", username);
  window.location.href = "dashboard.html";
}

function loginAdmin(password) {
  if (password === adminPassword) {
    localStorage.setItem("isAdmin", "true");
    window.location.href = "admin.html";
  } else {
    alert("Incorrect admin password!");
  }
}

function logout() {
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("isAdmin");
  window.location.href = "index.html";
}

// -------- NOMINATION --------
function submitNomination(username, post, manifesto) {
  let student = students.find(s => s.username === username);
  if (!student) {
    alert("Only registered students can nominate!");
    return;
  }
  let nomination = { username, post, manifesto, approved: false };
  nominations.push(nomination);
  saveData();
  alert("Nomination submitted for admin approval!");
}

// Approve nomination (Admin)
function approveNomination(index) {
  let nomination = nominations[index];
  candidates.push({
    username: nomination.username,
    post: nomination.post,
    manifesto: nomination.manifesto,
    votes: 0
  });
  nominations.splice(index, 1);
  saveData();
  renderNominations();
  renderCandidates();
}

// -------- VOTING --------
function voteForCandidate(studentUsername, candidateUsername, post) {
  let student = students.find(s => s.username === studentUsername);
  if (!student) {
    alert("You must log in as a student!");
    return;
  }
  if (student.hasVoted && student.voteHistory.includes(post)) {
    alert("You already voted for this post!");
    return;
  }
  if (!votes[post]) votes[post] = {};
  if (!votes[post][candidateUsername]) votes[post][candidateUsername] = 0;

  votes[post][candidateUsername]++;
  student.hasVoted = true;
  student.voteHistory.push(post);

  saveData();
  alert("Vote cast successfully!");
  renderResultsChart();
}

// -------- RESULTS --------
function publishResults() {
  resultsPublished = true;
  saveData();
  alert("Results published. Students can now view them.");
}

function renderResults() {
  if (!resultsPublished) {
    document.getElementById("resultsContainer").innerHTML =
      "<p>Results have not been published yet.</p>";
    return;
  }

  let html = "";
  for (let post of posts) {
    html += `<h3>${post}</h3>`;
    if (votes[post]) {
      for (let candidate in votes[post]) {
        html += `<p>${candidate}: ${votes[post][candidate]} votes</p>`;
      }
    } else {
      html += `<p>No votes yet.</p>`;
    }
  }
  document.getElementById("resultsContainer").innerHTML = html;
}

// -------- DEADLINE --------
function setDeadline(datetime) {
  votingDeadline = datetime;
  saveData();
}

function checkDeadline() {
  if (!votingDeadline) return false;
  return new Date() > new Date(votingDeadline);
}

// -------- EXPORT --------
function exportCSV() {
  let csv = "Post,Candidate,Votes\n";
  for (let post in votes) {
    for (let candidate in votes[post]) {
      csv += `${post},${candidate},${votes[post][candidate]}\n`;
    }
  }
  let blob = new Blob([csv], { type: "text/csv" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "results.csv";
  link.click();
}

function exportPDF() {
  let content = "Voting Results\n\n";
  for (let post in votes) {
    content += post + "\n";
    for (let candidate in votes[post]) {
      content += `   ${candidate}: ${votes[post][candidate]} votes\n`;
    }
    content += "\n";
  }
  let blob = new Blob([content], { type: "application/pdf" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "results.pdf";
  link.click();
}

// -------- CHARTS --------
function renderResultsChart() {
  if (!document.getElementById("resultsChart")) return;

  let ctx = document.getElementById("resultsChart").getContext("2d");
  let labels = [];
  let data = [];

  for (let post in votes) {
    for (let candidate in votes[post]) {
      labels.push(`${candidate} (${post})`);
      data.push(votes[post][candidate]);
    }
  }

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Votes",
          data
        }
      ]
    }
  });
}

// -------- INITIALIZE --------
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("resultsContainer")) {
    renderResults();
  }
  if (document.getElementById("resultsChart")) {
    renderResultsChart();
  }
});
