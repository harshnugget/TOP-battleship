class GameboardForms {
  constructor(
    { mainBtns = [], p1Btns = [], p2Btns = [] },
    enableSinglePlayerFunc,
    disableSinglePlayerFunc
  ) {
    this.mainBtns = mainBtns;
    this.p1Btns = p1Btns;
    this.p2Btns = p2Btns;
    this.enableSinglePlayer = enableSinglePlayerFunc;
    this.disableSinglePlayer = disableSinglePlayerFunc;

    this.p1Form;
    this.p2Form;

    this.formsSubmitted = 0;
  }

  createForm(id) {
    // Disable buttons
    [...this.mainBtns].forEach((btn) => (btn.disabled = true));
    [...this.p1Btns].forEach((btn) => (btn.disabled = true));
    [...this.p2Btns].forEach((btn) => (btn.disabled = true));

    const form = document.createElement('form');
    form.id = `${id}-form`;

    const formContainer = document.createElement('div');
    formContainer.classList.add('form-container');
    formContainer.style.position = 'absolute';

    const nameInput = document.createElement('input');
    nameInput.id = `${id}-name-input`;
    nameInput.placeholder = `Player Name`;

    const formSubmit = document.createElement('button');
    formSubmit.id = `${id}-form-submit`;
    formSubmit.textContent = 'Submit';

    form.append(nameInput, formSubmit);
    formContainer.append(form);

    return formContainer;
  }

  loadP1Form(container) {
    const formContainer = this.createForm('p1');
    const form = formContainer.querySelector('#p1-form');
    const nameInput = form.querySelector('#p1-name-input');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!nameInput.value.trim()) {
        alert('Player name is required.');
        return;
      }

      // Enable player buttons
      [...this.p1Btns].forEach((btn) => (btn.disabled = false));

      formContainer.remove();

      this.formsSubmitted++;

      if (this.formsSubmitted >= 2) {
        // Enable start/reset buttons
        [...this.mainBtns].forEach((btn) => (btn.disabled = false));
      }
    });

    container.style.position = 'relative';
    container.append(formContainer);
    this.p1Form = form;
  }

  loadP2Form(container) {
    const formContainer = this.createForm('p2');
    const form = formContainer.querySelector('#p2-form');
    const nameInput = form.querySelector('#p2-name-input');

    const checkboxLabel = document.createElement('label');
    checkboxLabel.textContent = 'Single Player';
    checkboxLabel.htmlFor = 'single-player-checkbox';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'single-player-checkbox';

    checkboxLabel.prepend(checkbox);
    form.prepend(checkboxLabel);

    // Add event listener to disable/enable nameInput based on checkbox state
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        nameInput.value = ''; // Clear input value when disabling
        nameInput.setAttribute('disabled', '');
      } else {
        nameInput.removeAttribute('disabled');
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!checkbox.checked && !nameInput.value.trim()) {
        alert('Player name is required.');
        return;
      }

      // Enable player buttons
      if (!checkbox.checked) {
        [...this.p2Btns].forEach((btn) => (btn.disabled = false));
      }

      formContainer.remove();

      if (checkbox.checked) {
        console.log('Single player enabled');
        this.enableSinglePlayer();
      } else {
        this.disableSinglePlayer();
      }

      this.formsSubmitted++;

      if (this.formsSubmitted >= 2) {
        // Enable start/reset buttons
        [...this.mainBtns].forEach((btn) => (btn.disabled = false));
      }
    });

    container.style.position = 'relative';
    container.append(formContainer);
    this.p2Form = form;
  }
}

export default GameboardForms;