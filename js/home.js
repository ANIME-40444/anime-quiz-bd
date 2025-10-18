// js/home.js
import { auth, db } from "./firebase-config.js"; // তোমার firebase-config.js ফাইল থেকে export থাকা লাগবে
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { collection, getDocs, doc, getDoc, updateDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";


// DOM elements
const userNameEl = document.getElementById('userName');
const userEmailEl = document.getElementById('userEmail');
const userCoinsEl = document.getElementById('userCoins');
const matchesPlayedEl = document.getElementById('matchesPlayed');

const playQuizBtn = document.getElementById('playQuizBtn');
const quizSection = document.getElementById('quizSection');
const dashboard = document.getElementById('dashboard');
const finishQuizBtn = document.getElementById('finishQuizBtn');

const questionText = document.getElementById('questionText');
const optionsDiv = document.getElementById('optionsDiv');
const timerEl = document.getElementById('timer');
const quizMsg = document.getElementById('quizMsg');
const qIndexEl = document.getElementById('qIndex');
const qTotalEl = document.getElementById('qTotal');

const threeDotBtn = document.getElementById('threeDotBtn');
const threeDotMenu = document.getElementById('threeDotMenu');
const menuProfile = document.getElementById('menuProfile');
const menuLeaderboard = document.getElementById('menuLeaderboard');
const menuRules = document.getElementById('menuRules');
const menuDeposit = document.getElementById('menuDeposit');
const menuWithdraw = document.getElementById('menuWithdraw');
const menuOrders = document.getElementById('menuOrders');
const menuLogout = document.getElementById('menuLogout');

const profileSection = document.getElementById('profileSection');
const leaderboardSection = document.getElementById('leaderboardSection');
const rulesSection = document.getElementById('rulesSection');
const ordersSection = document.getElementById('ordersSection');
const topPlayersList = document.getElementById('topPlayersList');
const ordersList = document.getElementById('ordersList');

// Quiz state
let quizData = [];
let currentIndex = 0;
let quizTimer = null;
let timeLeft = 5;
let currentUser = null;
const QUIZ_TIME = 5;
const COIN_DELTA = 5;
const MAX_MATCHES = 20;

// helper to hide all sections except dashboard or given
function hideAllPanels(){
  quizSection.classList.add('hidden');
  profileSection.classList.add('hidden');
  leaderboardSection.classList.add('hidden');
  rulesSection.classList.add('hidden');
  ordersSection.classList.add('hidden');
}

// 3-dot menu toggle
threeDotBtn.addEventListener('click', ()=> {
  threeDotMenu.classList.toggle('hidden');
});

// menu buttons
menuProfile.addEventListener('click', ()=> { threeDotMenu.classList.add('hidden'); openProfile(); });
menuLeaderboard.addEventListener('click', ()=> { threeDotMenu.classList.add('hidden'); openLeaderboard(); });
menuRules.addEventListener('click', ()=> { threeDotMenu.classList.add('hidden'); openRules(); });
menuDeposit.addEventListener('click', ()=> { window.location.href = "buycoins.html"; });
menuWithdraw.addEventListener('click', ()=> { window.location.href = "withdraw.html"; });
menuOrders.addEventListener('click', ()=> { threeDotMenu.classList.add('hidden'); openOrders(); });
menuLogout.addEventListener('click', async ()=> {
  await signOut(auth);
  window.location.href = "index.html";
});

// Auth state
onAuthStateChanged(auth, async (user) => {
  if(!user){
    window.location.href = "index.html";
    return;
  }
  currentUser = user;
  await loadUserInfo();
  await preloadQuiz(); // load quiz questions
  await loadTopPlayers();
  await loadOrders();
});

// load user info (coins, matches)
async function loadUserInfo(){
  const userDoc = await getDoc(doc(db,'users', currentUser.uid));
  const data = userDoc.exists() ? userDoc.data() : {};
  userNameEl.textContent = data.name || currentUser.email.split('@')[0];
  userEmailEl.textContent = currentUser.email;
  userCoinsEl.textContent = data.coins || 0;
  matchesPlayedEl.textContent = data.matchesPlayed || 0;
}

// preload quiz list from Firestore (collection 'quiz')
async function preloadQuiz(){
  quizData = [];
  const snap = await getDocs(collection(db,'quiz'));
  snap.forEach(d => quizData.push({ id: d.id, ...d.data() }));
  shuffleArray(quizData);
  qTotalEl.textContent = quizData.length;
}

// Play Quiz button clicked
playQuizBtn.addEventListener('click', async ()=>{
  // check matches and coins
  const userDocRef = doc(db,'users', currentUser.uid);
  const userSnap = await getDoc(userDocRef);
  const userData = userSnap.data() || {};
  const played = userData.matchesPlayed || 0;
  const coins = userData.coins || 0;
  if(played >= MAX_MATCHES){
    alert("You reached the maximum 20 matches!");
    return;
  }
  if(coins <= 0){
    alert("You have no coins. Please buy coins first.");
    return;
  }
  // start inline quiz
  dashboard.scrollIntoView({behavior:'smooth'});
  hideAllPanels();
  quizSection.classList.remove('hidden');
  currentIndex = 0;
  showQuestion();
});

// show question
function showQuestion(){
  if(currentIndex >= quizData.length){
    quizMsg.textContent = "No more questions available.";
    return;
  }
  const q = quizData[currentIndex];
  qIndexEl.textContent = currentIndex + 1;
  questionText.textContent = q.question || "Question text missing";
  optionsDiv.innerHTML = '';
  (q.options || []).forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.dataset.index = idx;
    btn.addEventListener('click', ()=> selectAnswer(idx));
    optionsDiv.appendChild(btn);
  });
  timeLeft = QUIZ_TIME;
  timerEl.textContent = timeLeft;
  quizMsg.textContent = '';
  clearInterval(quizTimer);
  quizTimer = setInterval(()=>{
    timeLeft--;
    timerEl.textContent = timeLeft;
    if(timeLeft <= 0){
      clearInterval(quizTimer);
      handleAnswer(null); // time up => wrong
    }
  },1000);
}

// user selected answer
async function selectAnswer(idx){
  clearInterval(quizTimer);
  handleAnswer(idx);
}

// handle answer (correctIdx = quizData[currentIndex].answer — stored 0-based or 1-based)
async function handleAnswer(selectedIdx){
  const q = quizData[currentIndex];
  const correctIdx = (typeof q.answer === 'number') ? (q.answer - 1) : q.answer; // support either
  // mark buttons
  const btns = optionsDiv.querySelectorAll('button');
  btns.forEach((b,i)=>{
    b.disabled = true;
    if(i === correctIdx) b.style.backgroundColor = '#24b24a'; // green
    if(selectedIdx === i && i !== correctIdx) b.style.backgroundColor = '#e74c3c'; // red
  });

  // update coins and matchesPlayed in Firestore
  const userRef = doc(db,'users', currentUser.uid);
  const userSnap = await getDoc(userRef);
  const ud = userSnap.exists() ? userSnap.data() : {};
  let coins = ud.coins || 0;
  let matches = ud.matchesPlayed || 0;

  if(selectedIdx === correctIdx){
    coins += COIN_DELTA;
    quizMsg.textContent = "✔ Correct!";
  } else {
    coins = Math.max(0, coins - COIN_DELTA);
    quizMsg.textContent = `✖ Wrong! Correct: ${ (q.options && q.options[correctIdx]) || 'N/A' }`;
  }

  matches += 1;
  // Save immediately
  await updateDoc(userRef, { coins, matchesPlayed: matches });

  // update UI
  userCoinsEl.textContent = coins;
  matchesPlayedEl.textContent = matches;

  // if matches reached MAX_MATCHES, stop further play after brief delay
  setTimeout(()=>{
    currentIndex++;
    if(matches >= MAX_MATCHES){
      alert("You reached maximum 20 matches.");
      hideAllPanels();
      // return to dashboard
      return;
    }
    showQuestion();
  }, 900);
}

// finish quiz button
finishQuizBtn.addEventListener('click', ()=>{
  clearInterval(quizTimer);
  hideAllPanels();
});

// open profile
async function openProfile(){
  hideAllPanels();
  profileSection.classList.remove('hidden');
  const docSnap = await getDoc(doc(db,'users', currentUser.uid));
  const data = docSnap.exists() ? docSnap.data() : {};
  document.getElementById('profile_name').textContent = data.name || '';
  document.getElementById('profile_email').textContent = data.email || currentUser.email;
  document.getElementById('profile_uid').textContent = currentUser.uid;
  document.getElementById('profile_coins').textContent = data.coins || 0;
}

// open leaderboard
async function openLeaderboard(){
  hideAllPanels();
  leaderboardSection.classList.remove('hidden');
  topPlayersList.innerHTML = '';
  const q = query(collection(db,'users'), orderBy('coins','desc'), limit(10));
  const snap = await getDocs(q);
  snap.forEach(s => {
    const d = s.data();
    const li = document.createElement('li');
    li.textContent = `${d.name || s.id} — ${d.coins || 0} coins (${d.email || ''})`;
    topPlayersList.appendChild(li);
  });
}

// open rules
function openRules(){
  hideAllPanels();
  rulesSection.classList.remove('hidden');
}

// open orders
async function loadOrders(){
  // load recent orders for this user
  if(!currentUser) return;
  ordersList.innerHTML = '';
  const snap = await getDocs(collection(db,'orders'));
  // show only current user's orders
  snap.forEach(s=>{
    const d = s.data();
    if(d.userId === currentUser.uid){
      const li = document.createElement('li');
      li.textContent = `Order ${d.orderId || s.id} — ${d.status} — Txn: ${d.transactionId || d.txn || 'N/A'}`;
      ordersList.appendChild(li);
    }
  });
}

async function openOrders(){
  hideAllPanels();
  ordersSection.classList.remove('hidden');
  await loadOrders();
}

// utility shuffle
function shuffleArray(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
    }
