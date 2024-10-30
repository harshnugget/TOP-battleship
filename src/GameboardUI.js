/* This function creates an element for displaying the gameboard grid
- Each cell will represent a coordinate (e.g. [3, 4]) on the gameboard */

const createGameboardElement = (cellSize, rows, columns) => {
  const element = document.createElement('div');
  element.classList.add('gameboard');

  element.style.display = 'grid';
  element.style.gridTemplateColumns = `repeat(${columns}, ${cellSize}px)`;
  element.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;

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

  getCell(coordinates) {
    // Return the cell element at specified coordinates
    return this.#gameboardElement.querySelector(
      `[data-row="${coordinates[0]}"][data-column="${coordinates[1]}"]`
    );
  }

  traverseCells(startCoordinates, range, orientation, callback) {
    const cells = [];
    let [startRow, startCol] = startCoordinates;

    for (let i = 0; i < range; i++) {
      const currentRow = orientation === 'horizontal' ? startRow : startRow - i;
      const currentCol = orientation === 'horizontal' ? startCol + i : startCol;
      const cell = this.getCell([currentRow, currentCol]);

      if (cell) cells.push(cell);
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

    this.updateCells();
    return cell;
  }

  placeShip(coordinates, length, orientation = 'horizontal', remove = false) {
    let cells;

    // Validate ship placement
    if (this.isValidPlacement(coordinates, length, orientation)) {
      cells = this.traverseCells(coordinates, length, orientation, (cell) => {
        if (remove) {
          cell.classList.remove('ship-cell');
        } else {
          cell.classList.add('ship-cell');
        }
      });
    } else {
      throw new Error('Invalid ship placement');
    }

    this.updateCells();
    return cells;
  }

  shipPlaceholder(coordinates, length, orientation = 'horizontal') {
    let cells;

    // Deselect current placeholders
    const placeholderCells = this.#gameboardElement.querySelectorAll('.cell.placeholder');

    placeholderCells.forEach((cell) => {
      cell.classList.remove('placeholder');
    });

    cells = this.traverseCells(coordinates, length, orientation, (cell) => {
      cell.classList.add('placeholder');
    });

    this.updateCells();
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

  updateCells() {
    const allCells = this.#gameboardElement.querySelectorAll('.cell');

    allCells.forEach((cell) => {
      if (cell.classList.contains('placeholder')) {
        cell.style.backgroundColor = 'grey';
      } else if (cell.classList.contains('ship-cell') && cell.classList.contains('hit-cell')) {
        cell.style.backgroundColor = 'darkblue';
      } else if (cell.classList.contains('ship-cell')) {
        cell.style.backgroundColor = 'blue';
      } else if (cell.classList.contains('hit-cell')) {
        cell.style.backgroundColor = 'red';
      } else {
        cell.style.backgroundColor = '';
      }
    });
  }
}

export default GameboardUI;
