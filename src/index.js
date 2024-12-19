import './style.css';
import Battleship from './Battleship.js';
import BattleshipUI from './BattleshipUI.js';
import GameboardForms from './ui/GameboardForms.js';
import EndGameDialogs from './ui/EndGameDialogs.js';

const battleship = new Battleship('Player 1');
const battleshipUI = new BattleshipUI(battleship);
window.game = battleship;
window.gameUI = battleshipUI;

battleshipUI.load(document.querySelector('main'));

// ######################################################################################

const mainBtns = battleshipUI.buttons.mainBtns;
const p1Btns = battleshipUI.buttons.player1Btns;
const p2Btns = battleshipUI.buttons.player2Btns;

const p1GameboardContainer = document.querySelector('.p1-gameboard-container');
const p2GameboardContainer = document.querySelector('.p2-gameboard-container');

const enableSinglePlayerFunc = () => {
  battleship.singlePlayer = true;
  battleshipUI.placeAllShips(2);

  // Hide player 2 ships
  if (!p2Btns.toggle.classList.contains('hide')) {
    p2Btns.toggle.dispatchEvent(new MouseEvent('click'));
  }
};

const disableSinglePlayerFunc = () => {
  battleship.singlePlayer = false;
  battleshipUI.resetAllShips(2);

  // Unhide player 2 ships
  if (p2Btns.toggle.classList.contains('hide')) {
    p2Btns.toggle.dispatchEvent(new MouseEvent('click'));
  }
};

const createForms = new GameboardForms(
  {
    mainBtns: [mainBtns.start, mainBtns.reset],
    p1Btns: [p1Btns.randomize, p1Btns.toggle],
    p2Btns: [p2Btns.randomize, p2Btns.toggle],
  },
  enableSinglePlayerFunc,
  disableSinglePlayerFunc
);

// Append player forms to their corresponding gameboard container
createForms.loadP1Form(p1GameboardContainer);
createForms.loadP2Form(p2GameboardContainer);

// Reset button listener for resetting forms and game state
mainBtns.reset.addEventListener('click', () => {
  createForms.disableSinglePlayer();
  createForms.loadP1Form(p1GameboardContainer);
  createForms.loadP2Form(p2GameboardContainer);
});

// ######################################################################################

// Start button alert
mainBtns.start.addEventListener('click', (e) => {
  if (
    !(
      battleship.players.player1.player.allShipsPlaced() &&
      battleship.players.player2.player.allShipsPlaced()
    )
  ) {
    alert('All ships must be placed before the game can begin.');
  }

  // Disable the start and randomize buttons if game has started
  if (battleship.gameInProgress === true) {
    e.target.disabled = true;
    battleshipUI.buttons.player1Btns.randomize.disabled = true;
    battleshipUI.buttons.player2Btns.randomize.disabled = true;
  }
});

// ######################################################################################

const endGameDialogs = new EndGameDialogs(p1GameboardContainer, p2GameboardContainer);

function attackListener() {
  // Create a new attack function to mimic battleship.attack
  const originalAttackFunc = battleship.attack;

  const player1 = battleship.getPlayerData(1);
  const player2 = battleship.getPlayerData(2);

  battleship.attack = function (row, col) {
    // Call the attack function mimic in the context of battleship
    originalAttackFunc.call(this, row, col);

    const winner = battleship.winner;

    if (winner === player1.player) {
      endGameDialogs.show(1);
    } else if (winner === player2.player) {
      endGameDialogs.show(2);
    } else {
      return; // Return if no winner
    }

    // Force show ships if winner
    battleshipUI.hideShips(1, false);
    battleshipUI.hideShips(2, false);

    // Disable toggle buttons if winner
    p1Btns.toggle.disabled = true;
    p2Btns.toggle.disabled = true;
  };
}

// Activate listener
attackListener();

// Reset button listener for resetting dialogs
mainBtns.reset.addEventListener('click', () => {
  endGameDialogs.hide();
});
