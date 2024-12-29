import GameboardUI from '../ui/GameboardUI.js';
import ShipUI from '../ui/ShipUI.js';
import CustomDragger from './CustomDragger.js';

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

  // Helper function to locate a specific element at mouse event position
  static getElementFromPoint(x, y, className, parentElement) {
    const elementFromPoint = document.elementFromPoint(x, y);
    const rect = elementFromPoint.getBoundingClientRect();

    // Get all elements beneath the element at point
    const elementsFromPoint = document.elementsFromPoint(
      rect.left + rect.width / 2, // X: center of the element
      rect.top + rect.height / 2 // Y: center of the element
    );

    return elementsFromPoint.find(
      (element) => element.classList.contains(className) && element.parentElement === parentElement
    );
  }

  constructor(battleship) {
    this.#battleship = battleship;

    this.player1UI = this.createUI(this.players.player1);
    this.player2UI = this.createUI(this.players.player2);
    this.buttons = this.createButtons();

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

  createButtons() {
    const buttons = { mainBtns: {}, player1Btns: {}, player2Btns: {} };

    // Create main buttons
    const start = BattleshipUI.createElement({
      type: 'button',
      text: 'Start',
      id: 'start',
      className: 'main-btn',
      attributes: { title: 'Start Game' },
      onClick: this.startGame.bind(this),
    });

    const reset = BattleshipUI.createElement({
      type: 'button',
      text: 'Reset',
      id: 'reset',
      className: 'main-btn',
      attributes: { title: 'Reset Game' },
      onClick: this.resetGame.bind(this),
    });

    Object.assign(buttons.mainBtns, { start, reset });

    // Create player buttons
    [
      { id: 1, playerBtns: buttons.player1Btns, playerUI: this.player1UI },
      { id: 2, playerBtns: buttons.player2Btns, playerUI: this.player2UI },
    ].forEach(({ id, playerBtns, playerUI }) => {
      const randomize = BattleshipUI.createElement({
        type: 'button',
        text: 'Randomize',
        id: `p${id}-randomize`,
        className: 'player-btn',
        attributes: { title: 'Randomize' },
        onClick: this.placeAllShips.bind(this, id),
      });

      const toggle = (() => {
        const hideShipsFunc = this.hideShips.bind(this);
        const shipsUI = playerUI.shipsUI;

        const allShipsHidden = () => {
          return [...shipsUI.values()].every((ship) => ship.hidden === true);
        };

        return BattleshipUI.createElement({
          type: 'button',
          text: 'Toggle',
          id: `p${id}-toggle`,
          className: `player-btn ${allShipsHidden() ? 'hide' : 'show'}`,
          attributes: { title: 'Show/Hide' },
          onClick: (() => {
            return function () {
              if (allShipsHidden()) {
                this.classList.remove('hide');
                this.classList.add('show');
                hideShipsFunc(id, false);
              } else {
                this.classList.remove('show');
                this.classList.add('hide');
                hideShipsFunc(id, true);
              }
            };
          })(),
        });
      })();

      Object.assign(playerBtns, { randomize, toggle });
    });

    return buttons;
  }

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
    return this.#battleship.startGame();
  }

  resetGame() {
    this.#battleship.resetGame();

    // Reset toggle buttons
    if (this.buttons.player1Btns.toggle.classList.contains('hide')) {
      this.buttons.player1Btns.toggle.click();
    }

    if (this.buttons.player2Btns.toggle.classList.contains('hide')) {
      this.buttons.player2Btns.toggle.click();
    }

    [1, 2].forEach((playerId) => {
      const { shipsUI } = this.getPlayerUI(playerId);

      shipsUI.forEach((shipUI) => {
        shipUI.resetShip();
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
    if (this.#battleship.singlePlayer) {
      this.hideShips(2);
    }

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
    const mainBtnsContainer = document.createElement('div');
    const player1BtnsContainer = document.createElement('div');
    const player2BtnsContainer = document.createElement('div');

    mainBtnsContainer.className = 'main-btns-container';
    player1BtnsContainer.className = 'p1-btns-container';
    player2BtnsContainer.className = 'p2-btns-container';

    // Load gameboard UI
    [this.player1UI, this.player2UI].forEach((ui) => {
      container.append(ui.gameboardContainer);
    });

    // Load buttons
    Object.values(this.buttons.mainBtns).forEach((btn) => {
      mainBtnsContainer.append(btn);
    });

    Object.values(this.buttons.player1Btns).forEach((btn) => {
      player1BtnsContainer.append(btn);
    });

    Object.values(this.buttons.player2Btns).forEach((btn) => {
      player2BtnsContainer.append(btn);
    });

    container.append(mainBtnsContainer, player1BtnsContainer, player2BtnsContainer);
  }

  render() {
    [this.player1UI, this.player2UI].forEach((ui) => {
      ui.gameboardUI.render();
      ui.shipsUI.forEach((shipUI) => shipUI.render());
    });
  }

  addGameboardEventListeners() {
    const player1 = { ui: this.player1UI, player: this.players.player1 };
    const player2 = { ui: this.player2UI, player: this.players.player2 };

    const customDragger = new CustomDragger();

    const getElementFromPoint = BattleshipUI.getElementFromPoint;

    [player1, player2].forEach(({ ui, player }) => {
      const { gameboardUI, shipsUI } = ui;
      const gameboardElement = gameboardUI.gameboardElement;
      const cells = [...gameboardUI.getAllCells()];

      let cellDraggedOver;

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

      const clickedCell = (event) => {
        // Prevent attacking from wrong board
        if (player === this.#battleship.activePlayer) return;

        const clickedCell = getElementFromPoint(
          event.clientX,
          event.clientY,
          'cell',
          gameboardElement
        );

        if (clickedCell) {
          this.attack(clickedCell.dataset.row, clickedCell.dataset.column);
        }
      };

      const clickedShip = (id, type) => {
        if (!this.#battleship.gameInProgress && !this.#battleship.winner) {
          this.rotateShip(id, type);
        }
      };

      const disableDragger = () => {
        if (this.#battleship.gameInProgress || this.#battleship.winner) {
          customDragger.disabled = true;
        } else {
          customDragger.disabled = false;
        }
      };

      // GAMEBOARD LISTENERS
      gameboardElement.addEventListener('mouseenter', disableDragger);

      // CELL EVENT LISTENERS
      cells.forEach((cell) => {
        cell.addEventListener('click', clickedCell.bind(this));

        cell.addEventListener('mouseenter', (event) => {
          cellDraggedOver = getElementFromPoint(
            event.clientX,
            event.clientY,
            'cell',
            gameboardElement
          );
        });
      });

      // SHIP EVENT LISTENERS
      for (const [type, shipUI] of shipsUI.entries()) {
        const shipElement = shipUI.shipElement;
        const ship = shipUI.ship;
        let cellIndex;

        // Click ship to rotate
        shipElement.addEventListener('click', clickedShip.bind(this, player.id, type));

        customDragger.dragStart(shipElement, (event) => {
          const clickedShipCell = getElementFromPoint(
            event.clientX,
            event.clientY,
            'cell',
            shipElement
          );

          // Remove the ship from gameboard during drag operation
          const prevCoords = ship.coordinates;
          const prevOrientation = ship.orientation;

          this.resetShip(player.id, type);
          ship.coordinates = prevCoords;
          ship.orientation = prevOrientation;

          if (clickedShipCell) {
            cellIndex = [...shipElement.children].findIndex((child) => child === clickedShipCell);
          }
        });

        customDragger.dragEnd(shipElement, () => {
          shipUI.removeShipPlaceholder();

          handleShipPlacement(type, ship, cellIndex);
        });

        customDragger.drag(shipElement, () => {
          const coordinates = getPlacementCoordinates(ship.orientation, cellIndex);

          if (coordinates) {
            const [row, col] = coordinates;
            shipUI.placeShipPlaceholder([row, col]);
          }
        });
      }
    });
  }
}

export default BattleshipUI;
