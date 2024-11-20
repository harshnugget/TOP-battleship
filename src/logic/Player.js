class Player {
  #opponent;
  #gameboard;

  constructor(name, gameboard) {
    this.name = name;
    this.#opponent = null;
    this.#gameboard = gameboard;
    this.hits = [];
    this.misses = [];
    this.potentialTargets = [];

    // Populate potential targets
    this.#gameboard.coordinates.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => this.potentialTargets.push([rowIndex, colIndex]));
    });
  }

  set opponent(player) {
    if (!(player instanceof Player)) {
      throw Error('Opponent must be an instance of Player.');
    }

    this.#opponent = player;
  }

  get opponent() {
    return this.#opponent;
  }

  get gameboard() {
    return this.#gameboard;
  }

  attack([row, col]) {
    row = Number(row);
    col = Number(col);

    const hit = this.#opponent.receiveAttack([row, col]);

    if (hit) {
      this.hits.push([row, col]);
    } else {
      this.misses.push([row, col]);
    }

    // Remove this coordinate from potential targets
    const index = this.potentialTargets.findIndex((coord) => coord[0] === row && coord[1] === col);

    this.potentialTargets.splice(index, 1);

    return hit;
  }

  getGuess() {
    const getAdjacentCoords = ([row, col]) => {
      const top = [row - 1, col];
      const bottom = [row + 1, col];
      const right = [row, col + 1];
      const left = [row, col - 1];

      // Validate bounds
      [top, bottom, right, left].forEach((coord) => {
        const valid = coord.every((pos) => pos >= 0 && pos < this.#gameboard.size);

        if (!valid) {
          coord.length = 0;
        }
      });

      return { top, bottom, right, left };
    };

    const coordInArray = ([row, col], coordinatesArray) => {
      return coordinatesArray.some(([r, c]) => {
        return r === row && c === col;
      });
    };

    const getRandomCoordinate = (coordinatesArray) => {
      return coordinatesArray[Math.floor(Math.random() * coordinatesArray.length)];
    };

    const targets = []; // Stores unattacked targets adjacent to an attacked ship cell
    let priorityTarget = false; // Flag for if a valuable target to attack is found

    for (let i = 0; i < this.hits.length && priorityTarget === false; i++) {
      const [row, col] = this.hits[i];
      const { top, bottom, right, left } = getAdjacentCoords([row, col]);
      const pairs = [
        [top, bottom], // Vertical
        [right, left], // Horizontal
      ];

      for (const pair of pairs) {
        const unattackedTargets = [];

        // Store any unattacked pairs
        pair.forEach((pair) => {
          if (pair.length > 0) {
            if (coordInArray(pair, this.potentialTargets)) {
              unattackedTargets.push(pair);
            }
          }
        });

        if (unattackedTargets.length === 2) {
          targets.push(unattackedTargets[0], unattackedTargets[1]);
        } else if (unattackedTargets.length === 1) {
          // Get the pair member attacked
          const attackedTarget = unattackedTargets[0] === pair[0] ? pair[1] : pair[0];

          // If the pair member is an attacked ship, set it as the only target and set priority flag to true
          if (coordInArray(attackedTarget, this.hits)) {
            targets.length = 0;
            targets.push(unattackedTargets[0]);
            priorityTarget = true;
            break;
          } else {
            // Else if the pair member is not an attacked ship, add the unattacked pair member to targets
            targets.push(unattackedTargets[0]);
          }
        }
      }
    }

    if (targets.length > 0) {
      return getRandomCoordinate(targets);
    } else {
      return getRandomCoordinate(this.potentialTargets);
    }
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
    this.hits.length = 0;
    this.misses.length = 0;
    this.potentialTargets.length = 0;

    // Populate potential targets
    this.#gameboard.coordinates.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => this.potentialTargets.push([rowIndex, colIndex]));
    });
  }

  printBoard(title = '', hideShips = false) {
    this.#gameboard.printBoard(`${title}` || `${this.name} Board:`, hideShips);
  }
}

export default Player;
