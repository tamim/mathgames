let score = 0;
let timeLeft = 180;
let timerInterval;
let currentQuestion;
let correctAnswers = 0;
let incorrectAnswers = 0;
let totalAnswered = 0;
let gradeLevel = 3;
let playerName = "";
let showQuitButton = false; // Developer control variable

const positiveFeedback = ["Awesome! 🎉", "Great job! 🌟", "You're a math wizard! 🧙‍♂️", "Fantastic! 👍"];
const negativeFeedback = ["Oops, try again! 😕", "Not quite, give it another shot! 🙁", "Keep practicing! 💪"];

document.getElementById("grade-level").addEventListener("change", function() {
  updateOperationsList();
});

function updateOperationsList() {
  const grade = parseInt(document.getElementById("grade-level").value);
  let operationsList = "Questions will include addition and subtraction";

  if (grade >= 4) {
    operationsList += ", multiplication";
  }

  if (grade >= 5) {
    operationsList += ", division";
  }

  if (grade >= 6) {
    operationsList += ", fractions";
    operationsList += ", and order of operations (BODMAS)";
  }

  document.getElementById("operations-list").textContent = operationsList;
}

document.getElementById("answer").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    checkAnswer();
  }
});

function playSound(type) {
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    if (type === 'correct') {
      oscillator.frequency.value = 660;
      gainNode.gain.value = 0.2;
    } else {
      oscillator.frequency.value = 220;
      gainNode.gain.value = 0.1;
    }
    oscillator.start(0);
    oscillator.stop(context.currentTime + 0.2);
  } catch(e) {
    console.log('Audio playback not supported');
  }
}

function evaluateExpression(expression) {
  expression = expression.replace(/×/g, '*').replace(/÷/g, '/');
  return new Function('return ' + expression)();
}

function generateExpression(complexity) {
  const num1 = Math.floor(Math.random() * (complexity === 'simple' ? 15 : 30)) + 1;
  const num2 = Math.floor(Math.random() * (complexity === 'simple' ? 10 : 20)) + 1;
  const num3 = Math.floor(Math.random() * (complexity === 'simple' ? 10 : 20)) + 1;
  const operations = ['+', '-', '×', '÷'];
  let expression;
  let answer;

  if (complexity === 'simple') {
    const op1 = operations[Math.floor(Math.random() * 2)];
    const op2 = operations[2 + Math.floor(Math.random() * 2)];
    if (op2 === '÷') {
      const divisor = Math.floor(Math.random() * 9) + 2;
      const multiple = Math.floor(Math.random() * 10) + 1;
      const dividend = divisor * multiple;
      expression = `${num1} ${op1} ${dividend} ${op2} ${divisor}`;
    } else {
      expression = `${num1} ${op1} ${num2} ${op2} ${num3}`;
    }
  } else {
    if (Math.random() > 0.5) {
      const op1 = operations[Math.floor(Math.random() * 2)];
      const op2 = operations[Math.floor(Math.random() * 4)];
      const op3 = operations[Math.floor(Math.random() * 4)];
      const num4 = Math.floor(Math.random() * 10) + 1;
      expression = `${num1} ${op1} ${num2} ${op2} ${num3} ${op3} ${num4}`;
    } else {
      const op1 = operations[Math.floor(Math.random() * 4)];
      const op2 = operations[Math.floor(Math.random() * 4)];
      if (Math.random() > 0.5) {
        expression = `(${num1} ${op1} ${num2}) ${op2} ${num3}`;
      } else {
        expression = `${num1} ${op1} (${num2} ${op2} ${num3})`;
      }
    }
  }

  try {
    answer = evaluateExpression(expression);
    if (!Number.isInteger(answer)) {
      answer = Math.round(answer * 100) / 100;
    }
    return { expression, answer };
  } catch (e) {
    return generateExpression(complexity);
  }
}

function generateQuestion() {
  gradeLevel = parseInt(document.getElementById("grade-level").value);
  let operations = ["addition", "subtraction"];

  if (gradeLevel >= 4) {
    operations.push("multiplication");
  }

  if (gradeLevel >= 5) {
    operations.push("division");
    operations.push("fractions");
    operations.push("bodmas-simple");
    if (Math.random() > 0.7) {
      operations.push("bodmas-medium");
    }
  }

  const operation = operations[Math.floor(Math.random() * operations.length)];
  let num1, num2, num3;

  switch (operation) {
    case "addition":
      const addMax = gradeLevel === 3 ? 50 : (gradeLevel === 4 ? 100 : 1000);
      num1 = Math.floor(Math.random() * addMax) + 1;
      num2 = Math.floor(Math.random() * addMax) + 1;
      currentQuestion = {
        text: `${num1} + ${num2} = ?`,
        answer: num1 + num2
      };
      break;

    case "subtraction":
      if (gradeLevel === 3) {
        num1 = Math.floor(Math.random() * 50) + 26;
        num2 = Math.floor(Math.random() * 25) + 1;
      } else {
        const subMax = gradeLevel === 4 ? 100 : 1000;
        num1 = Math.floor(Math.random() * subMax) + 1;
        num2 = Math.floor(Math.random() * subMax) + 1;
      }
      currentQuestion = {
        text: `${num1} - ${num2} = ?`,
        answer: num1 - num2
      };
      break;

    case "multiplication":
      if (gradeLevel === 4) {
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
      } else {
        num1 = Math.floor(Math.random() * 90) + 10;
        num2 = Math.floor(Math.random() * 9) + 1;
      }
      currentQuestion = {
        text: `${num1} × ${num2} = ?`,
        answer: num1 * num2
      };
      break;

    case "division":
      if (Math.random() > 0.7) {
        num1 = Math.floor(Math.random() * 100) + 1;
        num2 = Math.floor(Math.random() * 9) + 2;
        let result = num1 / num2;
        currentQuestion = {
          text: `${num1} ÷ ${num2} = ? (Round to 2 decimal places)`,
          answer: Math.round(result * 100) / 100
        };
      } else {
        num2 = Math.floor(Math.random() * 9) + 2;
        num3 = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * num3;
        currentQuestion = {
          text: `${num1} ÷ ${num2} = ?`,
          answer: num3
        };
      }
      break;

    case "fractions":
      const denominators = [2, 3, 4, 5, 6, 8, 10];
      const denominator = denominators[Math.floor(Math.random() * denominators.length)];
      if (Math.random() > 0.5) {
        num1 = Math.floor(Math.random() * 50) + 10;
        const numerator = Math.floor(Math.random() * (denominator - 1)) + 1;
        currentQuestion = {
          text: `${numerator}/${denominator} of ${num1} = ?`,
          answer: (num1 * numerator) / denominator
        };
      } else {
        const numerator = Math.floor(Math.random() * (denominator - 1)) + 1;
        const decimal = Math.round((numerator / denominator) * 100) / 100;
        currentQuestion = {
          text: `Convert ${numerator}/${denominator} to a decimal.`,
          answer: decimal
        };
      }
      break;

    case "bodmas-simple":
      const result = generateExpression('simple');
      currentQuestion = {
        text: `Calculate: ${result.expression} = ?`,
        answer: result.answer
      };
      break;

    case "bodmas-medium":
      const mediumResult = generateExpression('medium');
      currentQuestion = {
        text: `Calculate: ${mediumResult.expression} = ?`,
        answer: mediumResult.answer
      };
      break;
  }

  const questionEl = document.getElementById("question");
  questionEl.textContent = currentQuestion.text;
  questionEl.classList.add("fade-in");
  setTimeout(() => {
    questionEl.classList.remove("fade-in");
  }, 500);
}

function startGame() {
  playerName = document.getElementById("player-name").value.trim();
  if (!playerName) {
    playerName = "Player";
  }

  score = 0;
  timeLeft = 180;
  correctAnswers = 0;
  incorrectAnswers = 0;
  totalAnswered = 0;

  document.getElementById("score").textContent = score;
  document.getElementById("timer").textContent = "3:00";
  document.getElementById("feedback").textContent = "";
  document.getElementById("feedback").className = "feedback";
  document.getElementById("answer").value = "";

  document.getElementById("intro-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
  document.getElementById("result-screen").style.display = "none";

  generateQuestion();
  document.getElementById("answer").focus();

  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);

  // Control the visibility of the quit button
  if (showQuitButton) {
    document.getElementById("quit-button").style.display = "block";
  } else {
    document.getElementById("quit-button").style.display = "none";
  }
}

function resetGame() {
  document.getElementById("result-screen").style.display = "none";
  document.getElementById("intro-screen").style.display = "block";
}

function updateTimer() {
  timeLeft--;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById("timer").textContent =
    `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  if (timeLeft <= 0) {
    endGame();
  }
}

function checkAnswer() {
  const userInput = document.getElementById("answer").value;
  const userAnswer = parseFloat(userInput);
  const feedback = document.getElementById("feedback");

  if (userInput === "" || isNaN(userAnswer)) {
    feedback.textContent = "Please enter a number!";
    feedback.className = "feedback incorrect";
    return;
  }

  totalAnswered++;
  let isCorrect = false;

  if (currentQuestion.text.includes("decimal") || currentQuestion.text.includes("Round to") || !Number.isInteger(currentQuestion.answer)) {
    isCorrect = Math.abs(userAnswer - currentQuestion.answer) < 0.01;
  } else {
    isCorrect = userAnswer === currentQuestion.answer;
  }

  if (isCorrect) {
    score += 3;
    correctAnswers++;
    const msg = positiveFeedback[Math.floor(Math.random() * positiveFeedback.length)];
    feedback.textContent = msg + " +3 points";
    feedback.className = "feedback correct";
    playSound('correct');
  } else {
    score = score - 1;
    incorrectAnswers++;
    let correctAnswer = currentQuestion.answer;
    if (typeof correctAnswer === "number" && !Number.isInteger(correctAnswer)) {
      correctAnswer = correctAnswer.toFixed(2);
    }
    const msg = negativeFeedback[Math.floor(Math.random() * negativeFeedback.length)];
    feedback.textContent = msg + " -1 point. The answer was " + correctAnswer + ".";
    feedback.className = "feedback incorrect";
    playSound('incorrect');
  }

  document.getElementById("score").textContent = score;
  document.getElementById("answer").value = "";
  document.getElementById("answer").focus();

  generateQuestion();
}

function endGame() {
  clearInterval(timerInterval);

  document.getElementById("final-score").textContent = score;
  document.getElementById("correct-count").textContent = correctAnswers;
  document.getElementById("incorrect-count").textContent = incorrectAnswers;
  document.getElementById("total-count").textContent = totalAnswered;

  const accuracy = totalAnswered > 0 ?
    Math.round((correctAnswers / totalAnswered) * 100) : 0;
  document.getElementById("accuracy").textContent = `${accuracy}%`;

  const congratsMessageEl = document.getElementById("congrats-message");
  if(score >= 30) {
    congratsMessageEl.textContent = `${playerName}, you're a Math Genius! 🎓`;
  } else if(score >= 10) {
    congratsMessageEl.textContent = `Great job, ${playerName}! Keep practicing! 👍`;
  } else {
    congratsMessageEl.textContent = `Don't worry, ${playerName}, practice makes perfect! 😊`;
  }

  document.getElementById("game-screen").style.display = "none";
  document.getElementById("result-screen").style.display = "block";
}

function quitGame() {
  clearInterval(timerInterval);
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("intro-screen").style.display = "block";

  score = 0;
  timeLeft = 180;
  correctAnswers = 0;
  incorrectAnswers = 0;
  totalAnswered = 0;
  document.getElementById("score").textContent = 0;
  document.getElementById("timer").textContent = "3:00";
}
