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
      return this.getShipData(key);
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
    const coordinates = this.#gameboard.shipPos.get(ship)?.coordinates || null;
    const orientation = this.#gameboard.shipPos.get(ship)?.orientation || null;

    return {
      type: type,
      length: ship.length,
      hits: ship.hits,
      isSunk: ship.isSunk,
      orientation: orientation,
      coordinates: coordinates,
    };
  }

  placeShip(type, coordinates, orientation = 'horizontal') {
    const ship = this.#ships.get(type);

    this.#gameboard.placeShip(ship, coordinates, orientation);
  }

  placeAllShipsRandom() {
    const placedShips = [];

    [...this.#ships].forEach(([type, ship]) => {
      // Check if the ship already exists on the board
      if (this.getShipData(type).coordinates?.length > 0) {
        return true; // Ship is already placed, continue with the next one
      }

      try {
        // Attempt to place the ship
        this.#gameboard.placeShipRandom(ship);
        placedShips.push(ship);
        return true; // Successfully placed
      } catch (error) {
        console.error(error.message);

        // Roll back any successful placements in this attempt
        placedShips.forEach((placedShip) => this.#gameboard.removeShip(placedShip));
        return false; // Stop further placement attempts
      }
    });
  }

  removeShip(type) {
    const ship = this.#ships.get(type);

    this.#gameboard.removeShip(ship);
  }

  removeAllShips() {
    [...this.#ships.keys()].forEach((type) => {
      const ship = this.getShipData(type);

      if (ship.coordinates?.length > 0) {
        this.removeShip(type);
      }
    });
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

  printBoard() {
    const coords = this.#gameboard.coordinates;

    // Print column headers
    const header = Array.from({ length: coords.length }, (_, i) => i).join(' ');
    console.log('    ' + header); // Adding space for row headers

    // Print each row with row index
    coords.forEach((row, rowIndex) => {
      const rowRepresentation = row
        .map((cell) => {
          if (cell.ship || cell.hit) {
            return cell.ship ? 'X' : 'M'; // 'X' for hit ship, 'M' for missed shot
          } else {
            return 'O'; // 'O' for unhit coordinates
          }
        })
        .join(' ');

      // Print the row index followed by its representation
      console.log(coords.length - rowIndex - 1 + ' | ' + rowRepresentation);
    });
  }
}

export default Player;
