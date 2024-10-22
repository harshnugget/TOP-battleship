import Player from './Player';

describe('Player', () => {
  let player1, player2;

  beforeAll(() => {
    player1 = new Player('Player 1');
    player2 = new Player('Player 2');

    player1.opponent = player2;
    player2.opponent = player1;
  });

  test('Setting an opponent', () => {
    expect(player1.opponent).toBe(player2.name);

    // Set an opponent that isn't an instance of Player
    expect(() => (player1.opponent = { name: 'Player 2' })).toThrow();
    expect(player2.opponent).toBe(player1.name);
  });

  describe('Placing, removing and attacking ships', () => {
    const removeShipsFromBoard = (player) => {
      let shipsOnBoard = player.ships.filter((ship) => ship.coords !== null);

      if (shipsOnBoard) {
        shipsOnBoard.forEach((ship) => {
          player.removeShip(ship.type);
        });
      }
    };

    test('Place a ship', () => {
      player2.placeShip('cruiser', [2, 1], 'horizontal');
      const { coordinates, length } = player2.getShipData('cruiser');

      // Expect the array of coordinates to equal the ship's length
      expect(coordinates.length).toBe(length);

      expect(coordinates[0][0]).toBe(2);
      expect(coordinates[0][1]).toBe(1);
    });

    test('Remove a ship', () => {
      player1.placeShip('cruiser', [2, 1], 'horizontal');
      player1.removeShip('cruiser');

      const { coordinates } = player1.getShipData('cruiser');
      expect(coordinates).toBe(null);
    });

    test('Attack a ship', () => {
      player1.placeShip('destroyer', [2, 2], 'vertical');

      expect(player2.attack([2, 3])).toBe(false); // Miss
      expect(player2.attack([2, 2])).toBe(true); // Hit

      // Attacking the same location
      expect(() => player2.attack([2, 2])).toThrow();
    });

    test('Sink a ship', () => {
      removeShipsFromBoard(player1);

      // Expect an error if no ships on board to check
      expect(() => player1.hasLost()).toThrow();

      // Place a ship and sink it
      player1.placeShip('cruiser', [0, 0], 'horizontal');

      expect(player1.hasLost()).toBe(false);
      expect(player2.attack([0, 0])).toBe(true); // Hit #1
      expect(player2.attack([0, 1])).toBe(true); // Hit #2
      expect(player2.attack([0, 2])).toBe(true); // Hit #3 - sinks ship
      expect(player1.hasLost()).toBe(true);
    });

    test('Place a ship out of bounds by overflow', () => {
      removeShipsFromBoard(player1);
      removeShipsFromBoard(player2);

      expect(() => player1.placeShip('carrier', [0, 6], 'horizontal')).toThrow();
      expect(() => player1.placeShip('carrier', [3, 0], 'vertical')).toThrow();
    });
  });

  test('Resetting', () => {
    player1.placeShip('submarine', [4, 4], 'horizontal');

    let shipsOnBoard = player1.ships.filter((ship) => ship.coords !== null);

    expect(shipsOnBoard.length).toBeGreaterThanOrEqual(1);
    expect(player1.opponent).not.toBe(null);

    // Reset player data
    player1.reset();

    shipsOnBoard = player1.ships.filter((ship) => ship.coords !== null);
    expect(shipsOnBoard.length).toBe(0);
    expect(player1.opponent).toBe(null);
  });
});
