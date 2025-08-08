// Set default admin password if not set
if (!localStorage.getItem("adminPassword")) {
  localStorage.setItem("adminPassword", "admin123");
}

// Admin Panel button password prompt and redirect
document.addEventListener("DOMContentLoaded", () => {
  const adminBtn = document.getElementById("adminBtn");
  if (adminBtn) {
    adminBtn.addEventListener("click", () => {
      const input = prompt("Enter admin password:");
      const storedPass = localStorage.getItem("adminPassword");
      if (input === storedPass) {
        localStorage.setItem("adminLoggedIn", "true");
        window.location.href = "admin.html";
      } else {
        alert("Incorrect password.");
      }
    });
  }
});

// Check if admin is logged in when admin.html loads
function checkAdminSession() {
  if (localStorage.getItem("adminLoggedIn") !== "true") {
    alert("Access denied. Please log in as admin.");
    window.location.href = "index.html";
  } else {
    // Load admin data here if needed
    loadClasses();
    loadDorms();
    loadNominations();
  }
}

// Logout admin
function logoutAdmin() {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "index.html";
}

// Admin password change
function changeAdminPassword() {
  const currentPass = prompt("Enter current password:");
  const storedPass = localStorage.getItem("adminPassword");
  if (currentPass !== storedPass) {
    alert("Incorrect current password.");
    return;
  }
  const newPass = document.getElementById("newAdminPassword").value.trim();
  if (newPass.length < 4) {
    alert("Password must be at least 4 characters.");
    return;
  }
  localStorage.setItem("adminPassword", newPass);
  alert("Admin password updated successfully.");
  document.getElementById("newAdminPassword").value = "";
}

// Classes management
function addClass() {
  const input = document.getElementById("newClass");
  let classes = JSON.parse(localStorage.getItem("classes") || "[]");
  const className = input.value.trim();
  if (className && !classes.includes(className)) {
    classes.push(className);
    localStorage.setItem("classes", JSON.stringify(classes));
    loadClasses();
    input.value = "";
  } else {
    alert("Invalid or duplicate class.");
  }
}

function loadClasses() {
  const list = document.getElementById("classList");
  let classes = JSON.parse(localStorage.getItem("classes") || "[]");
  list.innerHTML = "";
  classes.forEach(c => {
    const li = document.createElement("li");
    li.textContent = c;
    list.appendChild(li);
  });
}

// Dorms management
function addDorm() {
  const input = document.getElementById("newDorm");
  let dorms = JSON.parse(localStorage.getItem("dorms") || "[]");
  const dormName = input.value.trim();
  if (dormName && !dorms.includes(dormName)) {
    dorms.push(dormName);
    localStorage.setItem("dorms", JSON.stringify(dorms));
    loadDorms();
    input.value = "";
  } else {
    alert("Invalid or duplicate dorm.");
  }
}

function loadDorms() {
  const list = document.getElementById("dormList");
  let dorms = JSON.parse(localStorage.getItem("dorms") || "[]");
  list.innerHTML = "";
  dorms.forEach(d => {
    const li = document.createElement("li");
    li.textContent = d;
    list.appendChild(li);
  });
}

// Nominations approval placeholder - load nominations here
function loadNominations() {
  const list = document.getElementById("nominationList");
  let nominations = JSON.parse(localStorage.getItem("nominations") || "[]");
  list.innerHTML = "";
  nominations.forEach((n, i) => {
    if (!n.approved) {
      const li = document.createElement("li");
      li.textContent = `${n.name} for ${n.post}`;
      const approveBtn = document.createElement("button");
      approveBtn.textContent = "Approve";
      approveBtn.onclick = () => approveNomination(i);
      li.appendChild(approveBtn);
      list.appendChild(li);
    }
  });
}

// Approve nomination
function approveNomination(index) {
  let nominations = JSON.parse(localStorage.getItem("nominations") || "[]");
  let approved = JSON.parse(localStorage.getItem("approvedCandidates") || "[]");
  if (nominations[index]) {
    nominations[index].approved = true;
    approved.push(nominations[index]);
    nominations.splice(index, 1);
    localStorage.setItem("nominations", JSON.stringify(nominations));
    localStorage.setItem("approvedCandidates", JSON.stringify(approved));
    alert("Nomination approved.");
    loadNominations();
  }
}

// Publish results
function publishResults() {
  localStorage.setItem("resultsPublished", "true");
  alert("Results published! Students can now view them.");
}
