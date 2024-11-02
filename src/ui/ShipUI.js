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
    this.#parentContainer = parentContainer; // Stores unplaced ship elements
    this.#gameboardUI = gameboardUI;
    this.#ships = new Map(); // Store references to ship elements by type
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
    // Get properties/styles of the gameboard element
    const cellSize = this.#gameboardUI.cellSize;
    const borderStyles = getComputedStyle(this.#gameboardUI.getCell([0, 0])).border;
    const gapSize = getComputedStyle(this.#gameboardUI.gameboardElement).gap;

    // Create the ship element and apply properties/styles
    const shipElement = createShipElement(length, cellSize);
    shipElement.dataset.type = type;

    shipElement.style.gap = gapSize;
    shipElement.querySelectorAll('.ship-cell').forEach((cell) => {
      cell.style.border = borderStyles;
    });

    // Store the ship type as a reference to the element and orientation (default to horizontal);
    this.#ships.set(type, { element: shipElement, orientation: 'horizontal' });

    // Create a container for the ship element by it's type
    const container = document.createElement('div');
    container.classList.add(`${type}-container`);
    container.append(shipElement);

    // Append the container to the shipUI parent element
    this.#parentContainer.append(container);
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
    const { element, orientation: shipOrientation } = this.#ships.get(type);

    if (orientation !== shipOrientation) {
      this.flipOrientation(type);
    }

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
  }

  resetShip(type) {
    const { element, orientation } = this.#ships.get(type);

    if (orientation !== 'horizontal') {
      this.flipOrientation(type);
    }

    element.style.position = '';

    // Get the container by type and re-append the ship element
    const container = this.#parentContainer.querySelector(`.${type}-container`);
    container.append(element);
  }
}

export default ShipUI;
