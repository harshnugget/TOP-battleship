import GameboardUI from './ui/GameboardUI.js';
import ShipUI from './ui/ShipUI.js';

class BattleshipUI {
  #battleship;

  static createElement({
    type = 'div',
    text,
    id,
    className,
    onClick,
    attributes = {},
    styles = {},
  }) {
    const element = document.createElement(`${type}`);

    if (text) element.textContent = text;
    if (id) element.id = id;
    if (className) element.className = className;
    if (onClick && typeof onClick === 'function') element.addEventListener('click', onClick);

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    Object.assign(element.style, styles);

    return element;
  }

  constructor(battleship) {
    this.#battleship = battleship;

    this.player1UI = this.createUI(this.players.player1);
    this.player2UI = this.createUI(this.players.player2);

    this.addGameboardEventListeners();
  }

  get players() {
    return this.#battleship.players;
  }

  createUI({ id, gameboard, ships }) {
    // Gameboard UI
    const gameboardUI = new GameboardUI(gameboard);
    const gameboardContainer = BattleshipUI.createElement({
      className: `p${id}-gameboard-container`,
      styles: { height: 'max-content', width: 'max-content' },
    });
    gameboardContainer.append(gameboardUI.gameboardElement);

    // Ships UI
    const shipsUI = new Map();

    for (const [type, ship] of ships.entries()) {
      const shipUI = new ShipUI(ship, gameboardUI);
      shipsUI.set(type, shipUI);
    }

    return { gameboardUI, shipsUI, gameboardContainer };
  }





        text: 'Randomize',
      });

        onClick: (() => {

            } else {
            }
          };
        })(),
      });



  getPlayerUI(playerId) {
    if (playerId === 1) {
      return this.player1UI;
    } else if (playerId === 2) {
      return this.player2UI;
    }
  }

  hideShips(playerId, isHidden = true) {
    const { gameboardUI, shipsUI } = this.getPlayerUI(playerId);

    gameboardUI.hideShips(isHidden);

    shipsUI.forEach((shipUI) => {
      shipUI.hideShip(isHidden);
    });

    this.render();
  }

  startGame() {
    this.#battleship.startGame();
  }

  resetGame() {
    this.#battleship.resetGame();

    [1, 2].forEach((playerId) => {
      const { shipsUI } = this.getPlayerUI(playerId);

      shipsUI.forEach((shipUI) => {
        shipUI.resetShip();
        shipUI.shipElement.draggable = true;
      });

      // Unhide player ships
      this.hideShips(playerId, false);
    });

    this.render();
  }

  attack(row, col) {
    this.#battleship.attack(row, col);
    this.render();
  }

  guess() {
    this.#battleship.guess();
    this.render();
  }

  placeShip(playerId, type, coordinates, orientation) {
    this.#battleship.placeShip(playerId, type, coordinates, orientation);
    this.render();
  }

  rotateShip(playerId, type) {
    this.#battleship.rotateShip(playerId, type);
    this.render();
  }

  resetShip(playerId, type) {
    const { shipsUI } = this.getPlayerUI(playerId);
    const shipUI = shipsUI.get(type);

    shipUI.resetShip();

    this.#battleship.resetShip(playerId, type);
    this.render();
  }

  placeAllShips(playerId) {
    this.#battleship.placeAllShips(playerId);
    this.render();
  }

  resetAllShips(playerId) {
    const { shipsUI } = this.getPlayerUI(playerId);

    shipsUI.forEach((shipUI) => {
      shipUI.resetShip();
    });

    this.#battleship.resetAllShips(playerId);
    this.render();
  }

  load(container) {


    // Load gameboard UI
    [this.player1UI, this.player2UI].forEach((ui) => {
      container.append(ui.gameboardContainer);
    });


  render() {
    [this.player1UI, this.player2UI].forEach((ui) => {
      ui.gameboardUI.render();
      ui.shipsUI.forEach((shipUI) => shipUI.render());
    });
  }

  addGameboardEventListeners() {
    const player1 = { ui: this.player1UI, player: this.players.player1 };
    const player2 = { ui: this.player2UI, player: this.players.player2 };

    [player1, player2].forEach(({ ui, player }) => {
      const { gameboardUI, shipsUI } = ui;
      const gameboardElement = gameboardUI.gameboardElement;
      const cells = gameboardUI.getAllCells();
      let cellDraggedOver;

      // Helper function to get a specific element at mouse event position
      const getElement = (event, className, parentElement) => {
        const elements = document.elementsFromPoint(event.clientX, event.clientY);
        return elements.find(
          (element) =>
            element.classList.contains(className) && element.parentElement === parentElement
        );
      };

      // Helper function to calculate coordinates based on a ship cell index, for better drag interaction
      const getPlacementCoordinates = (orientation, index) => {
        if (!cellDraggedOver) return;
        let row = Number(cellDraggedOver.dataset.row);
        let col = Number(cellDraggedOver.dataset.column);

        return orientation === 'horizontal' ? [row, col - index] : [row - index, col];
      };

      // Helper function to handle ship placement
      const handleShipPlacement = (type, ship, cellIndex) => {
        const coordinates = getPlacementCoordinates(ship.orientation, cellIndex);
        cellDraggedOver = null;

        if (coordinates) {
          const [row, col] = coordinates;
          const cell = gameboardUI.getCell([row, col]);
          if (cell) {
            this.placeShip(player.id, type, [row, col], ship.orientation);
          } else {
            player.id;
            this.render();
          }
        }
      };

      // Add event listeners for handling gameboard cell interaction
      const addCellEventListeners = () => {
        cells.forEach((cell) => {
          cell.addEventListener('click', (event) => {
            const clickedCell = getElement(event, 'cell', gameboardElement);
            if (
              clickedCell &&
              player.player !== this.#battleship.activePlayer &&
              this.#battleship.gameInProgress
            ) {
              this.attack(clickedCell.dataset.row, clickedCell.dataset.column);
            }
          });

          cell.addEventListener('dragenter', (event) => {
            cellDraggedOver = getElement(event, 'cell', gameboardElement) || cellDraggedOver;
          });
        });
      };

      // Add event listeners for handling ship interaction
      const addShipEventListeners = () => {
        for (const [type, shipUI] of shipsUI.entries()) {
          const shipElement = shipUI.shipElement;
          const ship = shipUI.ship;
          let cellIndex;

          // Make ships draggable
          shipElement.draggable = true;

          // Event for rotating ships
          shipElement.addEventListener('click', () => {
            if (!this.#battleship.gameInProgress && !this.#battleship.winner) {
              this.rotateShip(player.id, type);
            }
          });

          // Event for handling the start of a ship drag
          shipElement.addEventListener('dragstart', (event) => {
            // Get the mouse position relative to the element
            const rect = shipElement.getBoundingClientRect();
            const offsetX = event.clientX - rect.left; // X offset
            const offsetY = event.clientY - rect.top; // Y offset

            // Set the drag image and position it relative to the mouse cursor
            event.dataTransfer.setDragImage(shipElement, offsetX, offsetY);

            if (this.#battleship.gameInProgress || this.#battleship.winner) {
              event.preventDefault();
              shipElement.draggable = false;
              return;
            }

            // Retrieve the the ship cell at mouse position
            const shipCell = getElement(event, 'cell', shipElement);

            // Remove the ship from gameboard during drag operation
            const prevCoords = ship.coordinates;
            const prevOrientation = ship.orientation;
            this.#battleship.resetShip(player.id, type);
            ship.coordinates = prevCoords;
            ship.orientation = prevOrientation;

            // Store the index of the ship cell
            cellIndex = [...shipElement.children].findIndex((child) => child === shipCell);
          });

          // Event for handling ship placeholders while dragging
          shipElement.addEventListener('drag', () => {
            const coordinates = getPlacementCoordinates(ship.orientation, cellIndex);

            if (coordinates) {
              const [row, col] = coordinates;
              shipUI.placeShipPlaceholder([row, col]);
            }
          });

          // Event for handling ship placement
          shipElement.addEventListener('dragend', () => {
            handleShipPlacement(type, ship, cellIndex);
          });
        }
      };

      // Initialize all event listeners for cells and ships
      addCellEventListeners();
      addShipEventListeners();
    });
  }
}

export default BattleshipUI;
