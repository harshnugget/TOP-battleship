import Gameboard from './Gameboard.js';
import Ship from './Ship.js';

class Player {
  #opponent;
  #gameboard;
  #ships;

  static defaultShipConfig = [
    { type: 'destroyer', length: 2 },
    { type: 'submarine', length: 3 },
    { type: 'cruiser', length: 3 },
    { type: 'battleship', length: 4 },
    { type: 'carrier', length: 5 },
  ];

  constructor(name, shipConfig = Player.defaultShipConfig) {
    this.name = name;
    this.#opponent = null;
    this.#gameboard = new Gameboard(10);
    this.#ships = new Map();

    this.initializeShips(shipConfig);
  }

  set opponent(player) {
    if (!(player instanceof Player)) {
      throw Error('Opponent must be an instance of Player.');
    }

    this.#opponent = player;
  }

  get opponent() {
    return this.#opponent ? this.#opponent.name : null;
  }

  get ships() {
    return Array.from(this.#ships.keys()).map((key) => {
      const shipObj = this.#ships.get(key);
      const coords = this.#gameboard.shipPos.get(shipObj) || null;
      return { type: key, coords };
    });
  }

  initializeShips(shipConfig) {
    // Clear any existing ships
    this.#ships.clear();

    shipConfig.forEach((ship) => {
      const { type, length } = ship;
      this.#ships.set(type, new Ship(length));
    });
  }

  getShipData(type) {
    const ship = this.#ships.get(type);
    const coordinates = this.#gameboard.shipPos.get(ship) || null;

    return {
      type: type,
      length: ship.length,
      hits: ship.hits,
      isSunk: ship.isSunk,
      coordinates: coordinates,
    };
  }

  placeShip(type, coordinates, orientation = 'horizontal') {
    const ship = this.#ships.get(type);

    this.#gameboard.placeShip(ship, coordinates, orientation);
  }

  removeShip(type) {
    const ship = this.#ships.get(type);

    this.#gameboard.removeShip(ship);
  }

  attack(coordinates) {
    return this.#opponent.#gameboard.receiveAttack(coordinates);
  }

  hasLost() {
    return this.#gameboard.allShipsSunk();
  }

  reset() {
    // Reset the gameboard
    const boardSize = this.#gameboard.coordinates.length;
    this.#gameboard.createBoard(boardSize);

    // Reset opponent
    this.#opponent = null;

    // Reset ships to defaults
    this.#ships.forEach((ship) => {
      ship.reset();
    });
  }
}

export default Player;
