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

  const createCellContainer = () => {
    const element = document.createElement('div');
    element.classList.add('cell');

    return element;
  };

  for (let i = 0; i < length; i++) {
    const cellContainer = createCellContainer();
    element.append(cellContainer);
  }

  return element;
};

class ShipUI {
  #parentContainer;
  #gameboardUI;
  #shipElement;
  #ship;

  constructor(ship, gameboardUI, parentContainer) {
    this.#parentContainer = parentContainer;
    this.#gameboardUI = gameboardUI;
    this.#ship = ship;
    this.hidden = false;

    this.cellColours = {
      ship: gameboardUI.cellColours.ship,
      hit: gameboardUI.cellColours.hit,
    };

    this.#shipElement = this.createShip(ship.length);
  }

  get parentContainer() {
    return this.#parentContainer;
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

    // Append the container to the parent element
    this.#parentContainer.append(shipElement);

    return shipElement;
  }

  setOrientation(orientation) {
    const element = this.#shipElement;
    const length = element.querySelectorAll('.cell').length;

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

    cell.append(ship);
  }

  receiveHit(cellIndex) {
    const cell = this.#shipElement.childNodes[cellIndex];

    cell.classList.add('hit');
    cell.style.backgroundColor = this.cellColours.hit;
  }

  resetShip() {
    const element = this.#shipElement;

    // Remove absolute positioning
    element.style.position = '';

    element.childNodes.forEach((cell) => {
      cell.classList.remove('hit');
      cell.style.backgroundColor = this.cellColours.ship;
    });

    this.setOrientation('horizontal');

    this.#parentContainer.append(element);
  }

  hideShip(isHidden = true) {
    if (isHidden) {
      this.hidden = true;
    } else {
      this.hidden = false;
    }

    this.render();
  }

  render() {
    if (this.hidden === true) {
      return (this.shipElement.style.visibility = 'hidden');
    } else {
      this.shipElement.style.visibility = '';
    }

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
      });
    } else {
      // If ship has no coordinates, reset it
      this.resetShip();
    }
  }
}

export default ShipUI;
