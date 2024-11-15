import Gameboard from '../Gameboard';
import Ship from '../Ship';
import Player from '../Player';
import GameController from '../GameController';

describe('Game Controller', () => {
  let controller;
  let player1;
  let player2;
  let player1Gameboard;
  let player2Gameboard;

  beforeAll(() => {
    player1Gameboard = new Gameboard(10, [new Ship(2), new Ship(3), new Ship(4)]);
    player2Gameboard = new Gameboard(10, [new Ship(2), new Ship(3), new Ship(4)]);
    player1 = new Player('Player 1', player1Gameboard);
    player2 = new Player('Player 2', player2Gameboard);
    controller = new GameController(player1, player2);
  });

  test.only('Starting the game', () => {
    // Game should not start if all ships are not placed
    expect(() => controller.startGame()).toThrow();

    [player1Gameboard, player2Gameboard].forEach((gameboard) => {
      gameboard.ships.forEach((ship, index) => {
        gameboard.placeShip(ship, [index, 0], 'horizontal');
      });
    });

    // After placing all ships, the game should be ready
    expect(() => controller.startGame()).not.toThrow();
    expect(controller.gameInProgress).toBe(true);
  });

  test.only('Switching turns', () => {
    expect(controller.activePlayer).toBe(player1);
    controller.switchTurn();
    expect(controller.activePlayer).toBe(player2);
    controller.switchTurn();
    expect(controller.activePlayer).toBe(player1);
  });

  describe.only('Attacking', () => {
    test('Missed a target', () => {
      expect(controller.activePlayer).toBe(player1);

      expect(controller.attack([9, 0])).toBe(false);
      expect(controller.activePlayer).toBe(player2);

      expect(controller.attack([0, 9])).toBe(false);
      expect(controller.activePlayer).toBe(player1);
    });

    test('Hit a target', () => {
      expect(controller.attack([1, 0])).toBe(true);
      expect(controller.attack([1, 1])).toBe(true);
    });

    test('Win a game', () => {
      // Get coordinates of player2's ships
      const shipCoordinates = [];
      const player2Ships = player2Gameboard.ships;

      [...player2Ships].forEach((ship) => {
        // const { coordinates } = getShipData(ship);
        ship.coordinates.forEach((coord) => shipCoordinates.push(coord));
      });

      // Sink all of player2's ships until player1 wins
      shipCoordinates.forEach((coord) => {
        const row = coord[0];
        const col = coord[1];

        // Skip coordinates that have already been hit
        if (player2Gameboard.coordinates[row][col].hit === true) {
          return;
        }

        // Ensure player1 is always the active player
        if (controller.activePlayer === player2) {
          controller.switchTurn();
        }

        controller.attack([row, col]); // Attack the coordinate
      });

      // Check if there's a winner
      expect(controller.gameHasWinner()).toBe(true);

      // Verify that no further attacks can be made
      expect(() => controller.attack([9, 9])).toThrow();
    });
  });
});
