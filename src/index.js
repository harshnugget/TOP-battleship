import './style.css';
import Battleship from './logic/Battleship.js';
import BattleshipUI from './ui/BattleshipUI.js';
import GameboardForms from './ui/GameboardForms.js';
import EndGameDialogs from './ui/EndGameDialogs.js';
import randomizeIcon from './img/randomize.svg';
import toggleShowIcon from './img/toggle_show.svg';
import toggleHideIcon from './img/toggle_hide.svg';
import cellHover from './ui/cellHover.js';
import shipHover from './ui/shipHover.js';
import createPlayerHeaders from './ui/createPlayerHeader.js';

// Enable logging to view game in console
const logging = true;
const battleship = new Battleship('Player 1', 'Player 2', logging);
const battleshipUI = new BattleshipUI(battleship);

if (logging) {
  window.game = battleship;
  window.gameUI = battleshipUI;
}

const mainContainer = document.querySelector('main');
battleshipUI.load(mainContainer);

// ######################################################################################

// METHOD HANDLERS //
// Additional logic to be added to task lists

const startGameHandler = { func: battleship.startGame, taskList: [] };
const resetGameHandler = { func: battleship.resetGame, taskList: [] };
const attackHandler = { func: battleship.attack, taskList: [] };

const executeTasks = (taskList) => {
  taskList.forEach((func) => {
    if (typeof func === 'function') {
      func();
    } else {
      throw Error('Task lists must only contain functions.');
    }
  });
};

battleship.startGame = function () {
  if (startGameHandler.func.call(this)) {
    executeTasks(startGameHandler.taskList);
  } else {
    alert('All player ships must be placed before the game can begin!');
  }
};

battleship.resetGame = function () {
  battleship.singlePlayer = false;
  resetGameHandler.func.call(this);
  executeTasks(resetGameHandler.taskList);
};

battleship.attack = function (row, col) {
  attackHandler.func.call(this, row, col);
  executeTasks(attackHandler.taskList);
};

// ######################################################################################

// BUTTONS //

const mainBtns = battleshipUI.buttons.mainBtns;
const p1Btns = battleshipUI.buttons.player1Btns;
const p2Btns = battleshipUI.buttons.player2Btns;

const enableSinglePlayer = () => {
  // Hide player 2 ships
  if (!p2Btns.toggle.classList.contains('hide')) {
    p2Btns.toggle.disabled = false;
    p2Btns.toggle.click();
    p2Btns.toggle.disabled = true;
  }

  battleship.singlePlayer = true;
  battleshipUI.placeAllShips(2);
};

const disableSinglePlayer = () => {
  // Unhide player 2 ships
  if (p2Btns.toggle.classList.contains('hide')) {
    p2Btns.toggle.disabled = false;
    p2Btns.toggle.click();
    p2Btns.toggle.disabled = true;
  }

  battleship.singlePlayer = false;
};

// Icons for player buttons
[p1Btns, p2Btns].forEach((btns) => {
  const updateToggleIcon = () => {
    btns.toggle.innerHTML = btns.toggle.classList.contains('show')
      ? toggleShowIcon
      : toggleHideIcon;
  };

  updateToggleIcon(); // Set the initial toggle icon

  btns.randomize.innerHTML = randomizeIcon; // Set randomize icon
  btns.toggle.addEventListener('click', updateToggleIcon); // Add event listener for toggle icon switching
});

// Disable the start and randomize buttons if game has started
startGameHandler.taskList.push(() => {
  mainBtns.start.disabled = true;
  p1Btns.randomize.disabled = true;
  p2Btns.randomize.disabled = true;
});

// ######################################################################################

// PLAYER HEADERS

const { player1: p1Header, player2: p2Header } = createPlayerHeaders();
mainContainer.append(p1Header, p2Header);

resetGameHandler.taskList.push(() => {
  p1Header.querySelector('.name-header').innerText = '';
  p2Header.querySelector('.name-header').innerText = '';
});

// ######################################################################################

// FORMS //

const p1GameboardContainer = document.querySelector('.p1-gameboard-container');
const p2GameboardContainer = document.querySelector('.p2-gameboard-container');

const onSubmit = (args) => {
  // Randomly place player ships on form submit
  if (args.playerId === 1) {
    p1Btns.randomize.click();
    p1Header.querySelector('.name-header').innerText = args.playerName;
  } else {
    p2Btns.randomize.click();
    p2Header.querySelector('.name-header').innerText = args.playerName;
  }
};

const gameboardForms = new GameboardForms(
  {
    mainBtns: [mainBtns.start, mainBtns.reset],
    p1Btns: [p1Btns.randomize, p1Btns.toggle],
    p2Btns: [p2Btns.randomize, p2Btns.toggle],
  },
  enableSinglePlayer,
  disableSinglePlayer,
  onSubmit
);

// Append player forms to their corresponding gameboard container
gameboardForms.loadP1Form(p1GameboardContainer);
gameboardForms.loadP2Form(p2GameboardContainer);

// Resetting forms and game state
resetGameHandler.taskList.push(() => {
  disableSinglePlayer();
  gameboardForms.reload();
});

// ######################################################################################

// END GAME DIALOGS //

const endGameDialogs = new EndGameDialogs(p1GameboardContainer, p2GameboardContainer);

attackHandler.taskList.push(() => {
  const player1 = battleship.getPlayerData(1);
  const player2 = battleship.getPlayerData(2);
  const winner = battleship.winner;

  // Show dialogs if winner
  if (winner === player1.player) {
    endGameDialogs.show(1);
  } else if (winner === player2.player) {
    endGameDialogs.show(2);
  } else {
    return; // Return if no winner
  }

  // Show ships if winner
  if (p1Btns.toggle.classList.contains('hide')) {
    p1Btns.toggle.disabled = false;
    p1Btns.toggle.click();
  }

  if (p2Btns.toggle.classList.contains('hide')) {
    p2Btns.toggle.disabled = false;
    p2Btns.toggle.click();
  }

  p1Btns.toggle.disabled = true;
  p2Btns.toggle.disabled = true;
});

// Hide dialogs on game reset
resetGameHandler.taskList.push(() => {
  endGameDialogs.hide();
});

// ######################################################################################

// SHIP HOVERING //

const shipHoverEffects = shipHover(battleshipUI.player1UI.shipsUI, battleshipUI.player2UI.shipsUI);
shipHoverEffects.enable();

startGameHandler.taskList.push(() => {
  shipHoverEffects.disable();
});

// Reset ship hover effects on reset
resetGameHandler.taskList.push(() => {
  shipHoverEffects.enable();
});

// ######################################################################################

// CELL HOVERING //

const cellHoverEffects = cellHover(p1GameboardContainer, p2GameboardContainer, 'cell');

const toggleHoverEffects = () => {
  if (battleship.activePlayer.id === 1) {
    cellHoverEffects.enable(2);
    cellHoverEffects.disable(1);
  }

  if (battleship.activePlayer.id === 2) {
    cellHoverEffects.enable(1);
    cellHoverEffects.disable(2);
  }
};

startGameHandler.taskList.push(() => {
  toggleHoverEffects();
});

resetGameHandler.taskList.push(() => {
  cellHoverEffects.disable(1);
  cellHoverEffects.disable(2);
});

attackHandler.taskList.push(() => {
  toggleHoverEffects();
});
