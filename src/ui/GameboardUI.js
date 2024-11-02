/* This function creates an element for displaying the gameboard grid
- Each cell will represent a coordinate (e.g. [3, 4]) on the gameboard */

const createGameboardElement = (cellSize, rows, columns) => {
  const element = document.createElement('div');
  element.classList.add('gameboard');

  element.style.display = 'grid';
  element.style.gridTemplateColumns = `repeat(${columns}, ${cellSize}px)`;
  element.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
  element.style.border = '1px solid black';
  element.style.width = 'max-content';
  element.style.height = 'max-content';
  element.style.gap = '2px';

  const createCellContainer = () => {
    const element = document.createElement('div');
    element.classList.add('cell');
    element.style.border = '1px solid black';
    return element;
  };

  for (let row = rows - 1; row >= 0; row--) {
    for (let col = 0; col < columns; col++) {
      const cellContainer = createCellContainer();
      cellContainer.dataset.row = row;
      cellContainer.dataset.column = col;
      element.append(cellContainer);
    }
  }

  return element;
};

class GameboardUI {
  #parentContainer;
  #cellSize;
  #rows;
  #columns;
  #gameboardElement;

  static cellColours = {
    placeholder: 'grey',
    hit: 'red',
    ship: 'blue',
    hitShip: 'dark-blue',
    empty: '',
  };

  constructor(parentContainer, cellSize = 40, rows = 10, columns = 10) {
    this.#parentContainer = parentContainer;
    this.#cellSize = cellSize;
    this.#rows = rows;
    this.#columns = columns;
    this.#gameboardElement = createGameboardElement(cellSize, rows, columns);
    this.#parentContainer.append(this.#gameboardElement);
  }

  get parentContainer() {
    return this.#parentContainer;
  }

  get cellSize() {
    return this.#cellSize;
  }

  get gameboardElement() {
    return this.#gameboardElement;
  }

  getCell(coordinates) {
    // Return the cell element at specified coordinates
    return this.#gameboardElement.querySelector(
      `[data-row="${coordinates[0]}"][data-column="${coordinates[1]}"]`
    );
  }

  getAllCells() {
    return this.#gameboardElement.querySelectorAll('.cell');
  }

  traverseCells(startCoordinates, orientation, callback, limit = this.#rows * this.#columns) {
    if (limit < 1 || limit > this.#rows * this.#columns) {
      return console.error(`Limit must be between 1 and ${this.#rows * this.#columns}.`);
    }

    const [startRow, startCol] = startCoordinates;

    const cells = [];
    let i = 0;

    if (orientation === 'vertical') {
      // Traverses from top right to bottom left
      for (let col = this.#columns - 1; col >= 0; col--) {
        for (let row = this.#rows - 1; row >= 0; row--) {
          if ((row > startRow && col === startCol) || col > startCol) {
            continue;
          }

          if (i < limit) {
            const cell = this.getCell([row, col]);
            cells.push(cell);
            i++;
          }
        }
      }
    } else if (orientation === 'horizontal') {
      // Traverses from bottom left to top right
      for (let row = 0; row < this.#rows; row++) {
        for (let col = 0; col < this.#columns; col++) {
          if ((col < startCol && row === startRow) || row < startRow) {
            continue;
          }

          if (i < limit) {
            const cell = this.getCell([row, col]);
            cells.push(cell);
            i++;
          }
        }
      }
    } else {
      throw new Error(`Orientation must be "vertical" or "horizontal"`);
    }

    // Apply the callback to each cell
    cells.forEach(callback);
    return cells;
  }

  receiveAttack(coordinates) {
    const cell = this.getCell(coordinates);

    if (cell) {
      cell.classList.add('hit-cell');
    }

    this.updateCells(GameboardUI.cellColours);
    return cell;
  }

  placeShip(coordinates, length, orientation = 'horizontal', remove = false) {
    let cells;

    // Validate ship placement
    if (this.isValidPlacement(coordinates, length, orientation)) {
      cells = this.traverseCells(
        coordinates,
        orientation,
        (cell) => {
          if (remove) {
            cell.classList.remove('ship-cell');
          } else {
            cell.classList.add('ship-cell');
          }
        },
        length
      );
    } else {
      throw new Error('Invalid ship placement');
    }

    this.updateCells(GameboardUI.cellColours);
    return cells;
  }

  shipPlaceholder(coordinates, length, orientation = 'horizontal') {
    let cells;

    // Deselect current placeholders
    const placeholderCells = this.#gameboardElement.querySelectorAll('.cell.placeholder');

    placeholderCells.forEach((cell) => {
      cell.classList.remove('placeholder');
    });

    cells = this.traverseCells(
      coordinates,
      orientation,
      (cell) => {
        cell.classList.add('placeholder');
      },
      length
    );

    this.updateCells(GameboardUI.cellColours);
    return cells;
  }

  isValidPlacement(coordinates, length, orientation) {
    const [row, col] = coordinates;

    // Validate coordinates
    if (row < 0 || row >= this.#rows || col < 0 || col >= this.#columns) {
      return false;
    }

    // Check boundaries based on length and orientation
    switch (orientation) {
      case 'horizontal':
        return col + length <= this.#columns;
      case 'vertical':
        return row - (length - 1) >= 0;
      default:
        return false; // Invalid orientation
    }
  }

  updateCells(colours = { placeholder, hit, ship, hitShip, empty }) {
    const allCells = this.#gameboardElement.querySelectorAll('.cell');

    allCells.forEach((cell) => {
      if (cell.classList.contains('placeholder')) {
        cell.style.backgroundColor = colours.placeholder;
      } else if (cell.classList.contains('ship-cell') && cell.classList.contains('hit-cell')) {
        cell.style.backgroundColor = colours.hitShip;
      } else if (cell.classList.contains('ship-cell')) {
        cell.style.backgroundColor = colours.ship;
      } else if (cell.classList.contains('hit-cell')) {
        cell.style.backgroundColor = colours.hit;
      } else {
        cell.style.backgroundColor = colours.empty;
      }
    });
  }
}

export default GameboardUI;
export { createGameboardElement };
