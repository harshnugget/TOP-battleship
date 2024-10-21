class Gameboard {
  #coordinates;
  #missedShots;
  #shipPos;

  constructor(size) {
    this.#coordinates = [];
    this.#missedShots = [];
    this.#shipPos = new Map(); // Keeps track of ship coordinates

    this.createBoard(size); // Initialize a size*size board
  }

  get coordinates() {
    return this.#coordinates.map((row) => row.map((cell) => ({ ...cell })));
  }

  get missedShots() {
    return this.#missedShots.map((shot) => [...shot]);
  }

  get shipPos() {
    return new Map(this.#shipPos);
  }

  createBoard(size) {
    // Validate size (must be a positive integer)
    if (!Number.isInteger(size) || size <= 0) {
      throw new Error('Invalid board size! Must be a positive integer.');
    }

    // Clear current board data
    this.#coordinates = [];
    this.#missedShots = [];
    this.#shipPos.clear();

    // Initialize each coordinate as an object that contains values for a ship and a hit
    for (let row = 0; row < size; row++) {
      this.#coordinates.push([]);
      for (let column = 0; column < size; column++) {
        this.#coordinates[row].push({ ship: null, hit: false });
      }
    }
  }

  validateCoordinates(coordinates) {
    const row = coordinates[0];
    const col = coordinates[1];

    if (
      row < 0 ||
      row > this.#coordinates.length - 1 ||
      col < 0 ||
      col > this.#coordinates[0].length - 1
    ) {
      throw Error('Coordinates out of bounds!');
    }

    if (this.#coordinates[row][col].hit === true) {
      throw Error('These coordinates have already been attacked!');
    }

    if (this.#coordinates[row][col].ship !== null) {
      throw Error('These coordinates are already occupied!');
    }
  }

  placeShip(ship, coordinates, orientation) {
    // Check that the ship isn't already on the board
    if (this.#shipPos.get(ship)) {
      throw Error(
        `This ship already exists on the board! Remove the ship before placing it again.`
      );
    }

    const startRow = coordinates[0];
    const startCol = coordinates[1];
    const validCoordinates = []; // Coordinates the ship will occupy

    const storeValidCoordinates = (row, col) => {
      try {
        this.validateCoordinates([row, col]);
        validCoordinates.push([row, col]);
      } catch (error) {
        throw Error(`Could not place the ship!\n${error.message}`);
      }
    };

    if (orientation === 'horizontal') {
      const endCol = startCol + ship.length;

      // Increment columns until greater than endCol
      for (let currentCol = startCol; currentCol < endCol; currentCol++) {
        storeValidCoordinates(startRow, currentCol);
      }
    } else if (orientation === 'vertical') {
      const endRow = startRow - ship.length;

      // Decrement rows until less than endRow
      for (let currentRow = startRow; currentRow > endRow; currentRow--) {
        storeValidCoordinates(currentRow, startCol);
      }
    } else {
      throw Error('Invalid orientation! Must be either vertical or horizontal');
    }

    // Assign the ship to each validated coordinate
    validCoordinates.forEach(([row, col]) => {
      this.#coordinates[row][col].ship = ship;
    });

    this.#shipPos.set(ship, validCoordinates);
  }

  removeShip(ship) {
    const coordinatesToReset = this.#shipPos.get(ship);

    if (!coordinatesToReset) {
      throw Error('This ship does not exist on the board!');
    }

    coordinatesToReset.forEach(([row, col]) => (this.#coordinates[row][col].ship = null));
    this.#shipPos.delete(ship);
  }

  receiveAttack(coordinates) {
    const row = coordinates[0];
    const col = coordinates[1];
    const ship = this.#coordinates[row][col].ship;

    if (this.#coordinates[row][col].hit === true) {
      throw Error('These coordinates have already been hit!');
    }

    this.#coordinates[row][col].hit = true;

    if (ship !== null) {
      ship.hit();
      return true;
    }

    this.#missedShots.push([row, col]);
    return false;
  }

  allShipsSunk() {
    const ships = Array.from(this.#shipPos.keys());

    if (ships.length === 0) {
      throw Error('Cannot check for sunk ships! There are no ships on the board.');
    }

    // Returns true if all ships are sunk
    return ships.every((ship) => ship.isSunk);
  }
}

export default Gameboard;
