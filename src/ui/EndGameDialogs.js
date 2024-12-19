class EndGameDialogs {
  constructor(p1GameboardContainer, p2GameboardContainer) {
    this.p1WinnerDialog = this.createDialogBox('dialog winner', 'WINNER!', p1GameboardContainer);
    this.p2WinnerDialog = this.createDialogBox('dialog winner', 'WINNER!', p2GameboardContainer);

    this.p1LoserDialog = this.createDialogBox('dialog loser', 'LOSER!', p1GameboardContainer);
    this.p2LoserDialog = this.createDialogBox('dialog loser', 'LOSER!', p2GameboardContainer);
  }

  createDialogBox = (className, text, container) => {
    const dialog = document.createElement('div');
    dialog.classList.add(...className.split(' '));

    // Styling for the dialog container
    dialog.style.position = 'absolute';
    dialog.style.display = 'flex';
    dialog.style.justifyContent = 'center';
    dialog.style.alignItems = 'center';
    dialog.style.width = '100%';
    dialog.style.height = '100%';
    dialog.style.top = '0';
    dialog.style.left = '0';
    dialog.style.background = 'rgba(255, 255, 255, 0.7)'; /* Transparent white backdrop */
    dialog.style.zIndex = '10';
    dialog.style.border = 'none';
    dialog.style.visibility = 'hidden'; // Hide by default

    // Add content to the dialog
    const content = document.createElement('div');
    content.classList.add('dialog-content');
    content.innerText = text;

    content.style.background = ' white';
    content.style.border = '1px black solid';
    content.style.padding = '20px';

    dialog.appendChild(content);

    // Append the dialog to the container
    container.appendChild(dialog);
    return dialog;
  };

  show(winnerId) {
    if (winnerId === 1) {
      this.p1WinnerDialog.style.visibility = '';
      this.p2LoserDialog.style.visibility = '';
    } else if (winnerId === 2) {
      this.p2WinnerDialog.style.visibility = '';
      this.p1LoserDialog.style.visibility = '';
    }
  }

  hide() {
    this.p1WinnerDialog.style.visibility = 'hidden';
    this.p2WinnerDialog.style.visibility = 'hidden';
    this.p1LoserDialog.style.visibility = 'hidden';
    this.p2LoserDialog.style.visibility = 'hidden';
  }
}

export default EndGameDialogs;
