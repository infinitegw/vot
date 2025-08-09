  /* ------------------------------------------------------------------
  script.js
  Full admin management + live-sync for posts/classes/dorms/nominations
  Keys used in localStorage:
    adminPassword, adminLoggedIn,
    posts, classes, dorms,
    nominations (pending), candidates (approved),
    votes, activityLog,
    votingDeadline, resultsPublished
------------------------------------------------------------------ */

/* ---------- Helpers & preload defaults ---------- */
function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch(e){ return fallback; }
}
function write(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
function simpleSet(key, value){ localStorage.setItem(key, value); }
function logActivity(action){
  const logs = read('activityLog', []);
  logs.unshift({ action, time: new Date().toLocaleString() });
  write('activityLog', logs.slice(0,200));
  renderActivity();
}

/* Preload sensible defaults once */
(function preloadDefaults(){
  if (!localStorage.getItem('adminPassword')) localStorage.setItem('adminPassword','admin123');
  if (!localStorage.getItem('posts')) write('posts', ['Head Boy','Head Prefect','Secretary']);
  if (!localStorage.getItem('classes')) write('classes', ['Form Three Georgia','Form Four Georgia','Harvard']);
  if (!localStorage.getItem('dorms')) write('dorms',['Sent Pole','Pope Francis','Wilson Peters']);
  if (!localStorage.getItem('nominations')) write('nominations', []);
  if (!localStorage.getItem('candidates')) write('candidates', []);
  if (!localStorage.getItem('votes')) write('votes', []);
  if (!localStorage.getItem('resultsPublished')) simpleSet('resultsPublished','false');
})();

/* ---------- Admin session & auth helpers ---------- */
function openAdminPanel(){ // call from index's admin button
  const stored = localStorage.getItem('adminPassword') || 'admin123';
  const input = prompt('Enter admin password:');
  if (input === stored){
    simpleSet('adminLoggedIn','true');
    logActivity('Admin logged in');
    window.location.href = 'admin.html';
  } else {
    alert('Incorrect password.');
  }
}
function adminLogout(){
  localStorage.removeItem('adminLoggedIn');
  logActivity('Admin logged out');
  window.location.href = 'index.html';
}
function checkAdminSession(){ // call on admin page load
  if (localStorage.getItem('adminLoggedIn') !== 'true'){ alert('Access denied.'); window.location.href='index.html'; return false; }
  // If allowed, render admin UI
  renderAllAdmin();
  renderPublishStatus();
  return true;
}

/* ---------- CRUD: posts, classes, dorms ---------- */
function getPosts(){ return read('posts',[]); }
function getClasses(){ return read('classes',[]); }
function getDorms(){ return read('dorms',[]); }

function addPost(){
  const v = (document.getElementById('newPost') || {}).value || '';
  const val = v.trim();
  if (!val) return alert('Enter post name');
  const arr = getPosts();
  if (arr.includes(val)) return alert('Post exists');
  arr.push(val); write('posts',arr);
  (document.getElementById('newPost')||{}).value='';
  logActivity(`Post added: ${val}`);
  storageSyncTrigger();
  renderPosts();
}
function deletePost(idx){
  const arr = getPosts(); if (!arr[idx]) return;
  const removed = arr.splice(idx,1)[0]; write('posts',arr);
  logActivity(`Post deleted: ${removed}`);
  storageSyncTrigger();
  renderPosts();
}

function addClass(){
  const v = (document.getElementById('newClass') || {}).value || '';
  const val = v.trim(); if(!val) return alert('Enter class');
  const arr = getClasses();
  if (arr.includes(val)) return alert('Class exists');
  arr.push(val); write('classes',arr);
  (document.getElementById('newClass')||{}).value='';
  logActivity(`Class added: ${val}`);
  storageSyncTrigger(); renderClasses();
}
function deleteClass(idx){
  const arr = getClasses(); if(!arr[idx]) return;
  const removed = arr.splice(idx,1)[0]; write('classes',arr);
  logActivity(`Class deleted: ${removed}`);
  storageSyncTrigger(); renderClasses();
}

function addDorm(){
  const v = (document.getElementById('newDorm') || {}).value || '';
  const val = v.trim(); if(!val) return alert('Enter dorm');
  const arr = getDorms();
  if (arr.includes(val)) return alert('Dorm exists');
  arr.push(val); write('dorms',arr);
  (document.getElementById('newDorm')||{}).value='';
  logActivity(`Dorm added: ${val}`);
  storageSyncTrigger(); renderDorms();
}
function deleteDorm(idx){
  const arr = getDorms(); if(!arr[idx]) return;
  const removed = arr.splice(idx,1)[0]; write('dorms',arr);
  logActivity(`Dorm deleted: ${removed}`);
  storageSyncTrigger(); renderDorms();
}

/* ---------- Render helpers for admin UI ---------- */
function renderPosts(){
  const ul = document.getElementById('postList'); if(!ul) return;
  const items = getPosts();
  ul.innerHTML = items.map((p,i)=> `<li><span>${p}</span><div><button onclick="deletePost(${i})" class="small">Delete</button></div></li>`).join('');
}
function renderClasses(){
  const ul = document.getElementById('classList'); if(!ul) return;
  const items = getClasses();
  ul.innerHTML = items.map((c,i)=> `<li><span>${c}</span><div><button onclick="deleteClass(${i})" class="small">Delete</button></div></li>`).join('');
}
function renderDorms(){
  const ul = document.getElementById('dormList'); if(!ul) return;
  const items = getDorms();
  ul.innerHTML = items.map((d,i)=> `<li><span>${d}</span><div><button onclick="deleteDorm(${i})" class="small">Delete</button></div></li>`).join('');
}

/* ---------- Nominations approval ---------- */
function renderNominations(){
  const container = document.getElementById('pendingNoms'); if(!container) return;
  const noms = read('nominations',[]);
  if (!noms.length) return container.innerHTML = '<p>No pending nominations</p>';
  container.innerHTML = noms.map((n,i)=> {
    return `<div style="padding:10px;border-radius:6px;background:#fff;margin-bottom:8px;border:1px solid #eee">
      <strong>${n.name}</strong> — ${n.post} (${n.cls}, ${n.dorm})
      <div style="margin-top:8px">
        <button onclick="approveNom(${i})">Approve</button>
        <button style="margin-left:6px;background:#d33" onclick="rejectNom(${i})">Reject</button>
      </div>
    </div>`;
  }).join('');
}

function approveNom(index){
  const noms = read('nominations',[]);
  if (!noms[index]) return;
  const cand = noms.splice(index,1)[0];
  const approved = read('candidates',[]);
  approved.push(cand); write('candidates',approved); write('nominations',noms);
  logActivity(`Nomination approved: ${cand.name} (${cand.post})`);
  storageSyncTrigger(); renderNominations();
}
function rejectNom(index){
  const noms = read('nominations',[]);
  if (!noms[index]) return;
  const removed = noms.splice(index,1)[0]; write('nominations',noms);
  logActivity(`Nomination rejected: ${removed.name}`);
  renderNominations();
}

/* ---------- Publish / Unpublish results ---------- */
function publishResults(){ simpleSet('resultsPublished','true'); logActivity('Results published'); renderPublishStatus(); storageSyncTrigger(); }
function unpublishResults(){ simpleSet('resultsPublished','false'); logActivity('Results unpublished'); renderPublishStatus(); storageSyncTrigger(); }
function renderPublishStatus(){
  const p = document.getElementById('publishStatus'); if(!p) return;
  p.textContent = (localStorage.getItem('resultsPublished') === 'true') ? 'Results are PUBLISHED' : 'Results are NOT published';
}

/* ---------- Voting deadline ---------- */
function setVotingDeadline(){
  const v = (document.getElementById('deadlineInput')||{}).value;
  if (!v) return alert('Pick a date/time');
  simpleSet('votingDeadline', v);
  logActivity('Voting deadline set: '+v);
  storageSyncTrigger();
}
function clearVotingDeadline(){
  localStorage.removeItem('votingDeadline');
  logActivity('Voting deadline cleared');
  storageSyncTrigger();
}

/* ---------- Activity log ---------- */
function renderActivity(){
  const div = document.getElementById('activityLog'); if(!div) return;
  const logs = read('activityLog',[]);
  div.innerHTML = logs.map(l=> `<div style="padding:6px;border-bottom:1px solid #eee"><strong>${l.time}</strong> — ${l.action}</div>`).join('');
}

/* ---------- Password change for admin (prompt for simplicity) ---------- */
function changeAdminPassword(){
  const current = prompt('Enter current password:');
  const saved = localStorage.getItem('adminPassword') || 'admin123';
  if (current !== saved) return alert('Incorrect current password');
  const next = prompt('Enter new password (min 4 chars):');
  if (!next || next.length < 4) return alert('Password too short');
  localStorage.setItem('adminPassword', next); logActivity('Admin password changed');
  alert('Password updated.');
}

/* ---------- Live-sync: notify other tabs by writing a dummy key ---------- */
function storageSyncTrigger(){
  // small hack: change a timestamp key to trigger 'storage' event in other tabs
  localStorage.setItem('_lastAdminChange', new Date().toISOString());
}

/* ---------- Render all admin data ---------- */
function renderAllAdmin(){
  renderPosts(); renderClasses(); renderDorms(); renderNominations(); renderActivity(); renderPublishStatus();
  // populate the input (if deadline exists)
  const dl = localStorage.getItem('votingDeadline');
  if (dl) { try { document.getElementById('deadlineInput').value = dl } catch(e){} }
}

/* ---------- Populate dropdowns on other pages (register/login/nominate) ---------- */
function populateDropdownsOnPage(){
  // selects must have classes: live-class, live-dorm, live-post
  const classes = getClasses(); const dorms = getDorms(); const posts = getPosts();
  document.querySelectorAll('.live-class').forEach(sel => {
    const cur = sel.value;
    sel.innerHTML = `<option value="">Select Class</option>` + classes.map(c=>`<option value="${c}">${c}</option>`).join('');
    if (cur) sel.value = cur;
  });
  document.querySelectorAll('.live-dorm').forEach(sel => {
    const cur = sel.value;
    sel.innerHTML = `<option value="">Select Dorm</option>` + dorms.map(d=>`<option value="${d}">${d}</option>`).join('');
    if (cur) sel.value = cur;
  });
  document.querySelectorAll('.live-post').forEach(sel => {
    const cur = sel.value;
    sel.innerHTML = `<option value="">Select Post</option>` + posts.map(p=>`<option value="${p}">${p}</option>`).join('');
    if (cur) sel.value = cur;
  });
}

/* ---------- Storage event: react to changes in other tabs ---------- */
window.addEventListener('storage', (evt)=>{
  if (!evt.key) return;
  // react to our admin change trigger
  if (evt.key === '_lastAdminChange'){
    // update admin UI if on admin page
    try { renderAllAdmin(); } catch(e) {}
    // update selects on any page
    try { populateDropdownsOnPage(); } catch(e) {}
  }
});

/* ---------- When pages load, call populateDropdownsOnPage() automatically ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  try { populateDropdownsOnPage(); } catch(e){}
  try { renderPublishStatus(); } catch(e){}
});

/* ---------- Expose key functions globally (for buttons in HTML) ---------- */
window.openAdminPanel = openAdminPanel;
window.adminLogout = adminLogout;
window.checkAdminSession = checkAdminSession;
window.addPost = addPost;
window.deletePost = deletePost;
window.renderPosts = renderPosts;
window.addClass = addClass;
window.deleteClass = deleteClass;
window.renderClasses = renderClasses;
window.addDorm = addDorm;
window.deleteDorm = deleteDorm;
window.renderDorms = renderDorms;
window.approveNom = approveNom;
window.rejectNom = rejectNom;
window.renderNominations = renderNominations;
window.publishResults = publishResults;
window.unpublishResults = unpublishResults;
window.setVotingDeadline = setVotingDeadline;
window.clearVotingDeadline = clearVotingDeadline;
window.changeAdminPassword = changeAdminPassword;
window.renderActivity = renderActivity;

/* ------------------------------------------------------------------ END OF SCRIPT ------------------------------------------------- */
