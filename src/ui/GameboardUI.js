/* This function creates an element for displaying the gameboard grid
- Each cell will represent a coordinate (e.g. [3, 4]) on the gameboard */

const createGameboardElement = (size) => {
  const cellSize = 40;
  const element = document.createElement('div');
  element.classList.add('gameboard');

  element.style.display = 'grid';
  element.style.gridTemplateColumns = `repeat(${size}, ${cellSize}px)`;
  element.style.gridTemplateRows = `repeat(${size}, ${cellSize}px)`;
  element.style.border = '1px solid black';
  element.style.width = 'max-content';
  element.style.height = 'max-content';
  element.style.gap = '1px';

  const createCellContainer = () => {
    const element = document.createElement('div');
    element.classList.add('cell');
    element.style.border = '1px solid black';
    return element;
  };

  for (let row = size - 1; row >= 0; row--) {
    for (let col = 0; col < size; col++) {
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
  #gameboardElement;
  #gameboard;

  constructor(gameboard, parentContainer) {
    this.#parentContainer = parentContainer;
    this.#gameboardElement = createGameboardElement(gameboard.size);
    this.#parentContainer.append(this.#gameboardElement);
    this.#gameboard = gameboard;
    this.hidden = false;

    this.cellColours = {
      ship: 'blue',
      hit: 'darkblue',
      miss: 'red',
      empty: '',
    };
  }

  get parentContainer() {
    return this.#parentContainer;
  }

  get gameboardElement() {
    return this.#gameboardElement;
  }

  get gameboard() {
    return this.#gameboard;
  }

  getCell(coordinates) {
    // Return the cell at specified coordinates
    return this.#gameboardElement.querySelector(
      `[data-row="${coordinates[0]}"][data-column="${coordinates[1]}"]`
    );
  }

  getHitCells() {
    return this.#gameboardElement.querySelectorAll(`:scope > .cell.hit`);
  }

  getAllCells() {
    return this.#gameboardElement.querySelectorAll(`:scope > .cell`);
  }

  render() {
    this.#gameboard.coordinates.forEach((row, rowIndex) =>
      row.forEach((col, colIndex) => {
        const cell = this.getCell([rowIndex, colIndex]);

        // Add/remove classes to cells
        if (col.hit) {
          cell.classList.add('hit');
        } else {
          cell.classList.remove('hit');
        }

        if (col.ship) {
          cell.classList.add('ship');
        } else {
          cell.classList.remove('ship');
        }

        // Add styles to cells
        if (col.hit && col.ship) {
          cell.style.backgroundColor = this.cellColours.hit;
        } else if (col.ship && this.hidden === false) {
          cell.style.backgroundColor = this.cellColours.ship;
        } else if (col.hit) {
          cell.style.backgroundColor = this.cellColours.miss;
        } else {
          cell.style.backgroundColor = this.cellColours.empty;
        }
      })
    );
  }
}

export default GameboardUI;
export { createGameboardElement };
