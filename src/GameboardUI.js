/* This function creates an element for displaying the gameboard grid
- Each cell will represent a coordinate (e.g. [3, 4]) on the gameboard */

const createGameboardElement = (rows, columns, cellSize = 40) => {
  const element = document.createElement('div');
  element.classList.add('gameboard');

  element.style.display = 'grid';
  element.style.gridTemplateColumns = `repeat(${columns}, ${cellSize}px)`;
  element.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;

  const createCellContainer = () => {
    const element = document.createElement('div');
    element.classList.add('cell');
    element.style.border = '1px solid #0000FF';
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

export default createGameboardElement;
