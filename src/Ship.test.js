import Ship from './Ship';

describe('Ship', () => {
  test('Create a ship with the correct length', () => {
    const ship = new Ship(4); // Create a ship of length 4
    expect(ship.length).toBe(4); // Check ship length
    expect(ship.hits).toBe(0); // Initially, no hits
    expect(ship.isSunk).toBe(false); // Ship should not be sunk
  });

  test('Throw an error for invalid ship length', () => {
    expect(() => new Ship(0)).toThrow('Invalid length: 0');
    expect(() => new Ship(-3)).toThrow('Invalid length: -3');
    expect(() => new Ship(null)).toThrow();
    expect(() => new Ship(undefined)).toThrow();
  });

  test('Record a hit on the ship', () => {
    const ship = new Ship(3);
    ship.hit(); // Record one hit
    expect(ship.hits).toBe(1); // Ship should have 1 hit
    expect(ship.isSunk).toBe(false); // Ship should not be sunk yet
  });

  test('Sink the ship when hits equal its length', () => {
    const ship = new Ship(2);
    ship.hit(); // Record one hit
    ship.hit(); // Ship length is 2, so 2 hits should sink it
    expect(ship.hits).toBe(2); // Ship has 2 hits
    expect(ship.isSunk).toBe(true); // Ship should be sunk
  });

  test('Throw an error when trying to hit a sunk ship', () => {
    const ship = new Ship(1);
    ship.hit(); // Sink the ship with one hit
    expect(() => ship.hit()).toThrow('Cannot hit a ship that is already sunk!');
  });
});
