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

  constructor(player1Name, player2Name) {
    this.#players = [
      Battleship.createPlayer(player1Name || 'Player 1', 1),
      Battleship.createPlayer(player2Name || 'Player 2', 2),
    ];

    if (!player2Name) {
      // Singleplayer enabled
      this.#controller = new GameController(this.#players[0].player, this.#players[1].player, true);
    } else {
      // Singleplayer disabled
      this.#controller = new GameController(
        this.#players[0].player,
        this.#players[1].player,
        false
      );
    }
  }

  get players() {
    return { player1: this.#players[0].player, player2: this.#players[1].player };
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

  get singleplayer() {
    return this.#controller.singleplayer;
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

  getPlayerId(player) {
    return this.#players.find((p) => p.player === player).id;
  }

  getPlayerData(id) {
    const player = this.#players[id - 1];
    if (!player) throw new Error(`Invalid player ID: ${id}`);

    return player;
  }

  placeShip(playerId, type, coordinates, orientation) {
    const { ships, gameboard } = this.getPlayerData(playerId);

    try {
      gameboard.placeShip(ships[type].ship, coordinates, orientation);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  rotateShip(playerId, type) {
    const { gameboard, ships } = this.getPlayerData(playerId);
    const ship = ships[type].ship;

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
    const ship = ships[type].ship;

    gameboard.resetShip(ship);
  }

  placeAllShips(playerId) {
    if (this.gameInProgress || this.winner) {
      return false;
    }

    const { ships, gameboard } = this.getPlayerData(playerId);
    Object.values(ships).forEach(({ ship }) => {
      gameboard.placeShipRandom(ship);
    });
  }

  resetAllShips(playerId) {
    const { ships, gameboard } = this.getPlayerData(playerId);
    Object.values(ships).forEach(({ ship }) => {
      gameboard.resetShip(ship);
    });
  }
}

export default Battleship;
