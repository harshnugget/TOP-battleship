import './style.css';
import Battleship from './Battleship.js';
import BattleshipUI from './BattleshipUI.js';

const battleship = new Battleship('Player 1');
const battleshipUI = new BattleshipUI(battleship);
window.game = battleship;
window.gameUI = battleshipUI;

battleshipUI.load(document.querySelector('main'));
