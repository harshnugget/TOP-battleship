class GameController {
  #player1;
  #player2;
  #winner;
  #activePlayer;
  #gameInProgress;

  constructor(player1, player2) {
    this.#player1 = player1;
    this.#player2 = player2;

    this.#player1.opponent = player2;
    this.#player2.opponent = player1;

    this.#activePlayer = player1;

    this.#winner = null;
    this.#gameInProgress = false;
  }

  get players() {
    return { player1: this.#player1, player2: this.#player2 };
  }

  get winner() {
    return this.#winner;
  }

  get activePlayer() {
    return this.#activePlayer;
  }

  get gameInProgress() {
    return this.#gameInProgress;
  }

  resetGame() {
    this.#player1.reset();
    this.#player2.reset();
    this.#player1.opponent = this.player2;
    this.#player2.opponent = this.player1;
    this.#winner = null;
    this.#activePlayer = this.player1;
    this.#gameInProgress = false;
  }

  startGame() {
    if (this.#winner) {
      throw Error(`Game has a winner! Start a new game.`);
    }

    const allShipsPlaced = [this.#player1, this.#player2].every((player) => {
      return player.allShipsPlaced();
    });

    if (allShipsPlaced === false) {
      throw Error('Cannot start game until all ships are placed.');
    }

    this.#gameInProgress = true;
  }

  switchTurn() {
    this.#activePlayer = this.#activePlayer === this.#player1 ? this.#player2 : this.#player1;
  }

  attack([row, col]) {
    try {
      if (this.#winner) {
        throw Error('Game has a winner!');
      }

      if (!this.gameInProgress) {
        throw new Error('Game has not started.');
      }

      const hit = this.#activePlayer.attack([row, col]);
      if (!this.gameHasWinner()) this.switchTurn();

      return hit;
    } catch (error) {
      throw Error('Could not attack this position.', { cause: error });
    }
  }

  guess() {
    const [row, col] = this.activePlayer.getGuess();
    this.attack([row, col]);
  }

  gameHasWinner() {
    if (this.#player1.hasLost()) {
      this.#winner = this.#player2;
    } else if (this.#player2.hasLost()) {
      this.#winner = this.#player1;
    } else {
      return false;
    }

    this.#gameInProgress = false; // Stop the game
    return true;
  }
}

export default GameController;
