import Battleship from './Battleship.js';
import GameboardUI from './ui/GameboardUI.js';
import ShipUI from './ui/ShipUI.js';

class BattleshipUI extends Battleship {
  // Containers for the gameboard and ships UI
  static createContainers() {
    const gameboardContainer = document.createElement('div');
    const shipsContainer = document.createElement('div');

    gameboardContainer.classList.add('gameboard-container');
    shipsContainer.classList.add('ships-container');

    return { gameboardContainer, shipsContainer };
  }

  constructor(player1Name, player2Name, logMessages = false) {
    super(player1Name, player2Name, logMessages);

    this.createUI();
  }

  createUI(container = document.body) {
    const player1 = super.getPlayerData(1);
    const player2 = super.getPlayerData(2);

    [player1, player2].forEach((player) => {
      const { gameboardContainer, shipsContainer } = BattleshipUI.createContainers();

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
    super.startGame();
  }

  resetGame() {
    super.resetGame();
    this.render();
  }

  attack(row, col) {
    super.attack(row, col);
    this.render();
  }

  placeShip(playerId, type, coordinates, orientation) {
    super.placeShip(playerId, type, coordinates, orientation);
    this.render();
  }

  rotateShip(playerId, type) {
    super.rotateShip(playerId, type);
    this.render();
  }

  resetShip(playerId, type) {
    super.resetShip(playerId, type);
    this.render();
  }

  placeAllShips(playerId) {
    super.placeAllShips(playerId);
    this.render();
  }

  resetAllShips(playerId) {
    super.resetAllShips(playerId);
    this.render();
  }

  render() {
    const player1 = super.getPlayerData(1);
    const player2 = super.getPlayerData(2);

    [player1, player2].forEach((player) => {
      const { ships, gameboardUI } = player;

      gameboardUI.render();

      Object.values(ships).forEach(({ shipUI }) => {
        shipUI.render();
      });
    });
  }

  addGameboardEventListeners() {
    const player1 = super.getPlayerData(1);
    const player2 = super.getPlayerData(2);

    [player1, player2].forEach((player) => {
      const { gameboardUI } = player;
      const gameboard = gameboardUI.gameboardElement;
      const cells = gameboardUI.getAllCells();
      let cellDraggedOver;

      // Retrieves the element, with specified class and parent, at the location of a click
      const getElement = (event, className, parentElement) => {
        const elements = document.elementsFromPoint(event.clientX, event.clientY);

        return elements.find((element) => {
          return (
            element.classList.contains(`${className}`) && element.parentElement === parentElement
          );
        });
      };

      // Sends an attack at the coordinates of the specified gameboard cell
      const attackCell = (cell) => {
        if (player.player !== super.activePlayer && super.gameInProgress && cell) {
          this.attack(cell.dataset.row, cell.dataset.column);
        }
      };

      const getCoordinatesByCellIndex = (orientation, index) => {
        /* Calculate the coordinates to place a ship based on the index of the ship cell at the location of dragstart.
        EXAMPLE:
        1. A ship of length 4 (4 cells) is oriented horizontally.
        2. The user begins the dragstart event at the position of the 3rd ship cell, so the index is 3.
        3. The current gameboard cell dragged over has coordinates [row: 5, column: 9].
        4. The final placement coordinates adjust the column by subtracting the index (9 - 3 = 6).
        5. The ship will be placed at [row: 5, column: 6]. */

        if (!cellDraggedOver) return;

        let row = Number(cellDraggedOver.dataset.row);
        let col = Number(cellDraggedOver.dataset.column);

        if (orientation === 'horizontal') {
          col -= index;
        } else if (orientation === 'vertical') {
          row += index;
        }

        return [row, col];
      };

      // Add event listeners to each cell
      cells.forEach((cell) => {
        // Handle click for attacking at current gameboard cell
        cell.addEventListener('click', (event) => {
          const cell = getElement(event, 'cell', gameboard);
          if (cell) {
            attackCell(cell);
          }
        });

        // Handle drag enter for tracking the current gameboard cell
        cell.addEventListener('dragenter', (event) => {
          const cell = getElement(event, 'cell', gameboard);
          if (cell) {
            cellDraggedOver = cell;
          }
        });
      });

      // Add event listeners to each ship
      Object.keys(player.ships).forEach((type) => {
        const ship = player.ships[type].ship;
        const shipUI = player.ships[type].shipUI;
        const shipElement = shipUI.shipElement;
        let cellIndex;

        // Ensure the ship element is draggable
        shipElement.draggable = true;

        // Handle click for ship rotation
        shipElement.addEventListener('click', () => {
          try {
            super.validateAction('rotate ship');
            this.rotateShip(player.id, type);
          } catch (error) {
            super.logMessage(super.formatErrorMsg(error), 'error');
          }
        });

        // Handle drag start to begin ship repositioning
        shipElement.addEventListener('dragstart', (event) => {
          // Function to remove the ship's current gameboard cells while dragging
          const removeFromBoard = () => {
            // Store the ship's current orientation for restoration after resetting
            const prevOrientation = ship.orientation;

            // Reset the ship and update the gameboard UI, effectively removing the ship from its current position
            super.resetShip(player.id, type);
            gameboardUI.render();

            // Restore the ship's previous orientation for consistent repositioning
            ship.orientation = prevOrientation;
          };

          try {
            super.validateAction('drag ship');
            const cell = getElement(event, 'cell', shipElement);
            removeFromBoard();
            cellIndex = [...shipElement.children].findIndex((child) => child === cell);
          } catch (error) {
            event.preventDefault();
            shipElement.draggable = false;
            super.logMessage(super.formatErrorMsg(error), 'error');
          }
        });

        // Handle the dragging for ship placeholders
        shipElement.addEventListener('drag', () => {
          try {
            const [row, col] = getCoordinatesByCellIndex(ship.orientation, cellIndex);
            shipUI.placeShip([row, col]);
          } catch (error) {
            super.logMessage(super.formatErrorMsg(error), 'error');
          }
        });

        // Handle drag end to place ship in new position
        shipElement.addEventListener('dragend', () => {
          try {
            const [row, col] = getCoordinatesByCellIndex(ship.orientation, cellIndex);
            const cell = gameboardUI.getCell([row, col]);

            if (cell) {
              this.placeShip(player.id, type, [row, col], ship.orientation);
              cellDraggedOver = null;
            }
          } catch (error) {
            super.logMessage(super.formatErrorMsg(error), 'error');
          }
        });
      });
    });
  }
}

export default BattleshipUI;
