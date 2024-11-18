import GameboardUI from './ui/GameboardUI.js';
import ShipUI from './ui/ShipUI.js';

class BattleshipUI {
  #battleship;

  // Containers for the gameboard and ships UI
  static createContainers() {
    const gameboardContainer = document.createElement('div');
    const shipsContainer = document.createElement('div');

    gameboardContainer.classList.add('gameboard-container');
    shipsContainer.classList.add('ships-container');

    return { gameboardContainer, shipsContainer };
  }

  static createButton({ text, id, className, onClick, styles = {} }) {
    const button = document.createElement('button');
    button.textContent = text;

    if (id) button.id = id;
    if (className) button.className = className;
    if (onClick && typeof onClick === 'function') button.addEventListener('click', onClick);

    Object.assign(button.style, styles);

    return button;
  }

  constructor(battleship, container = document.body) {
    this.#battleship = battleship;

    this.createUI(container);
  }

  get activePlayer() {
    return this.#battleship.activePlayer;
  }

  get gameInProgress() {
    return this.#battleship.gameInProgress;
  }

  get winner() {
    return this.#battleship.winner;
  }

  getPlayerData(playerId) {
    return this.#battleship.getPlayerData(playerId);
  }

  createUI(container = document.body) {
    const players = [this.getPlayerData(1), this.getPlayerData(2)];

    const createMainButtons = (container) => {
      container.append(
        BattleshipUI.createButton({
          text: 'Start Game',
          className: 'start-btn',
          onClick: () => this.startGame(),
        })
      );

      container.append(
        BattleshipUI.createButton({
          text: 'Reset Game',
          className: 'reset-btn',
          onClick: () => this.resetGame(),
        })
      );
    };

    const createPlayerButtons = (gameboardContainer, playerId) => {
      gameboardContainer.append(
        BattleshipUI.createButton({
          text: 'Place Ships',
          className: 'place-ships-btn',
          onClick: () => this.placeAllShips(playerId),
        })
      );

      gameboardContainer.append(
        BattleshipUI.createButton({
          text: 'Reset Ships',
          className: 'reset-ships-btn',
          onClick: () => this.resetAllShips(playerId),
        })
      );

      gameboardContainer.append(
        BattleshipUI.createButton({
          text: 'Toggle Ships',
          className: 'toggle-ships-btn',
          onClick: (() => {
            let hide = true;
            return () => {
              if (hide) {
                this.hideShips(playerId);
              } else {
                this.hideShips(playerId, false);
              }
              hide = !hide;
            };
          })(),
        })
      );
    };

    createMainButtons(container);

    players.forEach((player) => {
      const { gameboardContainer, shipsContainer } = BattleshipUI.createContainers();

      createPlayerButtons(gameboardContainer, player.id);

      const gameboard = player.gameboard;
      const ships = player.ships;

      const gameboardUI = new GameboardUI(gameboard, gameboardContainer);
      Object.assign(player, { gameboardUI: gameboardUI });

      Object.values(ships).forEach((value) => {
        const shipUI = new ShipUI(value.ship, gameboardUI, shipsContainer);
        Object.assign(value, { shipUI });
      });

      gameboardContainer.append(shipsContainer);
      container.append(gameboardContainer);
    });
  }

  hideShips(playerId, isHidden = true) {
    const { gameboardUI, ships } = this.getPlayerData(playerId);

    gameboardUI.hideShips(isHidden);

    Object.values(ships).forEach(({ shipUI }) => {
      shipUI.hideShip(isHidden);
    });

    this.render();
  }

  startGame() {
    this.#battleship.startGame();
  }

  resetGame() {
    this.#battleship.resetGame();
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
    this.#battleship.resetShip(playerId, type);
    this.render();
  }

  placeAllShips(playerId) {
    this.#battleship.placeAllShips(playerId);
    this.render();
  }

  resetAllShips(playerId) {
    this.#battleship.resetAllShips(playerId);
    this.render();
  }

  render() {
    const players = [this.getPlayerData(1), this.getPlayerData(2)];

    players.forEach((player) => {
      const { ships, gameboardUI } = player;

      gameboardUI.render();

      Object.values(ships).forEach(({ shipUI }) => {
        shipUI.render();
      });
    });
  }

  addGameboardEventListeners() {
    const players = [this.getPlayerData(1), this.getPlayerData(2)];

    players.forEach((player) => {
      const { gameboardUI } = player;
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
        if (coordinates) {
          const [row, col] = coordinates;
          const cell = gameboardUI.getCell([row, col]);
          if (cell) {
            this.placeShip(player.id, type, [row, col], ship.orientation);
            cellDraggedOver = null;
          }
        }
      };

      // Add event listeners for handling gameboard cell interaction
      const addCellEventListeners = () => {
        cells.forEach((cell) => {
          cell.addEventListener('click', (event) => {
            const clickedCell = getElement(event, 'cell', gameboardElement);
            if (clickedCell && player.player !== this.activePlayer && this.gameInProgress) {
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
        Object.keys(player.ships).forEach((type) => {
          const { ship, shipUI } = player.ships[type];
          const shipElement = shipUI.shipElement;
          let cellIndex;

          // Make ships draggable
          shipElement.draggable = true;

          // Event for rotating ships
          shipElement.addEventListener('click', () => {
            if (!this.gameInProgress && !this.winner) {
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

            if (this.gameInProgress || this.winner) {
              event.preventDefault();
              shipElement.draggable = false;
              return;
            }

            // Retrieve the the ship cell at mouse position
            const shipCell = getElement(event, 'cell', shipElement);

            // Remove the ship from gameboard during drag operation
            const prevOrientation = ship.orientation;
            this.#battleship.resetShip(player.id, type);
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
          shipElement.addEventListener('dragend', (event) => {
            handleShipPlacement(type, ship, cellIndex);

            const gameboardDraggedOver = getElement(
              event,
              'gameboard',
              gameboardElement.parentElement
            );

            if (!gameboardDraggedOver) {
              this.resetShip(player.id, type);
            }
          });
        });
      };

      // Initialize all event listeners for cells and ships
      addCellEventListeners();
      addShipEventListeners();
    });
  }
}

export default BattleshipUI;
