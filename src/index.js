import './style.css';
import Battleship from './Battleship.js';
import BattleshipUI from './BattleshipUI.js';
import GameboardForms from './ui/GameboardForms.js';

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

  // Hide ships
  if (!p2Btns.toggle.classList.contains('hide')) {
    p2Btns.toggle.dispatchEvent(new MouseEvent('click'));
  }
};

const disableSinglePlayerFunc = () => {
  battleship.singlePlayer = false;
  battleshipUI.resetAllShips(2);

  // Unhide ships
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

createForms.loadP1Form(p1GameboardContainer);
createForms.loadP2Form(p2GameboardContainer);

// Reset button listener for resetting forms and game state
mainBtns.reset.addEventListener('click', () => {
  createForms.disableSinglePlayer();
  createForms.loadP1Form(p1GameboardContainer);
  createForms.loadP2Form(p2GameboardContainer);
});
