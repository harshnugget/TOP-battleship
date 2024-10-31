/* This function creates an element for displaying a ship */
const createShipElement = (length, cellSize) => {
  const element = document.createElement('div');
  element.classList.add('ship');

  element.style.display = 'grid';
  element.style.gridTemplateColumns = `repeat(${length}, ${cellSize}px)`;
  element.style.gridTemplateRows = `repeat(1, ${cellSize}px)`;
  element.style.width = 'max-content';
  element.style.height = 'max-content';

  const createCellContainer = () => {
    const element = document.createElement('div');
    element.classList.add('ship-cell');
    element.style.backgroundColor = 'green';

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
  #ships;

  constructor(parentContainer, gameboardUI) {
    this.#parentContainer = parentContainer;
    this.#gameboardUI = gameboardUI;
    this.#ships = new Map();
  }

  get parentContainer() {
    return this.#parentContainer;
  }

  get gameboard() {
    return this.#gameboardUI.gameboardElement;
  }

  get ships() {
    return Array.from(this.#ships);
  }

  createShip(type, length) {
    // Get properties of the gameboard element
    const cellSize = this.#gameboardUI.cellSize;
    const borderProperties = getComputedStyle(this.#gameboardUI.getCell([0, 0])).border;
    const gapSize = getComputedStyle(this.#gameboardUI.gameboardElement).gap;

    const element = createShipElement(length, cellSize);

    element.style.gap = gapSize;

    element.querySelectorAll('.ship-cell').forEach((cell) => {
      cell.style.border = borderProperties;
    });

    element.dataset.type = type;

    this.#parentContainer.append(element);
    this.#ships.set(type, { element: element, orientation: 'horizontal' });
  }

  flipOrientation(type) {
    const ship = this.#ships.get(type);
    const element = ship.element;
    const orientation = ship.orientation;

    // Apply rotation
    element.style.transformOrigin = 'top left';
    element.style.transform =
      orientation === 'horizontal'
        ? `rotate(90deg) translate(0px, -${element.offsetHeight}px)`
        : 'rotate(0deg)';

    // Update the ship's orientation
    ship.orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';
  }

  placeShip(type, coordinates, orientation = 'horizontal') {
    if (orientation !== 'horizontal' && orientation !== 'vertical') {
      throw Error(`Invalid orientation! Must be either "horizontal" or "vertical"`);
    }

    const cell = this.#gameboardUI.getCell(coordinates);
    const ship = this.#ships.get(type);
    const element = ship.element;

    // Get the top-left border & padding values of the cell
    const computedStyle = getComputedStyle(cell);

    const borderLeft = parseFloat(computedStyle.borderLeftWidth);
    const borderTop = parseFloat(computedStyle.borderTopWidth);

    const paddingLeft = parseFloat(computedStyle.paddingLeft);
    const paddingTop = parseFloat(computedStyle.paddingTop);

    // Position the ship element by subtracting the top-left border & padding values
    element.style.left = `-${borderLeft + paddingLeft}px`;
    element.style.top = `-${borderTop + paddingTop}px`;

    // Ensure the position styles are set correctly
    cell.style.position = 'relative';
    element.style.position = 'absolute';

    cell.append(element);

    if (orientation !== ship.orientation) {
      this.flipOrientation(type);
    }
  }

  resetShip(type) {
    const ship = this.#ships.get(type);
    const element = ship.element;
    const orientation = ship.orientation;

    if (orientation !== 'horizontal') {
      this.flipOrientation(type);
    }

    element.style.position = '';
    this.#parentContainer.append(element);
  }
}

export default ShipUI;
