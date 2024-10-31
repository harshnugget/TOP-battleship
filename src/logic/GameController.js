class GameController {
  #winner;
  #shotHistory;
  #activePlayer;

  constructor(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
    this.#winner = null;

    this.player1.opponent = player2;
    this.player2.opponent = player1;

    this.#shotHistory = new Map();
    this.#shotHistory.set(player1, { successfulShots: [], missedShots: [] });
    this.#shotHistory.set(player2, { successfulShots: [], missedShots: [] });

    this.#activePlayer = player1;
  }

  get winner() {
    return this.#winner;
  }

  get activePlayer() {
    return this.#activePlayer;
  }

  get shotHistory() {
    return new Map(this.#shotHistory);
  }

  gameIsReady() {
    if (this.#winner !== null) {
      throw Error('A winner has been declared! Start a new game.');
    }

    [this.player1, this.player2].every((player) =>
      player.ships.every((ship) => {
        try {
          return ship.coordinates.length > 0;
        } catch (error) {
          throw Error(`All ships must be have valid coordinates.`);
        }
      })
    );
  }

  switchTurn() {
    this.#activePlayer = this.#activePlayer === this.player1 ? this.player2 : this.player1;
  }

  attack(coordinates) {
    try {
      this.gameIsReady();
    } catch (error) {
      throw Error(`Cannot attack until game is ready to begin.`, { cause: error });
    }

    let successfulShot;
    const activePlayer = this.#activePlayer;

    try {
      successfulShot = activePlayer.attack(coordinates);

      if (successfulShot === true) {
        console.log(
          `${activePlayer.name} successfully hit a target at: [${coordinates[0]}, ${coordinates[1]}]`
        );
        this.#shotHistory.get(activePlayer).successfulShots.push(coordinates);
      } else if (successfulShot === false) {
        console.log(
          `${activePlayer.name} missed a target at: [${coordinates[0]}, ${coordinates[1]}]`
        );
        this.#shotHistory.get(activePlayer).missedShots.push(coordinates);
      } else {
        throw Error(
          `activePlayer.attack(coordinates) must return true or false!\nReceived: ${successfulShot}`
        );
      }
    } catch (error) {
      throw Error(`Could not attack this position.`, { cause: error });
    }

    if (this.gameHasWinner()) {
      console.log(`${this.#activePlayer.name} is the winner!`);
    } else {
      this.switchTurn();
    }

    // Return true if successful shot, else false if missed shot
    return successfulShot;
  }

  gameHasWinner() {
    if (this.player1.hasLost() || this.player2.hasLost()) {
      this.#winner = this.#activePlayer;
      return true;
    }

    return false;
  }
}

export default GameController;
