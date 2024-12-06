import Ship from './logic/Ship.js';
import Gameboard from './logic/Gameboard.js';
import Player from './logic/Player.js';
import GameController from './logic/GameController.js';

class Battleship {
  #player1;
  #player2;
  #controller;

  static shipConfig = [
    { type: 'destroyer', length: 2 },
    { type: 'submarine', length: 3 },
    { type: 'cruiser', length: 3 },
    { type: 'battleship', length: 4 },
    { type: 'carrier', length: 5 },
  ];

  static createPlayer = (name, id) => {
    const playerShips = new Map();

    Battleship.shipConfig.forEach(({ type, length }) => {
      const ship = new Ship(length);
      playerShips.set(type, ship);
    });

    const gameboard = new Gameboard(10, [...playerShips.values()]);
    const player = new Player(name, gameboard);

    return { id, ships: playerShips, gameboard, player };
  };

  constructor(player1Name, player2Name) {
    this.#player1 = Battleship.createPlayer(player1Name || 'Player 1', 1);
    this.#player2 = Battleship.createPlayer(player2Name || 'Player 2', 2);

    // Create controller with single-player disabled by default
    this.#controller = new GameController(this.#player1.player, this.#player2.player, false);
  }

  get players() {
    return { player1: this.#player1, player2: this.#player2 };
  }

  get activePlayer() {
    return this.#controller.activePlayer;
  }

  get winner() {
    return this.#controller.winner;
  }

  get gameInProgress() {
    return this.#controller.gameInProgress;
  }

  get singlePlayer() {
    return this.#controller.singlePlayer;
  }

  set singlePlayer(value) {
    if (value === true) {
      this.#controller.singlePlayer = true;
    } else {
      this.#controller.singlePlayer = false;
    }
  }

  startGame() {
    this.#controller.startGame();
  }

  resetGame() {
    this.#controller.resetGame();
  }

  attack(row, col) {
    this.#controller.attack([row, col]);
  }

  getPlayerData(id) {
    if (id === 1) {
      return this.#player1;
    } else if (id === 2) {
      return this.#player2;
    } else {
      throw new Error(`Invalid player ID: ${id}`);
    }
  }

  placeShip(playerId, type, coordinates, orientation) {
    const { ships, gameboard } = this.getPlayerData(playerId);

    try {
      gameboard.placeShip(ships.get(type), coordinates, orientation);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  rotateShip(playerId, type) {
    const { gameboard, ships } = this.getPlayerData(playerId);
    const ship = ships.get(type);

    const coordinates = ship.coordinates;
    const newOrientation = ship.orientation === 'horizontal' ? 'vertical' : 'horizontal';

    try {
      if (coordinates.length > 0) gameboard.placeShip(ship, coordinates[0], newOrientation);
    } catch (error) {
      console.error(error);
    }
  }

  resetShip(playerId, type) {
    const { ships, gameboard } = this.getPlayerData(playerId);
    const ship = ships.get(type);

    gameboard.resetShip(ship);
  }

  placeAllShips(playerId) {
    if (this.gameInProgress || this.winner) {
      return false;
    }

    const { ships, gameboard } = this.getPlayerData(playerId);
    ships.forEach((ship) => {
      gameboard.placeShipRandom(ship);
    });
  }

  resetAllShips(playerId) {
    const { ships, gameboard } = this.getPlayerData(playerId);
    ships.forEach((ship) => {
      gameboard.resetShip(ship);
    });
  }
}

export default Battleship;
