import Battleship from './Battleship.js';
import GameboardUI from './ui/GameboardUI.js';
import ShipUI from './ui/ShipUI.js';

class BattleshipUI extends Battleship {
  static createContainers() {
    const gameboardContainer = document.createElement('div');
    const shipsContainer = document.createElement('div');

    gameboardContainer.classList.add('gameboard-container');
    shipsContainer.classList.add('ships-container');

    return { gameboardContainer, shipsContainer };
  }

  constructor(player1Name, player2Name, logMessages = false) {
    super(player1Name, player2Name, logMessages);

    this.createUI();
  }

  createUI(container = document.body) {
    const player1 = super.getPlayerData(1);
    const player2 = super.getPlayerData(2);

    [player1, player2].forEach((player) => {
      const { gameboardContainer, shipsContainer } = BattleshipUI.createContainers();

      const gameboard = player.gameboard;
      const ships = player.ships;

      const gameboardUI = new GameboardUI(gameboard, gameboardContainer);
      Object.assign(player, { gameboardUI: gameboardUI });

      Object.values(ships).forEach((value) => {
        const shipUI = new ShipUI(value.ship, gameboardUI, shipsContainer);
        Object.assign(value, { shipUI });
      });

      gameboardContainer.append(shipsContainer);
      container.append(gameboardContainer);
    });
  }

  hideShips(playerId, isHidden = true) {
    const { gameboardUI, ships } = this.getPlayerData(playerId);

    gameboardUI.hideShips(isHidden);

    Object.values(ships).forEach(({ shipUI }) => {
      shipUI.hideShip(isHidden);
    });

    this.render();
  }

  startGame() {
    super.startGame();
  }

  resetGame() {
    super.resetGame();
    this.render();
  }

  attack(row, col) {
    super.attack(row, col);
    this.render();
  }

  placeShip(playerId, type, coordinates, orientation) {
    super.placeShip(playerId, type, coordinates, orientation);
    this.render();
  }

  resetShip(playerId, type) {
    super.resetShip(playerId, type);
    this.render();
  }

  placeAllShips(playerId) {
    super.placeAllShips(playerId);
    this.render();
  }

  resetAllShips(playerId) {
    super.resetAllShips(playerId);
    this.render();
  }

  render() {
    const player1 = super.getPlayerData(1);
    const player2 = super.getPlayerData(2);

    [player1, player2].forEach((player) => {
      const ships = player.ships;
      const gameboardUI = player.gameboardUI;

      gameboardUI.render();

      Object.values(ships).forEach(({ shipUI }) => {
        shipUI.render();
      });
    });
  }

  addGameboardEventListeners() {
    const player1 = super.getPlayerData(1);
    const player2 = super.getPlayerData(2);

    [player1, player2].forEach((player) => {
      const { gameboardUI } = player;
      const gameboard = gameboardUI.gameboardElement;
      const cells = gameboardUI.getAllCells();

      // Retrieves the gameboard cell at the location of a click
      const getCell = (event) => {
        const elements = document.elementsFromPoint(event.clientX, event.clientY);

        const cell = elements.find((element) => {
          return element.classList.contains('cell') && element.parentElement === gameboard;
        });

        return cell;
      };

      const attackCell = (cell) => {
        if (super.winner) {
          return console.error('Game has ended! Start a new game.');
        }

        if (player.player !== super.activePlayer && cell) {
          this.attack(cell.dataset.row, cell.dataset.column);
        }
      };

      cells.forEach((cell) => {
        cell.addEventListener('click', (event) => {
          const cell = getCell(event);
          if (cell) {
            attackCell(cell);
          }
        });
      });
    });
  }
}

export default BattleshipUI;
