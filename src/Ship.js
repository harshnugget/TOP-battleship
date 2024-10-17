class Ship {
  #length;

  constructor(length) {
    // Ensure the length is defined, not null, and is a positive integer
    if (length === undefined || length === null || length <= 0 || !Number.isInteger(length)) {
      throw new Error(`Invalid length: ${length}\nMust be a positive integer.`);
    }

    this.#length = length;
    this.hits = 0;
  }

  get length() {
    return this.#length;
  }

  get isSunk() {
    return this.hits >= this.#length;
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
  }
}

export default Ship;
