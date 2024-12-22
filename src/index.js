import './style.css';
import Battleship from './logic/Battleship.js';
import BattleshipUI from './ui/BattleshipUI.js';
import GameboardForms from './ui/GameboardForms.js';
import EndGameDialogs from './ui/EndGameDialogs.js';
import randomizeIcon from './img/randomize.svg';
import toggleShowIcon from './img/toggle_show.svg';
import toggleHideIcon from './img/toggle_hide.svg';

const mainContainer = document.querySelector('main');

const logging = false;
const battleship = new Battleship('Player 1', 'Player 2', logging);
const battleshipUI = new BattleshipUI(battleship);

if (logging) {
  window.game = battleship;
  window.gameUI = battleshipUI;
}

battleshipUI.load(mainContainer);

// ######################################################################################

// SELECTORS //

const mainBtns = battleshipUI.buttons.mainBtns;
const p1Btns = battleshipUI.buttons.player1Btns;
const p2Btns = battleshipUI.buttons.player2Btns;

const p1GameboardContainer = document.querySelector('.p1-gameboard-container');
const p2GameboardContainer = document.querySelector('.p2-gameboard-container');

// ######################################################################################

// PLAYER HEADERS

const createPlayerHeader = (playerId) => {
  const className = `p${playerId}-header-container`;
  const gameboardHeaderContainer = document.createElement('div');
  const playerHeader = document.createElement('h3');
  const nameHeader = document.createElement('h3');

  gameboardHeaderContainer.classList.add(className);
  playerHeader.innerText = `Player ${playerId}`;
  playerHeader.classList.add('player-header');
  nameHeader.classList.add('name-header');

  gameboardHeaderContainer.append(playerHeader);
  gameboardHeaderContainer.append(nameHeader);
  return gameboardHeaderContainer;
};

const p1Header = createPlayerHeader(1);
const p2Header = createPlayerHeader(2);

mainContainer.append(p1Header, p2Header);

// ######################################################################################

// FORMS //

const enableSinglePlayer = () => {
  battleship.singlePlayer = true;
  battleshipUI.placeAllShips(2);

  // Hide player 2 ships
  if (!p2Btns.toggle.classList.contains('hide')) {
    p2Btns.toggle.dispatchEvent(new MouseEvent('click'));
  }
};

const disableSinglePlayer = () => {
  battleship.singlePlayer = false;

  // Unhide player 2 ships
  if (p2Btns.toggle.classList.contains('hide')) {
    p2Btns.toggle.dispatchEvent(new MouseEvent('click'));
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
  (args) => {
    if (args.playerId === 1) {
      p1Btns.randomize.click();
      p1Header.querySelector('.name-header').innerText = args.playerName;
    } else {
      p2Btns.randomize.click();
      p2Header.querySelector('.name-header').innerText = args.playerName;
    }
  }
);

// Append player forms to their corresponding gameboard container
gameboardForms.loadP1Form(p1GameboardContainer);
gameboardForms.loadP2Form(p2GameboardContainer);

// Reset button listener for resetting forms, game state and player names
mainBtns.reset.addEventListener('click', () => {
  disableSinglePlayer();
  gameboardForms.formsSubmitted = 0;
  gameboardForms.loadP1Form(p1GameboardContainer);
  gameboardForms.loadP2Form(p2GameboardContainer);
  p1Header.querySelector('.name-header').innerText = '';
  p2Header.querySelector('.name-header').innerText = '';
});

// ######################################################################################

// BUTTON EVENT LISTENERS //

// Start button
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

// Toggle button
[p1Btns, p2Btns].forEach((btns) => {
  const toggleIcon = () => {
    if (btns.toggle.classList.contains('show')) {
      btns.toggle.innerHTML = toggleShowIcon;
    } else {
      btns.toggle.innerHTML = toggleHideIcon;
    }
  };

  btns.randomize.innerHTML = randomizeIcon;
  btns.randomize.innerHTML = randomizeIcon;

  toggleIcon();
  btns.toggle.addEventListener('click', toggleIcon);
});

// ######################################################################################

// END GAME DIALOGS //

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

    // Show ships if winner
    if (p1Btns.toggle.classList.contains('hide')) {
      p1Btns.toggle.disabled = false;
      p1Btns.toggle.click();
    }

    if (p2Btns.toggle.classList.contains('hide')) {
      p2Btns.toggle.disabled = false;
      p2Btns.toggle.click();
    }

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

// ######################################################################################

// SHIP HOVERING //

const toggleHover = (enabled = false) => {
  const toggle = (shipElement, type) => {
    if (enabled === false) {
      shipElement.classList.remove('hover-enabled');
      shipElement.removeAttribute('title');
    } else {
      shipElement.classList.add('hover-enabled');
      shipElement.setAttribute('title', type);
    }
  };

  battleshipUI.player1UI.shipsUI.forEach(({ shipElement }, type) => {
    toggle(shipElement, type);
  });

  battleshipUI.player2UI.shipsUI.forEach(({ shipElement }, type) => {
    toggle(shipElement, type);
  });
};

toggleHover(true);

// Start game listener
const startGameListener = () => {
  const startGameOriginal = battleship.startGame;

  battleship.startGame = function () {
    startGameOriginal.call(this);

    if (this.gameInProgress === true) {
      toggleHover(false);
    }
  };
};

startGameListener();

// Reset button listener for resetting hover
mainBtns.reset.addEventListener('click', () => {
  toggleHover(true);
});

// ######################################################################################

// CELL HOVERING //

const cellHover = () => {
  const p1Gameboard = p1GameboardContainer.querySelector('.gameboard');
  const p2Gameboard = p2GameboardContainer.querySelector('.gameboard');

  p1Gameboard.addEventListener('mouseover', (e) => {
    const activePlayer = battleship.activePlayer;
    const player2 = battleship.getPlayerData(2).player;

    if (battleship.gameInProgress === true && activePlayer === player2) {
      const hoveredCells = document.querySelectorAll('.cell.hover-enabled');
      const cell = e.target.closest('.cell');

      hoveredCells.forEach((cell) => cell.classList.remove('hover-enabled'));

      if (cell) {
        cell.classList.add('hover-enabled');
      }
    }
  });

  p2Gameboard.addEventListener('mouseover', (e) => {
    const activePlayer = battleship.activePlayer;
    const player1 = battleship.getPlayerData(1).player;

    if (battleship.gameInProgress === true && activePlayer === player1) {
      const hoveredCells = document.querySelectorAll('.cell.hover-enabled');
      const cell = e.target.closest('.cell');

      hoveredCells.forEach((cell) => cell.classList.remove('hover-enabled'));

      if (cell) {
        cell.classList.add('hover-enabled');
      }
    }
  });
};

cellHover();
