class Player {
  #opponent;
  #gameboard;

  constructor(name, gameboard) {
    this.name = name;
    this.#opponent = null;
    this.#gameboard = gameboard;
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

  attack([row, col]) {
    return this.#opponent.receiveAttack([row, col]);
  }

  receiveAttack([row, col]) {
    return this.#gameboard.receiveAttack([row, col]);
  }

  hasLost() {
    return this.#gameboard.allShipsSunk();
  }

  allShipsPlaced() {
    return this.#gameboard.allShipsPlaced();
  }

  reset() {
    this.#gameboard.resetBoard();

    this.#opponent = null;
  }

  printBoard(title = '') {
    this.#gameboard.printBoard(title || this.name);
  }
}

export default Player;
