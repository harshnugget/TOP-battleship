import Battleship from './Battleship.js';
import GameboardUI from './ui/GameboardUI.js';
import ShipUI from './ui/ShipUI.js';

class BattleshipUI extends Battleship {
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
}

export default BattleshipUI;
