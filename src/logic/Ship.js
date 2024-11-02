class Ship {
  #length;
  #coordinates;
  #orientation;

  constructor(length) {
    // Ensure the length is defined, not null, and is a positive integer
    if (length === undefined || length === null || length <= 0 || !Number.isInteger(length)) {
      throw new Error(`Invalid length: ${length}\nMust be a positive integer.`);
    }

    this.#length = length;
    this.#coordinates = [];
    this.#orientation = 'horizontal';
    this.hits = 0;
  }

  get length() {
    return this.#length;
  }

  get isSunk() {
    return this.hits >= this.#length;
  }

  get coordinates() {
    return this.#coordinates;
  }

  get orientation() {
    return this.#orientation;
  }

  set coordinates(coordinates) {
    if (coordinates.length !== this.#length) {
      throw new Error(
        `Coordinates range does not match ship length!\nCoordinates: ${coordinates}\nCoordinates range: ${coordinates.length}\nShip length: ${this.#length}`
      );
    }

    this.#coordinates = coordinates;
  }

  set orientation(orientation) {
    if (orientation !== 'horizontal' && orientation !== 'vertical') {
      throw new Error(`Invalid orientation! Orientation must be "vertical" or "horizontal"`);
    }

    this.#orientation = orientation;
  }

  hit() {
    // Prevent hitting a ship that is already sunk
    if (this.isSunk) {
      throw new Error('Cannot hit a ship that is already sunk!');
    }

    this.hits++;
  }

  reset() {
    this.hits = 0;
    this.#coordinates = [];
    this.#orientation = 'horizontal';
  }
}

export default Ship;
