let score = 0;
let timeLeft = 60;
let correctAnswer = 0;
let timer;

const correctSound = new Audio("correct.mp3");
const incorrectSound = new Audio("wronganswer.mp3");

document.getElementById("continue-btn").addEventListener("click", () => {
  document.getElementById("welcome-screen").style.display = "none";
  document.getElementById("setup").style.display = "block";
});


function showHighScores(level) {
  const container = document.getElementById("high-score-board");
  const highScores = JSON.parse(localStorage.getItem("highScores")) || {};
  const scores = highScores[level] || [];

  let html = `<h3>🏆 Top 5 Scores – ${level.toUpperCase()}</h3><ol>`;

  scores.forEach(entry => {
    html += `<li>${entry.name} – ${entry.score} pts <small>(${entry.date})</small></li>`;
  });

  html += "</ol>";
  container.innerHTML = html;

  container.style.display = "block";
}


function saveHighScore(player, score) {
  const level = player.level;
  const date = new Date().toLocaleDateString();

  const newEntry = {
    name: player.name,
    score: score,
    date: date
  };

  // Get current high scores from localStorage
  let highScores = JSON.parse(localStorage.getItem("highScores")) || {
    easy: [],
    medium: [],
    hard: []
  };

  // Add the new entry
  highScores[level].push(newEntry);

  // Sort by score (descending), then slice top 5
  highScores[level].sort((a, b) => b.score - a.score);
  highScores[level] = highScores[level].slice(0, 5);

  // Save back to localStorage
  localStorage.setItem("highScores", JSON.stringify(highScores));
}


function getRandomQuestion() {
  let min = 1;
  let max = 10;

  const selectedLevel = document.getElementById("level-select").value;

  if (selectedLevel === "medium") {
    min = 11;
    max = 20;
  } else if (selectedLevel === "hard") {
    min = 21;
    max = 30;
  }

  const a = Math.floor(Math.random() * (max - min + 1)) + min;
  const b = Math.floor(Math.random() * max) + 1;

  correctAnswer = a * b;
  document.getElementById("question").textContent = `What is ${a} × ${b}?`;
  document.getElementById("answer-input").value = "";
  document.getElementById("feedback").textContent = "";
}

function updateScore(points) {
  score += points;
  document.getElementById("score").textContent = `Score: ${score}`;
}

function checkAnswer() {
  const input = document.getElementById("answer-input").value.trim();
  if (input === "") return;

  const userAnswer = parseInt(input, 10);
  if (userAnswer === correctAnswer) {
    document.getElementById("feedback").textContent = "";
    correctSound.play();
    updateScore(3);
  } else {
    incorrectSound.play();
    document.getElementById("feedback").textContent = `❌ Incorrect! Correct was ${correctAnswer}`;
    updateScore(-2);
  }

  let pauseDuration = userAnswer === correctAnswer ? 0 : 2200;

  clearInterval(timer); // Pause the timer

  setTimeout(() => {
    getRandomQuestion();           // Show next question
    startTimer();                  // Resume timer
  }, pauseDuration); 

}

function endGame() {
  document.getElementById("question").textContent = "⏰ Time's up!";
  document.getElementById("submit-btn").disabled = true;
  document.getElementById("answer-input").disabled = true;
  document.getElementById("feedback").textContent += ` Final Score: ${score}`;
  document.getElementById("score").style.display = "none";
  document.getElementById("restart-btn").style.display = "inline-block";


  // Show high score board after a short pause (optional polish)
  setTimeout(() => {
    if (window.currentPlayer) {
      saveHighScore(window.currentPlayer, score);
      showHighScores(window.currentPlayer.level);
    }
  }, 1000); // 1 second pause before showing the leaderboard
}

function startTimer() {
  clearInterval(timer); // Prevent multiple timers
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = `Time Left: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame();
    }
  }, 1000);
}

document.getElementById("submit-btn").addEventListener("click", checkAnswer);

document.getElementById("start-btn").addEventListener("click", () => {
  const playerName = document.getElementById("player-name").value.trim();
  const selectedTime = parseInt(document.getElementById("time-select").value);
  const selectedLevel = document.getElementById("level-select").value;

  if (!playerName) {
    alert("Please enter your name!");
    return;
  }

  const levelText = selectedLevel.toUpperCase();
  const levelIndicator = document.getElementById("level-indicator");
  levelIndicator.textContent = `Level: ${levelText}`;
  levelIndicator.className = "level-badge level-" + selectedLevel;

  document.getElementById("timer").textContent = `Time Left: ${selectedTime}s`;

  document.getElementById("setup").style.display = "none";
  document.getElementById("high-score-board").style.display = "none";
  document.getElementById("game-area").style.display = "block";

  timeLeft = selectedTime;
  score = 0;
  document.getElementById("score").textContent = `Score: ${score}`;
  document.getElementById("score").style.display = "block";
  document.getElementById("submit-btn").disabled = false;
  document.getElementById("answer-input").disabled = false;

  getRandomQuestion();
  startTimer();
  document.getElementById("answer-input").focus();

  // 🔒 Store player name + level for endGame() to access later
  window.currentPlayer = {
    name: playerName,
    level: selectedLevel,
    time: selectedTime
  };
});

document.getElementById("answer-input").addEventListener("keydown", (e) => {
  // Check if the input is focused and game is active if needed
  if (e.key === "Enter" && document.getElementById("game-area").style.display === "block") {
     checkAnswer();
  }
});

document.getElementById("restart-btn").addEventListener("click", () => {
  // Reset state
  score = 0;
  timeLeft = 60;
  document.getElementById("score").textContent = "Score: 0";
  document.getElementById("score").style.display = "block";
  document.getElementById("feedback").textContent = "";
  document.getElementById("answer-input").value = "";
  document.getElementById("submit-btn").disabled = false;
  document.getElementById("answer-input").disabled = false;
  document.getElementById("high-score-board").style.display = "none";
  document.getElementById("restart-btn").style.display = "none";

  // Hide game area, show setup (but not welcome screen!)
  document.getElementById("game-area").style.display = "none";
  document.getElementById("setup").style.display = "block";
});


