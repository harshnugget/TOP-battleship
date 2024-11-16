class Gameboard {
  #size;
  #coordinates;

  constructor(size, ships = []) {
    this.#size = size;
    this.#coordinates = [];
    this.ships = ships;

    // Validate size (must be a positive integer)
    if (!Number.isInteger(size) || size <= 0) {
      throw new Error('Invalid board size! Must be a positive integer.');
    }

    // Initialize each coordinate as an object (cell) that contains values for a ship and a hit
    for (let row = 0; row < size; row++) {
      this.#coordinates.push([]);
      for (let column = 0; column < size; column++) {
        this.#coordinates[row].push({ ship: null, hit: false });
      }
    }
  }

  get size() {
    return this.#size;
  }

  get coordinates() {
    // Return a deep copy of the coordinates array
    return this.#coordinates.map((row) => row.map((cell) => ({ ...cell })));
  }

  resetBoard() {
    // Reset each ship to its default values
    this.ships.forEach((ship) => ship.reset());

    // Reset each coordinate/cell to its default values
    this.#coordinates.forEach((row) => {
      row.forEach((col) => {
        col.ship = null;
        col.hit = null;
      });
    });
  }

  isWithinBoundsAt([row, col]) {
    const gameboardSize = this.#size;

    return row >= 0 && row < gameboardSize && col >= 0 && col < gameboardSize;
  }

  isHitAt([row, col]) {
    return this.#coordinates[row][col].hit === true;
  }

  isEmptyAt([row, col]) {
    return this.#coordinates[row][col].ship === null;
  }

  hasShip(ship) {
    return !this.ships.includes(ship);
  }

  placeShip(ship, [row, col], orientation) {
    const validCoordinates = []; // Coordinates the ship will occupy

    // Reset the ship before placing
    this.resetShip(ship);

    const validateCoordinates = ([row, col]) => {
      if (!this.isWithinBoundsAt([row, col])) {
        throw new Error('Could not place the ship!\nThese coordinates are out of bounds.');
      }

      if (this.isHitAt([row, col])) {
        throw new Error('Could not place the ship!\nThese coordinates already been attacked.');
      }

      if (!this.isEmptyAt([row, col])) {
        throw new Error('Could not place the ship!\nThese coordinates are already occupied.');
      }
    };

    if (orientation === 'horizontal') {
      const endCol = col + ship.length;

      // Increment columns until greater than endCol
      for (let currentCol = col; currentCol < endCol; currentCol++) {
        validateCoordinates([row, currentCol]);
        validCoordinates.push([row, currentCol]);
      }
    } else if (orientation === 'vertical') {
      const endRow = row - ship.length;

      // Decrement rows until less than endRow
      for (let currentRow = row; currentRow > endRow; currentRow--) {
        validateCoordinates([currentRow, col]);
        validCoordinates.push([currentRow, col]);
      }
    } else {
      throw new Error(
        `Invalid orientation: ${orientation}\nMust be either "vertical" or "horizontal"`
      );
    }

    // Add the ship to the ships array if it doesn't already exist
    if (this.hasShip(ship)) {
      this.ships.push(ship);
    }

    // Assign the ship to each validated coordinate
    validCoordinates.forEach(([row, col]) => {
      this.#coordinates[row][col].ship = ship;
    });

    ship.orientation = orientation;
    ship.coordinates = validCoordinates;
  }

  resetShip(ship) {
    const coordinates = ship.coordinates;

    if (coordinates?.length > 0) {
      // Reset gameboard coordinates, occupied by the ship, to defaults
      coordinates.forEach((coord) => {
        const [row, col] = coord;
        this.#coordinates[row][col].ship = null;
        this.#coordinates[row][col].hit = false;
      });
    }

    ship.reset();
  }

  receiveAttack([row, col]) {
    if (!this.isWithinBoundsAt([row, col])) {
      throw new RangeError('These coordinates are out of bounds!');
    }

    if (this.isHitAt([row, col])) {
      throw new Error('These coordinates have already been attacked!');
    }

    const ship = this.#coordinates[row][col].ship;

    this.#coordinates[row][col].hit = true;

    if (ship !== null) {
      ship.hit();
      return true; // Return true if a ship was hit
    }

    return false; // Return false if a ship was not hit
  }

  allShipsPlaced() {
    // Flatten the coordinates array
    const flatCoordinates = this.#coordinates.flat();

    // Extract only the ships in the coordinates array
    const placedShips = flatCoordinates
      .filter(({ ship }) => ship !== null) // Filter coordinates with non-null ships
      .map(({ ship }) => ship); // Map only the ship object

    return this.ships.every((ship) => placedShips.includes(ship));
  }

  allShipsSunk() {
    const ships = this.ships;

    if (ships.length === 0) {
      throw new Error('Cannot check for sunk ships!\nThere are no ships on the board.');
    }

    // Returns true if all ships are sunk
    return ships.every((ship) => ship.isSunk);
  }

  placeShipRandom(ship) {
    const unoccupiedCoords = [];

    this.#coordinates.forEach((row, rowIndex) => {
      row.forEach((_, colIndex) => {
        // Check that the cell has no ship and hasn't been hit
        if (this.isEmptyAt([rowIndex, colIndex]) && !this.isHitAt([rowIndex, colIndex])) {
          unoccupiedCoords.push([rowIndex, colIndex]);
        }
      });
    });

    // Helper function to attempt placing the ship at a coordinate with a randomly selected orientation
    const attemptPlacement = (coords) => {
      const orientations = ['vertical', 'horizontal'];
      let randomOrientation = orientations[Math.floor(Math.random() * orientations.length)];

      for (let i = 0; i < orientations.length; i++) {
        try {
          this.placeShip(ship, coords, randomOrientation);
          return true; // Successfully placed the ship
        } catch {
          // Switch the orientation
          randomOrientation = randomOrientation === 'vertical' ? 'horizontal' : 'vertical';
        }
      }

      return false; // Could not place the ship
    };

    // Try placing the ship at random unoccupied coordinates
    while (unoccupiedCoords.length > 0) {
      const randomIndex = Math.floor(Math.random() * unoccupiedCoords.length);
      const randomCoord = unoccupiedCoords[randomIndex];

      if (!attemptPlacement(randomCoord)) {
        // Remove the coordinate from unoccupied coordinates
        unoccupiedCoords.splice(randomIndex, 1);
      } else {
        return true;
      }
    }

    // No valid placement was found
    throw new Error('Could not place the ship!\nNo valid coordinates could be found.');
  }

  // Represent the current state of the board
  printBoard(title = '', hideShips = false) {
    if (title) {
      console.log(`${title}`);
    }

    // Characters for representing cells
    const emptyCell = '-';
    const shipCell = 'S';
    const hitCell = 'H';
    const missCell = 'M';

    for (let i = this.#size - 1; i >= 0; i--) {
      let string = `Row ${i}:`.padEnd(10);
      for (let j = 0; j < this.#size; j++) {
        if (this.coordinates[i][j].hit === true && this.coordinates[i][j].ship !== null) {
          string += `| ${hitCell} |`;
        } else if (this.coordinates[i][j].hit === true) {
          string += `| ${missCell} |`;
        } else if (this.coordinates[i][j].ship !== null && hideShips === false) {
          string += `| ${shipCell} |`;
        } else {
          string += `| ${emptyCell} |`;
        }
      }
      console.log(string);
    }
  }
}

export default Gameboard;
