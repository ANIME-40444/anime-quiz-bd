const quizContainer = document.getElementById('quiz-container');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const timerEl = document.getElementById('timer');
const userCoinsEl = document.getElementById('user-coins');

let currentQuestion = 0;
let questions = [
  {
    question: "Which anime features a character named Goku?",
    options: ["Naruto", "Dragon Ball", "One Piece", "Bleach"],
    answer: "Dragon Ball"
  },
  {
    question: "In Naruto, who is Naruto's rival?",
    options: ["Sasuke", "Goku", "Luffy", "Ichigo"],
    answer: "Sasuke"
  },
  // আরও question এভাবে add করতে পারো
];

let timer = 5;
let coinValue = 5;
let currentUser;

auth.onAuthStateChanged(user => {
  if(user){
    currentUser = user;
    db.collection("users").doc(user.uid).get().then(doc => {
      if(doc.exists){
        userCoinsEl.textContent = doc.data().coins;
      }
    });
    loadQuestion();
  } else {
    window.location = "index.html";
  }
});

function loadQuestion(){
  if(currentQuestion >= questions.length) {
    alert("You have completed the quiz!");
    return;
  }

  let q = questions[currentQuestion];
  questionEl.textContent = q.question;
  optionsEl.innerHTML = "";
  q.options.forEach(opt => {
    let btn = document.createElement("button");
    btn.textContent = opt;
    btn.addEventListener("click", () => checkAnswer(opt, q.answer));
    optionsEl.appendChild(btn);
  });

  timer = 5;
  timerEl.textContent = `Time Left: ${timer}s`;
  let countdown = setInterval(() => {
    timer--;
    timerEl.textContent = `Time Left: ${timer}s`;
    if(timer <= 0){
      clearInterval(countdown);
      alert("Time's up!");
      nextQuestion(false);
    }
  }, 1000);
}

function checkAnswer(selected, correct){
  if(selected === correct){
    alert("Correct!");
    updateCoins(coinValue);
    nextQuestion(true);
  } else {
    alert("Wrong!");
    updateCoins(-coinValue);
    nextQuestion(false);
  }
}

function nextQuestion(isCorrect){
  currentQuestion++;
  loadQuestion();
}

function updateCoins(amount){
  let newCoins = parseInt(userCoinsEl.textContent) + amount;
  if(newCoins < 0) newCoins = 0;
  userCoinsEl.textContent = newCoins;
  db.collection("users").doc(currentUser.uid).update({coins: newCoins});
}
