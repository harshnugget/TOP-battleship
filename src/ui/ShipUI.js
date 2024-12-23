/* This function creates an element for displaying a ship */
const createShipElement = (length) => {
  const cellSize = 40;
  const element = document.createElement('div');
  element.classList.add('ship');

  element.style.display = 'grid';
  element.style.gridTemplateColumns = `repeat(${length}, ${cellSize}px)`;
  element.style.gridTemplateRows = `repeat(1, ${cellSize}px)`;
  element.style.width = 'max-content';
  element.style.height = 'max-content';
  element.style.zIndex = '1';

  const createCell = () => {
    const element = document.createElement('div');
    element.classList.add('cell');

    return element;
  };

  for (let i = 0; i < length; i++) {
    const cell = createCell();
    element.append(cell);
  }

  return element;
};

class ShipUI {
  #gameboardUI;
  #shipElement;
  #ship;

  constructor(ship, gameboardUI) {
    this.#gameboardUI = gameboardUI;
    this.#ship = ship;
    this.hidden = false;

    this.cellColours = {
      ship: gameboardUI.cellColours.ship,
      hit: gameboardUI.cellColours.hit,
      placeholder: 'grey',
    };

    this.#shipElement = this.createShip(ship.length);
  }

  get gameboard() {
    return this.#gameboardUI.gameboardElement;
  }

  get shipElement() {
    return this.#shipElement;
  }

  get ship() {
    return this.#ship;
  }

  createShip(length) {
    // Get properties/styles of the gameboard
    const cellStyles = this.#gameboardUI.getCell([0, 0]).style;
    const borderWidth = parseFloat(cellStyles.borderWidth);
    const gapSize = this.#gameboardUI.gameboardElement.style.gap;

    // Create the ship element and apply properties/styles
    const shipElement = createShipElement(length);

    shipElement.style.left = `-${borderWidth}px`;
    shipElement.style.top = `-${borderWidth}px`;
    shipElement.style.gap = gapSize;

    // Apply properties/styles to each cell of the ship element
    shipElement.querySelectorAll('.cell').forEach((cell) => {
      cell.style.border = cellStyles.border;
      cell.style.backgroundColor = this.cellColours.ship;
    });

    return shipElement;
  }

  setOrientation(orientation) {
    const element = this.#shipElement;
    const length = this.ship.length;

    if (orientation === 'vertical') {
      element.style.gridTemplateColumns = `repeat(1, 40px)`;
      element.style.gridTemplateRows = `repeat(${length}, 40px)`;
    } else if (orientation === 'horizontal') {
      element.style.gridTemplateColumns = `repeat(${length}, 40px)`;
      element.style.gridTemplateRows = `repeat(1, 40px)`;
    }
  }

  placeShip([row, col]) {
    const cell = this.#gameboardUI.getCell([row, col]);

    const ship = this.#shipElement;

    // Ensure the position styles are set correctly
    cell.style.position = 'relative';
    ship.style.position = 'absolute';

    this.#shipElement.style.visibility = '';

    cell.append(ship);
    this.removeShipPlaceholder();
  }

  placeShipPlaceholder([row, col]) {
    const placeholderCells = [];

    this.removeShipPlaceholder();

    for (let i = 0; i < this.ship.length; i++) {
      let cell;

      if (this.ship.orientation === 'horizontal') {
        cell = this.#gameboardUI.getCell([row, col + i]);
      } else if (this.ship.orientation === 'vertical') {
        cell = this.#gameboardUI.getCell([row + i, col]);
      } else {
        throw new Error('Cannot place placeholder.', { cause: 'Uknown ship orientation.' });
      }

      if (cell && !cell.classList.contains('ship')) {
        placeholderCells.push(cell);
      } else {
        return this.removeShipPlaceholder();
      }
    }

    placeholderCells.forEach((cell) => {
      cell.classList.add('placeholder');
      cell.style.backgroundColor = this.cellColours.placeholder;
    });
  }

  removeShipPlaceholder() {
    this.#gameboardUI.render();
    const placeholderCells = document.querySelectorAll('.cell.placeholder');

    if (placeholderCells) {
      placeholderCells.forEach((cell) => {
        cell.classList.remove('placeholder');
      });
    }
  }

  receiveHit(cellIndex) {
    const cell = this.#shipElement.childNodes[cellIndex];

    cell.classList.add('hit');
    cell.style.backgroundColor = this.cellColours.hit;
  }

  resetShip() {
    const element = this.#shipElement;

    element.childNodes.forEach((cell) => {
      cell.classList.remove('hit');
      cell.style.backgroundColor = this.cellColours.ship;
    });
  }

  hideShip(isHidden = true) {
    if (isHidden) {
      this.hidden = true;
      this.#shipElement.querySelectorAll('.cell').forEach((cell) => cell.classList.add('hide'));
    } else {
      this.hidden = false;
      this.#shipElement.querySelectorAll('.cell').forEach((cell) => cell.classList.remove('hide'));
    }

    this.render();
  }

  render() {
    const coordinates = this.#ship.coordinates;
    const orientation = this.#ship.orientation;
    const allHitCells = this.#gameboardUI.getHitCells();

    if (coordinates.length > 0) {
      this.placeShip(coordinates[0]);
      this.setOrientation(orientation);

      // Check each coordinate for a hit
      coordinates.forEach((coord, cellIndex) => {
        const cell = this.#gameboardUI.getCell(coord);

        if ([...allHitCells].includes(cell)) {
          this.receiveHit(cellIndex);
        }

        if (this.ship.isSunk) {
          this.shipElement.classList.add('sunk');
          cell.classList.add('sunk');
        } else {
          this.shipElement.classList.remove('sunk');
          cell.classList.remove('sunk');
        }

        if (this.hidden === true) {
          this.shipElement.style.visibility = 'hidden';
        } else {
          this.shipElement.style.visibility = '';
        }
      });
    } else {
      this.resetShip();
      this.#shipElement.remove();
    }
  }
}

export default ShipUI;
