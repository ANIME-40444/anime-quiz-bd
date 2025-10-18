// js/quiz.js
const questionText = document.getElementById("question-text");
const optionBtns = document.querySelectorAll(".option-btn");
const coinsEl = document.getElementById("coins");
const timerEl = document.getElementById("timer");

let quizData = [];
let currentIndex = 0;
let coins = 0;
let timer;
let currentUser;

// Firebase Auth state check
auth.onAuthStateChanged(user => {
  if(user){
    currentUser = user;
    loadUserCoins();
    loadQuiz();
  } else {
    window.location = "index.html";
  }
});

// Load user coins from Firebase
function loadUserCoins(){
  db.collection("users").doc(currentUser.uid).get().then(doc=>{
    coins = doc.data()?.coins || 0;
    coinsEl.textContent = coins;
  });
}

// Load quiz data from Firebase
function loadQuiz() {
  db.collection("quiz").get().then(snapshot => {
    quizData = snapshot.docs.map(doc => doc.data());
    shuffle(quizData);
    showQuestion();
  });
}

// Display question and options
function showQuestion() {
  if(currentIndex >= quizData.length){
    alert("Quiz finished!");
    return;
  }
  const q = quizData[currentIndex];
  questionText.textContent = q.question;
  optionBtns.forEach((btn, idx) => {
    btn.textContent = q.options[idx];
    btn.style.backgroundColor = '';
    btn.disabled = false;
    btn.dataset.index = idx;
  });
  startTimer();
}

// Start 5-second timer
function startTimer(){
  let time = 5;
  timerEl.textContent = `Time Left: ${time}s`;
  clearInterval(timer);
  timer = setInterval(()=>{
    time--;
    timerEl.textContent = `Time Left: ${time}s`;
    if(time <= 0){
      clearInterval(timer);
      checkAnswer(-1); // time up = wrong
    }
  }, 1000);
}

// Add click events for options
optionBtns.forEach(btn => {
  btn.addEventListener("click", e=>{
    const selected = parseInt(e.target.dataset.index);
    checkAnswer(selected);
  });
});

// Check answer and update coins
function checkAnswer(selected){
  clearInterval(timer);
  const correct = quizData[currentIndex].answer - 1;
  optionBtns.forEach((btn, idx)=>{
    btn.disabled = true;
    if(idx === correct){
      btn.style.backgroundColor = "green";
    } else if(idx === selected){
      btn.style.backgroundColor = "red";
    }
  });

  if(selected === correct){
    coins += 5;
  } else {
    coins = Math.max(0, coins - 5);
  }

  coinsEl.textContent = coins;

  // Update coins in Firebase
  db.collection("users").doc(currentUser.uid).update({coins});

  setTimeout(()=>{
    currentIndex++;
    showQuestion();
  }, 1000);
}

// Shuffle quiz questions
function shuffle(array){
  for(let i = array.length-1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
