/************* Vars ***************/
var alreadyInitialized = false;
var position = [];
var head = [15, 7];
var length = 4;
var newDirectionTry;
var direction = 'right';
var movement;
var movementLog = [];
var drawingX, drawingY;
var food;
var hasEaten = false;
var isThereFood = false;
var hasTurned = false;
var score = 0;
var highScore = 0;
var restarting = false;
var snakeAlive = true;
var soundEffect = true;
var specialEffect = false;
var randomEffect;

function opposite(direzione) {
  switch (direzione) {
    case 'up':
      return 'down';
      break;
    case 'down':
      return 'up';
    case 'left':
      return 'right';
      break;
    case 'right':
      return 'left';
      break;
    default:
      return -1;
  }
}

/******** What if mobile? *********/

function checkIfMobile() {
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    mobileRedAlert();
  } else {
    return;
  }

}

function mobileRedAlert() {
  document.querySelector('.play-button').style.display = 'none';
  document.querySelector('#main-wrapper img').style.display = 'none';
  document.querySelector('.game-frame').style.border = 'border: 5px solid var(--red)';
  document.querySelector('.game-frame').style.color = 'var(--red)';
  document.querySelector('.game-frame').innerHTML = 'It seems that your using a mobile device! Unfortunately, to this day this game is only available on PCs.';
}

/******** Audio stuff *********/

function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function () {
    this.sound.play();
  }
  this.stop = function () {
    this.sound.pause();
  }
}

var audio = new Audio('snakeMedia/music.mp3');
window.onload = audio.play();

var eatSound = new sound('snakeMedia/soundEffects/eatSound1.mp3');

var deathSounds = [
  deathSound1 = new sound('snakeMedia/soundEffects/deathSound1.mp3'),
  deathSound2 = new sound('snakeMedia/soundEffects/deathSound2.mp3'),
  deathSound3 = new sound('snakeMedia/soundEffects/deathSound3.mp3'),
];

var highScoreSound = new sound('snakeMedia/soundEffects/highScoreSound1.mp3');

function playNewHGsound() {
  highScoreSound.play();
}

/******* Event listeners *******/

document.querySelector('.play-button').addEventListener('click', initializeGame);

function addFunctionToNewBtn() {
  document.querySelector('.option-btn').removeEventListener('click', initializeGame);
  document.querySelector('.option-btn').addEventListener('click', showOptions);
}

function addFunctionToResume() {
  if (restarting) {
    return;
  }
  document.querySelector('#resume').addEventListener('click', unshowOptions);
}

function addOrientationChangerListener() {
  // prevent the page from scrolling
  window.addEventListener("keydown", function (e) {
    // space and arrow keys
    if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
      e.preventDefault();
    }
  }, false);

  document.addEventListener('keydown', function (e) {
    changeDirection(e);
  })
}

// DOESNT WORK DO TO PROBLEMS DETECTING ESCAPE KEY
// function addEscEventListener() {
//   document.addEventListener('keypress', function (e) {
//     console.log(e);
//     if (e.key === "0") {
//       unshowOptions();
//     }
//   });
// }

document.querySelector("input[name=checkbox]").addEventListener('change', function () {
  if (this.checked) {
    // reactivate music
    audio.play();
  } else {
    // deactivate music
    audio.pause();
  }
});


/**********************************
 ************* General ************
 **********************************/

console.log('Welcome player!\nPls do not resize this window, i ask you kindly. I didnt give a shit about responsivness\nThank you and have fun :D\n(Yes i know you\'re most likely not reading this but ok)');

function changeOptionBtn() {
  document.querySelector('.play-button').innerHTML = 'Options';
  document.querySelector('.play-button').classList.add('option-btn');
  document.querySelector('#resume').innerHTML = 'Resume';
  addFunctionToNewBtn();
}

function showOptions() {
  clearInterval(movement);
  document.querySelector('.play-button').style.display = 'none';
  document.querySelector('#main-wrapper img').style.display = 'none';
  document.querySelector('.game-frame').classList.toggle('options-panel');
  document.querySelector('#main-wrapper').style.position = 'relative';
  document.querySelector('#main-wrapper').style.left = '-100px';
  document.querySelector('#main-wrapper').style.width = '2100px';
  document.querySelector('table').style.display = 'none';
  addOptionTable();
  displayScore();
  displayHighScore();
  console.log('Show options executed');
}

function addOptionTable() {
  document.querySelector('#option-table').style.display = 'flex';
  addFunctionToResume();
  // addEscEventListener();
}

function unshowOptions() {
  setMovement();
  document.querySelector('.play-button').style.display = 'unset';
  document.querySelector('#main-wrapper img').style.display = 'unset';
  document.querySelector('.game-frame').classList.toggle('options-panel');
  document.querySelector('#main-wrapper').style.position = 'unset';
  document.querySelector('#main-wrapper').style.left = 'unset';
  document.querySelector('#main-wrapper').style.width = 'unset';
  document.querySelector('table').style.display = 'table';
  removeOptionTable();
  console.log('Unshow options executed');
}

function removeOptionTable() {
  document.querySelector('#option-table').style.display = 'none';
}

function displayScore() {
  document.querySelector('#score').innerHTML = Math.round((score + Number.EPSILON) * 10) / 10;
}

function displayHighScore() {
  document.querySelector('#highScore').innerHTML = Math.round((highScore + Number.EPSILON) * 10) / 10;
}


/**********************************
 ************** Game **************
 **********************************/

function initializeGame() {
  changeOptionBtn();
  document.querySelector('.game-frame').style.display = 'block';
  checkIfMobile();
  window.scrollTo(0, 450);

  if (alreadyInitialized) {
    return;
  }

  initializeTable();
  displayInitialSnake();
  addOrientationChangerListener();
  setMovement();
  startFoodManager();

  alreadyInitialized = true;
}

function initializeTable() {
  var gameFrame = document.querySelector('.game-frame');
  var table = document.createElement('table');
  var tbody = document.createElement('tbody');
  for (let i = 0; i < 20; i++) {
    var tr = document.createElement('tr');
    for (let k = 0; k < 20; k++) {
      var td = document.createElement('td');
      td.classList.add(`x${i}`);
      td.classList.add(`y${k}`);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  gameFrame.appendChild(table);
}

function displayInitialSnake() {
  for (let i = 0; i < 4; i++) {
    move();
  }
}

function setMovement() {
  movement = setInterval(move, 600);
}

function move() {
  // move the head
  switch (direction) {
    case 'right':
      checkDeath(head[0], head[1] + 1);
      if (!snakeAlive) {
        return;
      }
      checkIfEating(head[0], head[1] + 1);
      document.querySelector(`.x${head[0]}.y${parseInt(`${head[1]}`, 10) + 1}`).style.background = 'var(--contrast)';
      head = [head[0], head[1] + 1];
      movementLog.push('right');
      break;
    case 'left':
      checkDeath(head[0], head[1] - 1);
      if (!snakeAlive) {
        return;
      }
      checkIfEating(head[0], head[1] - 1);
      document.querySelector(`.x${head[0]}.y${parseInt(`${head[1]}`, 10) - 1}`).style.background = 'var(--contrast)';
      head = [head[0], head[1] - 1];
      movementLog.push('left');
      break;
    case 'up':
      checkDeath(head[0] - 1, head[1]);
      if (!snakeAlive) {
        return;
      }
      checkIfEating(head[0] - 1, head[1]);
      document.querySelector(`.x${parseInt(`${head[0]}`, 10) - 1}.y${head[1]}`).style.background = 'var(--contrast)';
      head = [head[0] - 1, head[1]];
      movementLog.push('up');
      break;
    case 'down':
      checkDeath(head[0] + 1, head[1]);
      if (!snakeAlive) {
        return;
      }
      checkIfEating(head[0] + 1, head[1]);
      document.querySelector(`.x${parseInt(`${head[0]}`, 10) + 1}.y${head[1]}`).style.background = 'var(--contrast)';
      head = [head[0] + 1, head[1]];
      movementLog.push('down');
      break;
    default:
      return -1;
      break;
  }

  clearTable();
  adjustMovementLog();
  drawTail();
  adjustScore();

  console.log('moved', `--${direction}`);
}

function clearTable() {
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 20; j++) {
      if (!restarting) {
        if (document.querySelector(`.x${i}.y${j}`).classList.contains('hasFood') ||
          document.querySelector(`.x${i}.y${j}`).style.background === 'var(--contrast)') {
          continue;
        }
      }

      document.querySelector(`.x${i}.y${j}`).style.background = 'unset';
      document.querySelector(`.x${i}.y${j}`).classList.remove('hasFood');
    }
  }

  if (restarting) {
    restarting = false;
  }
}

function drawTail() {
  drawingX = head[0];
  drawingY = head[1];
  for (let i = movementLog.length - 1; i > -1; i--) {
    switch (movementLog[i]) {
      case 'right':
        drawingY--;
        break;
      case 'left':
        drawingY++;
        break;
      case 'up':
        drawingX++;
        break;
      case 'down':
        drawingX--;
        break;
      default:
        return -1;
        break;
    }

    document.querySelector(`.x${drawingX}.y${drawingY}`).style.background = 'var(--main-green)';
  }
}

function adjustMovementLog() {
  if (movementLog.length > length) {
    movementLog.shift();
  }
}

function changeDirection(newDir) {
  switch (newDir.keyCode) {
    // up
    case 38:
    case 87:
      newDirectionTry = 'up';
      break;

      // left
    case 37:
    case 65:
      newDirectionTry = 'left';
      break;

      // down
    case 40:
    case 83:
      newDirectionTry = 'down';
      break;

      // right
    case 39:
    case 68:
      newDirectionTry = 'right';
      break;
    default:
      return -1;
  }

  // check if valid
  if (newDirectionTry === direction) {
    console.log('Already moving that way');
    return;
  } else if (newDirectionTry === opposite(movementLog[movementLog.length - 1])) {
    console.log('Can\'t move backwards!');
    return;
  }

  direction = newDirectionTry;
  hasTurned = true;
  console.log(newDir);
}

function startFoodManager() {
  food = setInterval(foodManager, 3300);
}

function foodManager() {
  // skip if there is already food 
  if (isThereFood) {
    return;
  }

  do {
    var randomX = Math.floor(Math.random() * 20);
    var randomY = Math.floor(Math.random() * 20);

    if (document.querySelector(`.x${randomX}.y${randomY}`).style.background === 'unset') {
      document.querySelector(`.x${randomX}.y${randomY}`).classList.toggle('hasFood');
      isThereFood = true;
      console.log(`Food has spawned at ${randomX}, ${randomY}`);
    }

  } while (!isThereFood)
}

function checkIfEating(localX, localY) {
  if (document.querySelector(`.x${localX}.y${localY}`).classList.contains('hasFood')) {
    document.querySelector(`.x${localX}.y${localY}`).classList.remove('hasFood');
    length++;
    isThereFood = false;
    hasEaten = true;
    score += length * 2 / 3;
    eatSound.play();
    console.log('The snake has eaten!');
  }
}

function checkDeath(hX, hY) {
  if (document.querySelector(`.x${hX}.y${hY}`) === null) {
    deathOccurred();
  } else if (document.querySelector(`.x${hX}.y${hY}`).style.background === 'var(--main-green)') {
    deathOccurred();
  } else {
    return 0;
  }
}

function deathOccurred() {
  console.log('Snake is dead');

  // randomize effect
  randomEffect = Math.floor(Math.random() * (Math.floor(51) - Math.ceil(0))) + Math.ceil(0);
  if (randomEffect > 46) {
    deathSounds[2].play();
    specialEffect = true;
  } else if (randomEffect > 40) {
    deathSounds[1].play();
  } else {
    deathSounds[0].play();
  }

  snakeAlive = false;
  gameEnded();
}

function adjustScore() {
  if (hasTurned) {
    score += length * 5 / 3;
    hasTurned = false;
  } else {
    score += length;
  }
}

function gameEnded() {
  clearInterval(movement);
  clearInterval(food);
  document.querySelector('#resume').innerHTML = 'Game over! - Play again';
  document.querySelector('#resume').addEventListener('click', restart);
  if (score > highScore) {
    highScore = score;
    
    if (specialEffect) {
      setTimeout(playNewHGsound, 2000);
      specialEffect = false;
    } else {
      setTimeout(playNewHGsound, 1000);
    }
    
    document.querySelector('#highScore-name').innerHTML = 'New high score!';
  }
  showOptions();
}

function restart() {
  restarting = true;
  head = [15, 7];
  length = 4;
  direction = 'right';
  movementLog = [];
  hasEaten = false;
  hasTurned = false;
  snakeAlive = true;
  isThereFood = false;
  score = 0;
  clearTable();
  displayInitialSnake();
  document.querySelector('#resume').innerHTML = 'Resume';
  document.querySelector('#resume').removeEventListener('click', restart);
  document.querySelector('#highScore-name').innerHTML = 'High score:';
  startFoodManager();
}