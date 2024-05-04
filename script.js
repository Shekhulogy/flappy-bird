const bird = document.getElementById("bird");
let pipeContainer = document.getElementById("pipe-container");
let ground = document.getElementById("ground");
let scoreElement = document.getElementById("score");
let gameContainer = document.getElementById("game-container");
let gameOverContainer = document.getElementById("game-over");
let restart = document.getElementById("restart-button");
let crashAudio = document.getElementById("jumpSound");
let bgmAudio = document.getElementById("bgm-audio");
let volumeBtn = document.getElementById("volume");
let muteBtn = document.getElementById("volume-mute");
muteBtn.style.display = "none";
let gravity = 0.4;
let velocity = 0;
let jumpStrength = -3.5;
let jumpFlag = false;
let gameStarted = false;
let groundPosition = 0;
let pipeInterval;
let pipes = [];
let score = 0;
let isGameOver = false;
let bgmAudioOn = true;

volumeBtn.addEventListener("click", () => {
  let volumeOn = document.getElementById("volume-on");
  if (muteBtn.style.display === "none") {
    muteBtn.style.display = "block";
    volumeOn.style.display = "none";
    bgmAudio.pause();
    bgmAudioOn = false;
  } else {
    muteBtn.style.display = "none";
    volumeOn.style.display = "block";
    bgmAudio.currentTime = 0;
    bgmAudio.play();
    bgmAudioOn = true;
  }
});

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    if (!gameStarted) {
      startGame();
    }

    if (isGameOver) {
      restartGame();
    }
    jumpFlag = true;
  }
});

gameContainer.addEventListener("click", () => {
  if (!gameStarted) {
    startGame();
  }
  jumpFlag = true;
});

function startGame() {
  gameStarted = true;
  bird.style.top = "50%"; // Initialize bird position
  pipeInterval = setInterval(createPipe, 3500); // Create a new pipe every 3.5 seconds
  if (muteBtn.style.display === "none") {
    bgmAudio.currentTime = 0;
    bgmAudio.play();
  }

  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  if (!gameStarted) {
    return; // Exit game loop if game not started
  }

  velocity += gravity;
  bird.style.top = parseFloat(bird.style.top) + velocity + "px";

  if (jumpFlag) {
    velocity = jumpStrength;
    jumpFlag = false;
  }

  if (parseFloat(bird.style.top) + bird.offsetHeight >= 580) {
    gameOver();
    crashAudio.play();
    bgmAudio.pause();
    return; // Exit game loop
  }

  movePipes();
  moveGround();
  checkScore(); // Check for score increase

  if (checkCollision()) {
    gameOver();
    crashAudio.play();
    bgmAudio.pause();
    return; // Exit game loop
  }

  requestAnimationFrame(gameLoop);
}

function moveGround() {
  groundPosition -= 1; // Move the ground to the left
  ground.style.backgroundPositionX = groundPosition + "px";
}

function createPipe() {
  let pipeGap = 150; // Gap between upper and lower pipes
  let minHeight = 100; // Minimum height for the upper pipe
  let maxHeight = 300; // Maximum height for the upper pipe
  let pipeHeight =
    Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight; // Random height for the upper pipe

  // Create upper pipe
  let upperPipe = document.createElement("div");
  upperPipe.classList.add("pipe");
  upperPipe.classList.add("upper-pipe");
  upperPipe.style.left = "400px";
  upperPipe.style.top = "0";
  upperPipe.style.height = pipeHeight + "px";
  pipeContainer.appendChild(upperPipe);

  // Create lower pipe
  let lowerPipe = document.createElement("div");
  lowerPipe.classList.add("pipe");
  lowerPipe.classList.add("lower-pipe");
  lowerPipe.style.left = "400px";
  lowerPipe.style.top = pipeHeight + pipeGap + "px"; // Position below the upper pipe
  lowerPipe.style.height = 600 - pipeHeight - pipeGap + "px"; // Adjust height to fill remaining space
  pipeContainer.appendChild(lowerPipe);

  pipes.push({ upper: upperPipe, lower: lowerPipe, scored: false });
}

function movePipes() {
  pipes.forEach(function (pipe) {
    pipe.upper.style.left = parseFloat(pipe.upper.style.left) - 1 + "px";
    pipe.lower.style.left = parseFloat(pipe.lower.style.left) - 1 + "px";
  });

  if (pipes.length > 0 && parseFloat(pipes[0].upper.style.left) < -60) {
    pipes.shift(); // Remove the first pipe pair if it's out of view
  }
}

function checkCollision() {
  let birdRect = bird.getBoundingClientRect();
  for (let i = 0; i < pipes.length; i++) {
    let pipe = pipes[i];
    let lowerPipeRect = pipe.lower.getBoundingClientRect();
    let upperPipeRect = pipe.upper.getBoundingClientRect();
    if (
      birdRect.bottom >= lowerPipeRect.top &&
      birdRect.top <= lowerPipeRect.bottom &&
      birdRect.right >= lowerPipeRect.left &&
      birdRect.left <= lowerPipeRect.right
    ) {
      return true;
    }

    if (
      birdRect.bottom >= upperPipeRect.top &&
      birdRect.top <= upperPipeRect.bottom &&
      birdRect.right >= upperPipeRect.left &&
      birdRect.left <= upperPipeRect.right
    ) {
      return true;
    }
  }
  return false;
}

function checkScore() {
  if (
    pipes.length > 0 &&
    parseFloat(pipes[0].upper.style.left) < bird.offsetLeft &&
    !pipes[0].scored
  ) {
    pipes[0].scored = true;
    score++;
    scoreElement.innerHTML = score;
  }
}

function gameOver() {
  gameOverContainer.style.display = "block";
  isGameOver = true;
}

let restartGame = () => {
  clearInterval(pipeInterval);
  velocity = 0;
  bird.style.top = "50%";
  pipes.forEach(function (pipe) {
    pipe.upper.remove();
    pipe.lower.remove();
  });
  pipes = [];
  score = 0;
  scoreElement.innerHTML = score;
  gameOverContainer.style.display = "none";
  gameStarted = false;
  isGameOver = false;
};

restart.addEventListener("click", (event) => {
  if (gameStarted) {
    restartGame();
  }

  event.preventDefault();
});

// gameContainer.addEventListener("dblclick", () => {
//   restartGame();
// });
