function shipHover(p1ShipUI, p2ShipUI) {
  const toggleHover = (action) => {
    [p1ShipUI, p2ShipUI].forEach((shipsUI) => {
      shipsUI.forEach(({ shipElement }, type) => {
        if (action === 'add') {
          shipElement.classList.add('hover-enabled');
          shipElement.setAttribute('title', type);
        } else {
          shipElement.classList.remove('hover-enabled');
          shipElement.removeAttribute('title');
        }
      });
    });
  };

  return {
    enable: () => toggleHover('add'),
    disable: () => toggleHover('remove'),
  };
}

export default shipHover;
