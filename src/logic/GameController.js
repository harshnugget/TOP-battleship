class GameController {
  #player1;
  #player2;
  #winner;
  #activePlayer;
  #gameInProgress;

  constructor(player1, player2, singlePlayer = true, logger = true) {
    this.#player1 = player1;
    this.#player2 = player2;
    this.#activePlayer;
    this.#winner;
    this.#gameInProgress;

    this.singlePlayer = singlePlayer;
    this.logger = logger;

    this.initialize();
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

  initialize() {
    this.#player1.reset();
    this.#player2.reset();
    this.#player1.opponent = this.#player2;
    this.#player2.opponent = this.#player1;
    this.#winner = null;
    this.#activePlayer = this.#player1;
    this.#gameInProgress = false;

    if (this.singlePlayer) {
      const player2Gameboard = this.#player2.gameboard;
      const player2Ships = player2Gameboard.ships;

      player2Ships.forEach((ship) => player2Gameboard.placeShipRandom(ship));
    }
  }

  logMessage(message, level = 'info') {
    if (this.logger && message) {
      switch (level) {
        case 'warn':
          console.warn(message);
          break;
        case 'error':
          console.error(message);
          break;
        default:
          console.log(message);
      }
    }
  }

  resetGame() {
    this.initialize();
    this.logMessage('Game reset');
  }

  startGame() {
    if (this.#winner) {
      this.logMessage(`Game has a winner! Start a new game.`, 'warn');
      return false;
    }

    const allShipsPlaced = [this.#player1, this.#player2].every((player) => {
      return player.allShipsPlaced();
    });

    if (allShipsPlaced === false) {
      this.logMessage('Cannot start game until all ships are placed.', 'warn');
      return false;
    }

    this.#gameInProgress = true;

    this.logMessage('Game started');
    return true;
  }

  switchTurn() {
    this.#activePlayer = this.#activePlayer === this.#player1 ? this.#player2 : this.#player1;

    if (this.#activePlayer === this.#player1) {
      this.logMessage(`Switched turn. Waiting for Player 1 to attack...`);
    } else {
      this.logMessage(`Switched turn. Waiting for Player 2 to attack...`);
    }
  }

  attack([row, col]) {
    try {
      if (this.#winner) {
        this.logMessage('Game has a winner. Start a new game.', 'warn');
        return false;
      }

      if (!this.gameInProgress) {
        this.logMessage('Cannot attack until game has started.', 'warn');
        return false;
      }

      const playerId = this.#activePlayer === this.#player1 ? 1 : 2;
      const hit = this.#activePlayer.attack([row, col]);

      if (this.logger) {
        this.printBoard(this.#player1, true);
        this.printBoard(this.#player2, true);
      }

      if (hit) {
        this.logMessage(`Player ${playerId} hit a target at: [${row}, ${col}].`);
      } else {
        this.logMessage(`Player ${playerId} missed a target at: [${row}, ${col}].`);
      }

      if (!this.gameHasWinner()) this.switchTurn();

      if (this.singlePlayer && this.#activePlayer !== this.#player1) {
        this.guess();
      }

      return true;
    } catch (error) {
      this.logMessage(`Could not attack this position.\nCause: ${error.message}`, 'error');
      return false;
    }
  }

  guess() {
    const [row, col] = this.activePlayer.getGuess();
    this.attack([row, col]);
  }

  gameHasWinner() {
    if (this.#player1.hasLost()) {
      this.#winner = this.#player2;
      this.logMessage(`Player 2 has won!`);
    } else if (this.#player2.hasLost()) {
      this.#winner = this.#player1;
      this.logMessage(`Player 1 has won!`);
    } else {
      return false;
    }

    this.#gameInProgress = false;

    return true;
  }

  printBoard(player, hideShips = false) {
    if (player === this.#player1) {
      this.#player1.printBoard(`Player 1 Board:`, hideShips);
    } else if (player === this.#player2) {
      this.#player2.printBoard(`Player 2 Board:`, hideShips);
    } else {
      this.logMessage('Cannot print board.\nCause: Invalid player.', 'error');
    }
  }
}

export default GameController;
