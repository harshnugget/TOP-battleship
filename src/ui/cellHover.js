function cellHover(p1Gameboard, p2Gameboard, cellClassName) {
  // Hover effects disabled by default
  let player1 = false;
  let player2 = false;

  const removeHovered = () => {
    const hoveredCell = document.querySelector(`.${cellClassName}.hover-enabled`);

    if (hoveredCell) {
      hoveredCell.classList.remove('hover-enabled');
    }
  };

  const enable = (playerId) => {
    if (playerId === 1) {
      player1 = true;
    }

    if (playerId === 2) {
      player2 = true;
    }
  };

  const disable = (playerId) => {
    removeHovered();

    if (playerId === 1) {
      player1 = false;
    }

    if (playerId === 2) {
      player2 = false;
    }
  };

  p1Gameboard.addEventListener('mouseover', (e) => {
    removeHovered();

    if (player1 === true) {
      const cell = e.target.closest(`.${cellClassName}`);

      if (cell) {
        cell.classList.add('hover-enabled');
      }
    }
  });

  p2Gameboard.addEventListener('mouseover', (e) => {
    removeHovered();

    if (player2 === true) {
      const cell = e.target.closest(`.${cellClassName}`);

      if (cell) {
        cell.classList.add('hover-enabled');
      }
    }
  });

  return { enable, disable };
}

export default cellHover;
