import Player from '../Player';
import { jest } from '@jest/globals';

describe('Player', () => {
  let player1;
  let player2;
  let player1Gameboard;
  let player2Gameboard;

  const mockGameboard = (size) => {
    return {
      size,
      coordinates: [
        [null, null, null],
        [null, null, null],
      ],
      receiveAttack: jest.fn().mockImplementation(function ([row, col]) {
        this.coordinates[row][col] = 1;
      }),
      resetBoard: jest.fn().mockImplementation(function () {
        this.coordinates.forEach((row, rowIndex) => {
          row.forEach((_, colIndex) => {
            this.coordinates[rowIndex][colIndex] = null;
          });
        });
      }),
    };
  };

  beforeAll(() => {
    player1Gameboard = mockGameboard(10);
    player2Gameboard = mockGameboard(10);

    player1 = new Player('Player 1', player1Gameboard);
    player2 = new Player('Player 2', player2Gameboard);

    player1.opponent = player2;
    player2.opponent = player1;
  });

  test('Setting an opponent', () => {
    expect(player1.opponent).toBe(player2);

    // Set an opponent that isn't an instance of Player
    expect(() => (player1.opponent = { name: 'Player 2' })).toThrow();
    expect(player2.opponent).toBe(player1);
  });

  test('Receive an attack', () => {
    expect(player2Gameboard.coordinates[0][1]).toBe(null);

    player1.attack([0, 1]);
    expect(player2Gameboard.coordinates[0][1]).toBe(1);
  });

  test('Resetting', () => {
    player2.attack([0, 0]);

    expect(player1Gameboard.coordinates[0][0]).toBe(1);

    player1.reset();

    expect(player1.opponent).toBe(null);
    expect(player1Gameboard.resetBoard).toHaveBeenCalledTimes(1);
    expect(player1Gameboard.coordinates[0][0]).toBe(null);
  });
});
