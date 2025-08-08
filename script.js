const ADMIN_PASSWORD = "admin123";

function getYearKey(base) {
  const year = localStorage.getItem("currentYear") || "default";
  return `${base}_${year}`;
}

function load(key) {
  return JSON.parse(localStorage.getItem(getYearKey(key))) || [];
}

function save(key, data) {
  localStorage.setItem(getYearKey(key), JSON.stringify(data));
}

function log(type, data) {
  const logs = load("logs");
  logs.push({
    type,
    data,
    time: new Date().toLocaleString(),
    device: navigator.userAgent
  });
  save("logs", logs);
}

function loadDynamicOptions() {
  const classes = load("classes");
  const dorms = load("dorms");
  ["class", "dorm"].forEach(id => {
    const sel = document.getElementById(id);
    if (sel) {
      const options = (id === "class" ? classes : dorms)
        .map(v => `<option>${v}</option>`).join("");
      sel.innerHTML = `<option disabled selected>Select ${id.charAt(0).toUpperCase() + id.slice(1)}</option>${options}`;
    }
  });
}

function register() {
  const adm = document.getElementById("adm").value.trim();
  const name = document.getElementById("name").value.trim();
  const cls = document.getElementById("class").value;
  const dorm = document.getElementById("dorm").value;
  if (!adm || !name || !cls || !dorm) return alert("Please fill all fields.");
  const students = load("students");
  if (students.find(s => s.adm === adm)) return alert("Admission number already used.");
  students.push({ adm, name, class: cls, dorm });
  save("students", students);
  log("register", { adm, name });
  alert("Registration successful. Please login.");
  location.href = "index.html";
}

function login() {
  const adm = document.getElementById("adm").value.trim();
  const name = document.getElementById("name").value.trim();
  const cls = document.getElementById("class").value;
  const dorm = document.getElementById("dorm").value;
  const students = load("students");
  const user = students.find(s => s.adm === adm && s.name === name && s.class === cls && s.dorm === dorm);
  if (!user) return alert("Invalid credentials.");
  sessionStorage.setItem("currentStudent", JSON.stringify(user));
  log("login", { adm, name });
  location.href = "dashboard.html";
}

function currentStudent() {
  return JSON.parse(sessionStorage.getItem("currentStudent"));
}

function logout() {
  sessionStorage.removeItem("currentStudent");
  location.href = "master.html";
}

function checkAdmin() {
  const pass = document.getElementById("adminPass").value;
  if (pass === ADMIN_PASSWORD) {
    sessionStorage.setItem("isAdmin", true);
    renderAdminData();
    document.getElementById("adminLogin").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
  } else {
    alert("Wrong password.");
  }
}

function logoutAdmin() {
  sessionStorage.removeItem("isAdmin");
  location.href = "master.html";
}
function loadNominationOptions() {
  const posts = load("posts");
  const classes = load("classes");
  const dorms = load("dorms");

  const postOptions = posts.map(p => `<option>${p}</option>`).join("");
  const classOptions = classes.map(c => `<option>${c}</option>`).join("");
  const dormOptions = dorms.map(d => `<option>${d}</option>`).join("");

  document.getElementById("position").innerHTML = `<option disabled selected>Select Post</option>${postOptions}`;
  document.getElementById("class").innerHTML = `<option disabled selected>Select Class</option>${classOptions}`;
  document.getElementById("dorm").innerHTML = `<option disabled selected>Select Dorm</option>${dormOptions}`;
}

function nominate() {
  const name = document.getElementById("name").value.trim();
  const position = document.getElementById("position").value;
  const cls = document.getElementById("class").value;
  const dorm = document.getElementById("dorm").value;
  const manifesto = document.getElementById("manifesto").value.trim();

  if (!name || !position || !cls || !dorm || !manifesto) {
    return alert("Please fill in all fields.");
  }

  const nominations = load("nominations");
  nominations.push({ name, position, class: cls, dorm, manifesto, approved: false });
  save("nominations", nominations);
  log("nominate", { name, position, class: cls, dorm });
  alert("Nomination submitted. Awaiting admin approval.");
  location.href = "dashboard.html";
}

function approveNomination(index) {
  const pending = load("nominations");
  const approvedNom = pending.splice(index, 1)[0];
  approvedNom.approved = true;

  const candidates = load("candidates");
  candidates.push(approvedNom);
  save("candidates", candidates);
  save("nominations", pending);
  alert("Nomination approved.");
  renderAdminData();
}

function deleteCandidate(index) {
  const candidates = load("candidates");
  if (confirm("Are you sure you want to delete this candidate?")) {
    candidates.splice(index, 1);
    save("candidates", candidates);
    renderAdminData();
  }
}

function addCandidate() {
  const name = document.getElementById("newCandName").value.trim();
  const position = document.getElementById("newCandPosition").value;
  const cls = document.getElementById("newCandClass").value;
  const dorm = document.getElementById("newCandDorm").value;
  if (!name || !position || !cls || !dorm) return alert("Fill all fields");
  const manifesto = "Added by admin";
  const candidates = load("candidates");
  candidates.push({ name, position, class: cls, dorm, manifesto, approved: true });
  save("candidates", candidates);
  renderAdminData();
}

function loadProfile() {
  const user = currentStudent();
  if (!user) return logout();
  document.getElementById("adm").innerText = user.adm;
  document.getElementById("name").innerText = user.name;
  document.getElementById("class").innerText = user.class;
  document.getElementById("dorm").innerText = user.dorm;
}
function loadVotingOptions() {
  const user = currentStudent();
  if (!user) return logout();

  const posts = load("posts");
  const candidates = load("candidates").filter(c => c.approved);
  const voted = load("votes").filter(v => v.adm === user.adm).map(v => v.position);

  const voteArea = document.getElementById("voteArea");
  voteArea.innerHTML = "";

  posts.forEach(post => {
    if (voted.includes(post)) return;

    const filtered = candidates.filter(c => {
      if (post.includes("Class Prefect")) return c.class === user.class && c.position === post;
      if (post.includes("Dorm Captain")) return c.dorm === user.dorm && c.position === post;
      return c.position === post;
    });

    if (!filtered.length) return;

    let html = `<label for="${post}"><b>${post}</b></label><br>`;
    html += `<select id="${post}"><option disabled selected>Select Candidate</option>`;
    filtered.forEach(c => {
      html += `<option value="${c.name}">${c.name} (${c.class}, ${c.dorm})</option>`;
    });
    html += "</select><br><br>";

    voteArea.innerHTML += html;
  });

  if (!voteArea.innerHTML) {
    voteArea.innerHTML = "<p>You have voted for all available positions.</p>";
  }
}

function submitVote() {
  const user = currentStudent();
  if (!user) return logout();

  const posts = load("posts");
  const votes = load("votes");

  let newVotes = 0;

  posts.forEach(post => {
    const select = document.getElementById(post);
    if (select && select.value) {
      if (!votes.some(v => v.adm === user.adm && v.position === post)) {
        votes.push({
          adm: user.adm,
          name: user.name,
          position: post,
          votedFor: select.value,
          time: new Date().toLocaleString()
        });
        newVotes++;
      }
    }
  });

  if (newVotes > 0) {
    save("votes", votes);
    log("vote", { adm: user.adm, count: newVotes });
    alert("Your votes have been recorded.");
    location.reload();
  } else {
    alert("No votes selected or you've already voted for these posts.");
  }
}

function renderLiveChart() {
  const votes = load("votes");
  const ctx = document.getElementById("voteChart");
  if (!ctx) return;

  const tally = {};
  votes.forEach(v => {
    if (!tally[v.votedFor]) tally[v.votedFor] = 0;
    tally[v.votedFor]++;
  });

  const labels = Object.keys(tally);
  const data = Object.values(tally);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Votes",
        data,
        backgroundColor: "rgba(75,192,192,0.6)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
function renderAdminData() {
  if (!sessionStorage.getItem("isAdmin")) return;

  const year = localStorage.getItem("currentYear") || "Not Set";
  document.getElementById("yearDisplay").innerText = year;

  const classes = load("classes");
  const dorms = load("dorms");
  const posts = load("posts");

  const classList = document.getElementById("classList");
  const dormList = document.getElementById("dormList");
  const postList = document.getElementById("postList");

  classList.innerHTML = classes.map(c => `<li>${c}</li>`).join("");
  dormList.innerHTML = dorms.map(d => `<li>${d}</li>`).join("");
  postList.innerHTML = posts.map(p => `<li>${p}</li>`).join("");

  const candSel = document.getElementById("newCandPosition");
  const classSel = document.getElementById("newCandClass");
  const dormSel = document.getElementById("newCandDorm");

  if (candSel) candSel.innerHTML = posts.map(p => `<option>${p}</option>`).join("");
  if (classSel) classSel.innerHTML = classes.map(p => `<option>${p}</option>`).join("");
  if (dormSel) dormSel.innerHTML = dorms.map(p => `<option>${p}</option>`).join("");

  const candidates = load("candidates");
  document.getElementById("candidatesList").innerHTML = candidates.map((c, i) =>
    `<li><b>${c.name}</b> for <b>${c.position}</b> (${c.class}, ${c.dorm}) 
     <button onclick="deleteCandidate(${i})">🗑️</button></li>`).join("");

  const pending = load("nominations").filter(n => !n.approved);
  document.getElementById("pendingNominations").innerHTML = pending.length ?
    pending.map((n, i) =>
      `<div><b>${n.name}</b> for <b>${n.position}</b> (${n.class}, ${n.dorm})<br>
       <i>${n.manifesto}</i><br>
       <button onclick="approveNomination(${i})">✅ Approve</button></div><hr>`
    ).join("") : "<p>No pending nominations.</p>";

  const logs = load("logs");
  document.getElementById("logsList").innerHTML = logs.map(log =>
    `<li>[${log.time}] (${log.type}) ${log.data.name || log.data.adm}</li>`).join("");

  renderAdminChart();
}

function addClass() {
  const newClass = document.getElementById("newClass").value.trim();
  if (!newClass) return alert("Class name is required.");
  const classes = load("classes");
  if (classes.includes(newClass)) return alert("Class already exists.");
  classes.push(newClass);
  save("classes", classes);
  renderAdminData();
}

function addDorm() {
  const newDorm = document.getElementById("newDorm").value.trim();
  if (!newDorm) return alert("Dorm name is required.");
  const dorms = load("dorms");
  if (dorms.includes(newDorm)) return alert("Dorm already exists.");
  dorms.push(newDorm);
  save("dorms", dorms);
  renderAdminData();
}

function addPost() {
  const newPost = document.getElementById("newPost").value.trim();
  if (!newPost) return alert("Post name is required.");
  const posts = load("posts");
  if (posts.includes(newPost)) return alert("Post already exists.");
  posts.push(newPost);
  save("posts", posts);
  renderAdminData();
}
function setAcademicYear() {
  const year = document.getElementById("academicYear").value.trim();
  if (!year) return alert("Enter academic year.");
  localStorage.setItem("currentYear", year);
  alert("Academic year updated.");
  renderAdminData();
}

function setVotingDeadline() {
  const deadline = document.getElementById("deadlineInput").value;
  if (!deadline) return alert("Please select a date and time.");
  localStorage.setItem("votingDeadline", deadline);
  alert("Voting deadline set.");
}

function disableVotingIfPastDeadline() {
  const deadline = localStorage.getItem("votingDeadline");
  if (!deadline) return;

  const now = new Date();
  const end = new Date(deadline);
  if (now > end) {
    const voteBtn = document.getElementById("submitVoteBtn");
    if (voteBtn) {
      voteBtn.disabled = true;
      voteBtn.innerText = "Voting Closed";
    }
  } else {
    const countdown = document.getElementById("deadlineCountdown");
    if (countdown) {
      const diff = Math.floor((end - now) / 1000);
      const hrs = Math.floor(diff / 3600);
      const mins = Math.floor((diff % 3600) / 60);
      const secs = diff % 60;
      countdown.innerText = `Voting ends in ${hrs}h ${mins}m ${secs}s`;
      setTimeout(disableVotingIfPastDeadline, 1000);
    }
  }
}

function renderAdminChart() {
  const votes = load("votes");
  const ctx = document.getElementById("adminChart");
  if (!ctx) return;

  const tally = {};
  votes.forEach(v => {
    if (!tally[v.votedFor]) tally[v.votedFor] = 0;
    tally[v.votedFor]++;
  });

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(tally),
      datasets: [{
        label: "Votes",
        data: Object.values(tally),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255,99,132,1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// --------------------- EXPORTS ---------------------
function exportFilteredCSV() {
  const type = document.getElementById("exportFilterType").value;
  const value = document.getElementById("exportFilterValue").value.trim().toLowerCase();
  const votes = load("votes");
  const filtered = votes.filter(v => {
    const student = load("students").find(s => s.adm === v.adm);
    if (!student) return false;
    return (type === "class" && student.class.toLowerCase() === value) ||
           (type === "dorm" && student.dorm.toLowerCase() === value) ||
           (type === "post" && v.position.toLowerCase() === value);
  });

  let csv = "Admission,Name,Position,VotedFor,Time\n";
  filtered.forEach(v => {
    csv += `${v.adm},${v.name},${v.position},${v.votedFor},${v.time}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "votes_export.csv";
  link.click();
}

function exportFilteredPDF() {
  const type = document.getElementById("exportFilterType").value;
  const value = document.getElementById("exportFilterValue").value.trim().toLowerCase();
  const votes = load("votes");
  const filtered = votes.filter(v => {
    const student = load("students").find(s => s.adm === v.adm);
    if (!student) return false;
    return (type === "class" && student.class.toLowerCase() === value) ||
           (type === "dorm" && student.dorm.toLowerCase() === value) ||
           (type === "post" && v.position.toLowerCase() === value);
  });

  const win = window.open();
  win.document.write("<h2>Vote Results</h2><table border='1'><tr><th>Adm</th><th>Name</th><th>Position</th><th>VotedFor</th><th>Time</th></tr>");
  filtered.forEach(v => {
    win.document.write(`<tr><td>${v.adm}</td><td>${v.name}</td><td>${v.position}</td><td>${v.votedFor}</td><td>${v.time}</td></tr>`);
  });
  win.document.write("</table>");
  win.print();
}
