import GameController from '../GameController';
import Player from '../Player';

describe('Game Controller', () => {
  let controller, player1, player2;

  const getPlayerShips = (player) => {
    return player.ships;
  };

  const getShipData = (ship) => {
    const type = ship?.type || null;
    const hits = ship?.hits || null;
    const length = ship?.length || null;
    const orientation = ship?.orientation || null;
    const coordinates = ship?.coordinates || null;

    return { type, hits, length, orientation, coordinates };
  };

  beforeAll(() => {
    player1 = new Player('Player 1');
    player2 = new Player('Player 2');
    controller = new GameController(player1, player2);
  });

  test('Game is ready to begin', () => {
    // Initially, the game should not be ready as no ships are placed
    expect(() => controller.gameIsReady()).toThrow();

    // Place all players ships on their board
    [player1, player2].forEach((player) => {
      [...getPlayerShips(player)].forEach((ship, index) => {
        const row = index;
        const col = 0;

        const shipData = getShipData(ship);
        player.placeShip(shipData.type, [row, col]);
      });
    });

    // After placing all ships, the game should be ready
    expect(() => controller.gameIsReady()).not.toThrow();
  });

  test('Switching turns', () => {
    expect(controller.activePlayer).toBe(player1);
    controller.switchTurn();
    expect(controller.activePlayer).toBe(player2);
    controller.switchTurn();
    expect(controller.activePlayer).toBe(player1);
  });

  describe('Attacking', () => {
    test('Attempt to attack when not all ships are placed', () => {
      const player2Ship = getPlayerShips(player2)[0];
      const { type, coordinates } = getShipData(player2Ship);

      controller.player2.removeShip(type);

      expect(() => controller.attack([0, 0])).toThrow();

      controller.player2.placeShip(type, coordinates[0]);
    });

    test('Missed a target', () => {
      expect(controller.activePlayer).toBe(player1);

      expect(controller.attack([9, 0])).toBe(false);
      expect(controller.activePlayer).toBe(player2);

      expect(controller.attack([0, 9])).toBe(false);
      expect(controller.activePlayer).toBe(player1);

      // Check player1 missed shots
      expect(controller.shotHistory.get(player1).missedShots[0][0]).toBe(9); // row
      expect(controller.shotHistory.get(player1).missedShots[0][1]).toBe(0); // col

      // Check player2 missed shots
      expect(controller.shotHistory.get(player2).missedShots[0][0]).toBe(0); // row
      expect(controller.shotHistory.get(player2).missedShots[0][1]).toBe(9); // col
    });

    test('Hit a target', () => {
      expect(controller.attack([1, 0])).toBe(true);
      expect(controller.attack([1, 1])).toBe(true);

      // Check player1 successful shots
      expect(controller.shotHistory.get(player1).successfulShots[0][0]).toBe(1); // row
      expect(controller.shotHistory.get(player1).successfulShots[0][1]).toBe(0); // col

      // Check player2 successful shots
      expect(controller.shotHistory.get(player2).successfulShots[0][0]).toBe(1); // row
      expect(controller.shotHistory.get(player2).successfulShots[0][1]).toBe(1); // col
    });

    test('Win a game', () => {
      // Get coordinates of player2's successful shots
      const hitCoordinates = controller.shotHistory.get(player2).successfulShots;

      // Get coordinates of player2's ships
      const shipCoordinates = [];
      const player2Ships = getPlayerShips(player2);

      [...player2Ships].forEach((ship) => {
        const { coordinates } = getShipData(ship);
        coordinates.forEach((coord) => shipCoordinates.push(coord));
      });

      // Sink all of player2's ships until player2 wins
      shipCoordinates.forEach((coord) => {
        const row = coord[0];
        const col = coord[1];

        // Skip coordinates that have already been hit
        if (hitCoordinates.some((hitCoord) => hitCoord[0] === row && hitCoord[1] === col)) {
          return; // Skip already hit coordinates
        }

        // Ensure player2 is always the active player
        if (controller.activePlayer === player1) {
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
