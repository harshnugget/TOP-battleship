class GameboardForms {
  constructor(
    { mainBtns = [], p1Btns = [], p2Btns = [] },
    enableSinglePlayerFunc,
    disableSinglePlayerFunc,
    onSubmitFunc
  ) {
    this.mainBtns = mainBtns;
    this.p1Btns = p1Btns;
    this.p2Btns = p2Btns;
    this.enableSinglePlayer = enableSinglePlayerFunc;
    this.disableSinglePlayer = disableSinglePlayerFunc;
    this.onSubmit = onSubmitFunc;

    this.p1Form;
    this.p2Form;

    this.formsSubmitted = 0;
  }

  createForm(id) {
    const validateNameInput = (e) => {
      if (!e.target.checkValidity()) {
        e.target.title = '';

        if (e.target.validity.patternMismatch) {
          e.target.title = 'Name must contain at least one alphanumeric character.';
        }

        e.target.reportValidity();
      } else {
        e.target.setCustomValidity('');
      }
    };

    [...this.mainBtns, ...this.p1Btns, ...this.p2Btns].forEach((btn) => (btn.disabled = true));

    const form = document.createElement('form');
    form.setAttribute('id', `${id}-form`);

    const formContainer = document.createElement('div');
    formContainer.classList.add('form-container');
    formContainer.style.position = 'absolute';

    const nameInput = document.createElement('input');
    nameInput.setAttribute('id', `${id}-name-input`);
    nameInput.setAttribute('placeholder', 'Player Name');
    nameInput.setAttribute('pattern', '.*[a-zA-Z0-9].*');
    nameInput.setAttribute('maxlength', '16');
    nameInput.addEventListener('input', validateNameInput);

    const formSubmit = document.createElement('button');
    formSubmit.setAttribute('type', `submit`);
    formSubmit.setAttribute('id', `${id}-form-submit`);
    formSubmit.classList.add('form-submit');
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

      if (!nameInput.hasAttribute('required')) {
        nameInput.setAttribute('required', '');
      }

      // Validate name input
      if (!nameInput.checkValidity()) {
        nameInput.reportValidity();
        return false;
      }

      // Call onSubmit with player id and name
      if (this.onSubmit) {
        this.onSubmit({ playerId: 1, playerName: nameInput.value });
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
    this.p1Form = formContainer;
  }

  loadP2Form(container) {
    const formContainer = this.createForm('p2');
    const form = formContainer.querySelector('#p2-form');
    const nameInput = form.querySelector('#p2-name-input');

    const checkboxLabel = document.createElement('label');
    checkboxLabel.textContent = 'Single Player';
    checkboxLabel.htmlFor = 'single-player-checkbox';

    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('id', 'single-player-checkbox');

    checkboxLabel.prepend(checkbox);
    form.prepend(checkboxLabel);

    // Add event listener to disable/enable nameInput based on checkbox state
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        nameInput.setAttribute('disabled', '');
      } else {
        nameInput.removeAttribute('disabled');
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!checkbox.checked) {
        nameInput.setAttribute('required', '');

        // Validate name input
        if (!nameInput.checkValidity()) {
          nameInput.reportValidity();
          return false;
        }

        [...this.p2Btns].forEach((btn) => (btn.disabled = false));
      }

      // Call onSubmit with player id and name
      if (this.onSubmit) {
        this.onSubmit({ playerId: 2, playerName: nameInput?.value || 'AI' });
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
    this.p2Form = formContainer;
  }
}

export default GameboardForms;
