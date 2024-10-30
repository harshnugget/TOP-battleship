import Gameboard from './Gameboard';
import { jest } from '@jest/globals';

describe('Gameboard', () => {
  let gameboard;

  // Factory function for creating mock ship objects
  const mockShip = (length) => {
    return {
      length,
      hits: 0,
      get isSunk() {
        return this.hits >= this.length;
      },
      hit: jest.fn().mockImplementation(function () {
        this.hits++;
      }),
    };
  };

  beforeEach(() => {
    gameboard = new Gameboard(10); // Create a new gameboard of size 10
  });

  test('Create a gameboard with an invalid size', () => {
    expect(() => gameboard.createBoard(-10)).toThrow();
    expect(() => gameboard.createBoard('ten')).toThrow();
  });

  test('Expected gameboard size', () => {
    const checkSize = (size) => {
      gameboard.createBoard(size);
      expect(gameboard.coordinates.length).toBe(size); // Number of rows
      expect(gameboard.coordinates[0].length).toBe(size); // Number of columns
    };

    checkSize(6);
    checkSize(10);
  });

  test('Invalid coordinate boundaries', () => {
    // Expect out of bounds coordinates to throw an error
    const outOfBounds = [
      [-1, 0],
      [0, -1],
      [10, 0],
      [0, 10],
    ];

    outOfBounds.forEach((coord) => {
      expect(() => gameboard.validateCoordinates(coord)).toThrow();
    });
  });

  test('Placing a ship horizontally', () => {
    const ship = mockShip(2);

    gameboard.placeShip(ship, [0, 1], 'horizontal');
    expect(gameboard.coordinates[0][0].ship).not.toBe(ship);
    expect(gameboard.coordinates[0][1].ship).toBe(ship);
    expect(gameboard.coordinates[0][2].ship).toBe(ship);
    expect(gameboard.coordinates[0][3].ship).not.toBe(ship);

    expect(gameboard.shipPos.get(ship).coordinates.length).toBe(2);

    // Attempt to place a ship that overflows bounds
    expect(() => gameboard.placeShip(mockShip(3), [1, 8], 'horizontal')).toThrow('out of bounds');
  });

  test('Placing a ship vertically', () => {
    const ship = mockShip(2);

    gameboard.placeShip(ship, [3, 0], 'vertical');
    expect(gameboard.coordinates[4][0].ship).not.toBe(ship);
    expect(gameboard.coordinates[3][0].ship).toBe(ship);
    expect(gameboard.coordinates[2][0].ship).toBe(ship);
    expect(gameboard.coordinates[1][0].ship).not.toBe(ship);

    expect(gameboard.shipPos.get(ship).coordinates.length).toBe(2);

    // Attempt to place a ship that overflows bounds
    expect(() => gameboard.placeShip(mockShip(5), [3, 1], 'vertical')).toThrow('out of bounds');
  });

  test('Invalid ship placement', () => {
    const ship = mockShip(2);

    expect(() => gameboard.placeShip(ship, [0, 9], 'horizontal')).toThrow();
    expect(() => gameboard.placeShip(ship, [0, 0], 'vertical')).toThrow();
  });

  test('Receiving an attack at empty coordinates', () => {
    expect(gameboard.coordinates[0][0].hit).toBe(false);
    gameboard.receiveAttack([0, 0]);
    expect(gameboard.coordinates[0][0].hit).toBe(true);

    expect(gameboard.coordinates[0][1].hit).toBe(false);
    gameboard.receiveAttack([0, 1]);
    expect(gameboard.coordinates[0][1].hit).toBe(true);

    // Try to attack coordinates that have already been hit
    expect(() => gameboard.receiveAttack([0, 0])).toThrow();
  });

  test('Receiving an attack at ship coordinates', () => {
    const ship = mockShip(2);

    // Try to place ship at coordinates that have already been hit
    gameboard.receiveAttack([0, 0]);
    expect(() => gameboard.placeShip(ship, [0, 0], 'horizontal')).toThrow();

    // Place the ship at empty coordinates
    gameboard.placeShip(ship, [1, 0], 'horizontal');

    // Attack the coordinates occupied by the ship
    gameboard.receiveAttack([1, 0]);
    expect(gameboard.coordinates[1][0].hit).toBe(true);
    expect(ship.hit).toHaveBeenCalledTimes(1);
  });

  test('Sinking all ships', () => {
    const ship1 = mockShip(1);
    const ship2 = mockShip(1);

    gameboard.placeShip(ship1, [0, 0], 'horizontal');
    gameboard.placeShip(ship2, [1, 0], 'horizontal');

    expect(gameboard.allShipsSunk()).toBe(false);

    gameboard.receiveAttack([0, 0]);

    expect(gameboard.allShipsSunk()).toBe(false);

    gameboard.receiveAttack([1, 0]);

    expect(gameboard.allShipsSunk()).toBe(true);
  });

  test('Removing a ship from the board', () => {
    const ship = mockShip(3);

    gameboard.placeShip(ship, [0, 0], 'horizontal');

    expect(gameboard.shipPos.has(ship)).toBe(true);

    // Remove the ship
    gameboard.removeShip(ship);
    expect(gameboard.shipPos.has(ship)).toBe(false);
    expect(gameboard.coordinates[0][0].ship).toBe(null);
    expect(gameboard.coordinates[0][1].ship).toBe(null);
    expect(gameboard.coordinates[0][2].ship).toBe(null);

    // Remove a ship that doesn't exist on the board
    expect(() => gameboard.removeShip({})).toThrow();
  });

  test('Random ship placement', () => {
    const ship1 = mockShip(3);
    const ship2 = mockShip(10);
    const ship3 = mockShip(11);

    gameboard.placeShipRandom(ship1);
    gameboard.placeShipRandom(ship2);
    expect(() => gameboard.placeShipRandom(ship3)).toThrow();

    expect(gameboard.shipPos.get(ship1).coordinates.length).toBe(3);
    expect(gameboard.shipPos.get(ship2).coordinates.length).toBe(10);
  });
});
