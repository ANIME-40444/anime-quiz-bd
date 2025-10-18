// js/admin.js

const usersTable = document.getElementById('users-table');
const quizRequestsTable = document.getElementById('quiz-requests-table');
const addCoinsInput = document.getElementById('add-coins');
const addCoinsBtn = document.getElementById('add-coins-btn');
const logoutBtn = document.getElementById('logout-btn');

let adminUser;

// চেক অ্যাডমিন লগইন
auth.onAuthStateChanged(async (user) => {
  if(user){
    adminUser = user;
    if(user.email !== "jisan427768@gmail.com"){ // শুধু এডমিন ই লগইন করতে পারবে
      alert("Access Denied!");
      window.location.href = "index.html";
      return;
    }
    loadUsers();
    loadQuizRequests();
  } else {
    window.location.href = "index.html";
  }
});

// ইউজার লিস্ট লোড
async function loadUsers(){
  const snapshot = await db.collection('users').get();
  usersTable.innerHTML = '';
  snapshot.docs.forEach(doc=>{
    const data = doc.data();
    const row = `<tr>
      <td>${data.name || "No Name"}</td>
      <td>${data.email}</td>
      <td>${data.coins || 0}</td>
      <td>${doc.id.substring(0,8)}</td>
      <td>
        <button onclick="banUser('${doc.id}')">Ban</button>
      </td>
    </tr>`;
    usersTable.innerHTML += row;
  });
}

// কোইন অ্যাড
addCoinsBtn.addEventListener('click', async ()=>{
  const uid = document.getElementById('user-id-input').value;
  const coinsToAdd = parseInt(addCoinsInput.value);
  if(uid && !isNaN(coinsToAdd)){
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();
    if(doc.exists){
      let newCoins = (doc.data().coins || 0) + coinsToAdd;
      await userRef.update({coins: newCoins});
      alert("Coins Added Successfully!");
      loadUsers();
    } else {
      alert("User not found!");
    }
  } else {
    alert("Please provide valid user ID and coins.");
  }
});

// ইউজার বান/আনবান
async function banUser(uid){
  const userRef = db.collection('users').doc(uid);
  const doc = await userRef.get();
  if(doc.exists){
    const banned = doc.data().banned || false;
    await userRef.update({banned: !banned});
    alert(banned ? "User Unbanned" : "User Banned");
    loadUsers();
  }
}

// কুইজ রিকুয়েস্ট লোড
async function loadQuizRequests(){
  const snapshot = await db.collection('quizRequests').get();
  quizRequestsTable.innerHTML = '';
  snapshot.docs.forEach(doc=>{
    const data = doc.data();
    const row = `<tr>
      <td>${data.userName}</td>
      <td>${data.email}</td>
      <td>${data.status || "Pending"}</td>
      <td>
        <button onclick="approveRequest('${doc.id}')">Approve</button>
        <button onclick="rejectRequest('${doc.id}')">Reject</button>
      </td>
    </tr>`;
    quizRequestsTable.innerHTML += row;
  });
}

// রিকুয়েস্ট Approve/Reject
async function approveRequest(id){
  await db.collection('quizRequests').doc(id).update({status: "Approved"});
  loadQuizRequests();
}

async function rejectRequest(id){
  await db.collection('quizRequests').doc(id).update({status: "Rejected"});
  loadQuizRequests();
}

// লগআউট
logoutBtn.addEventListener('click', ()=>{
  auth.signOut().then(()=> window.location.href = "index.html");
});
