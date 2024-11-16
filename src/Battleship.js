import Ship from './logic/Ship.js';
import Gameboard from './logic/Gameboard.js';
import Player from './logic/Player.js';
import GameController from './logic/GameController.js';

class Battleship {
  #players;
  #controller;

  static shipConfig = [
    { type: 'destroyer', length: 2 },
    { type: 'submarine', length: 3 },
    { type: 'cruiser', length: 3 },
    { type: 'battleship', length: 4 },
    { type: 'carrier', length: 5 },
  ];

  static createPlayer = (name, id) => {
    const gameboardShips = [];
    const playerShips = {};

    Battleship.shipConfig.forEach(({ type, length }) => {
      const ship = new Ship(length);

      gameboardShips.push(ship);
      playerShips[type] = { ship };
    });

    const gameboard = new Gameboard(10, gameboardShips);
    const player = new Player(name, gameboard);

    return { id, ships: playerShips, gameboard, player };
  };

  constructor(player1Name, player2Name, logMessages = false) {
    this.#players = [
      Battleship.createPlayer(player1Name, 1),
      Battleship.createPlayer(player2Name, 2),
    ];

    this.#controller = new GameController(this.#players[0].player, this.#players[1].player);
    this.logMessages = Boolean(logMessages);
  }

  logMessage(message, level = 'info') {
    if (this.logMessages && message) {
      switch (level) {
        case 'warn':
          console.warn(message);
          break;
        case 'error':
          console.error(message);
          break;
        default:
          console.log(message);
      }
    }
  }

  formatErrorMsg(error) {
    if (!error || !error.message) {
      return 'An unknown error occurred.';
    }

    return `${error.message}${error.cause ? `\n${error.cause.message}` : ''}`;
  }

  prompt() {
    if (this.#controller.gameInProgress === true) {
      this.logMessage(
        `Waiting for Player ${this.getPlayerId(this.#controller.activePlayer)} to attack: `
      );
    } else {
      this.logMessage('Waiting for game to begin.');
    }
  }

  validateAction(action) {
    if (this.#controller.gameInProgress)
      throw Error(`Cannot execute "${action}" while game is in progress!`);
  }

  startGame() {
    try {
      this.validateAction('start game');
      this.#controller.startGame();
      this.logMessage('Game started.');
      this.prompt();
    } catch (error) {
      this.logMessage(this.formatErrorMsg(error), 'error');
    }
  }

  resetGame() {
    try {
      this.validateAction('reset game');
      this.#controller.resetGame();
      this.resetAllShips(1);
      this.resetAllShips(2);
      this.logMessage('Game reset.');
    } catch (error) {
      this.logMessage(this.formatErrorMsg(error), 'error');
    }
  }

  attack(row, col) {
    try {
      const activePlayer = this.#controller.activePlayer;
      const hit = this.#controller.attack([row, col]);
      const message = `Player ${this.getPlayerId(activePlayer)} ${hit ? 'hit' : 'missed'} a target at: [${row}, ${col}]`;
      this.printBoard(1, true);
      this.printBoard(2, true);
      this.logMessage(`${message}`);
    } catch (error) {
      this.logMessage(this.formatErrorMsg(error), 'error');
    }

    if (this.#controller.gameHasWinner()) {
      this.logMessage(`Player ${this.getPlayerId(this.#controller.winner)} has won!`);
    } else {
      this.prompt();
    }
  }

  getPlayerId(player) {
    return this.#players.find((p) => p.player === player).id;
  }

  getPlayerData(id) {
    const player = this.#players[id - 1];
    if (!player) throw new Error(`Invalid player ID: ${id}`);
    return player;
  }

  printBoard(id, hideShips = false) {
    try {
      const { player } = this.getPlayerData(id);
      player.printBoard(`Player ${id} Board:`, hideShips);
    } catch (error) {
      this.logMessage(this.formatErrorMsg(error), 'error');
    }
  }

  placeShip(playerId, type, coordinates, orientation) {
    try {
      this.validateAction('place ship');
      const { ships, gameboard } = this.getPlayerData(playerId);
      gameboard.placeShip(ships[type].ship, coordinates, orientation);
      this.logMessage(`Placed ${type} at [${coordinates[0]}, ${coordinates[1]}]`);
    } catch (error) {
      this.logMessage(this.formatErrorMsg(error), 'error');
    }
  }

  resetShip(playerId, type) {
    try {
      this.validateAction('reset ship');
      const { ships, gameboard } = this.getPlayerData(playerId);
      gameboard.resetShip(ships[type].ship);
      this.logMessage(`Removed ${type} from gameboard.`);
    } catch (error) {
      this.logMessage(this.formatErrorMsg(error), 'error');
    }
  }

  placeAllShips(playerId) {
    try {
      this.validateAction('place all ships');
      const { ships, gameboard } = this.getPlayerData(playerId);
      Object.values(ships).forEach(({ ship }) => {
        gameboard.placeShipRandom(ship);
      });
      this.logMessage(`Placed all ships for Player ${playerId}.`);
    } catch (error) {
      this.logMessage(this.formatErrorMsg(error), 'error');
    }
  }

  resetAllShips(playerId) {
    try {
      this.validateAction('reset all ships');
      const { ships, gameboard } = this.getPlayerData(playerId);
      Object.values(ships).forEach(({ ship }) => {
        gameboard.resetShip(ship);
      });
      this.logMessage(`Reset all ships for Player ${playerId}.`);
    } catch (error) {
      this.logMessage(this.formatErrorMsg(error), 'error');
    }
  }
}

export default Battleship;
