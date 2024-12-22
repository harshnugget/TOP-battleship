function createPlayerHeaders() {
  const createHeader = (playerId) => {
    const className = `p${playerId}-header-container`;
    const headerContainer = document.createElement('div');
    const playerHeader = document.createElement('h3');
    const nameHeader = document.createElement('h3');

    headerContainer.classList.add(className);
    playerHeader.innerText = `Player ${playerId}`;
    playerHeader.classList.add('player-header');
    nameHeader.classList.add('name-header');

    headerContainer.append(playerHeader, nameHeader);
    return headerContainer;
  };

  const player1 = createHeader(1);
  const player2 = createHeader(2);

  return { player1, player2 };
}

export default createPlayerHeaders;
