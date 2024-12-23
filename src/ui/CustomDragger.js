class CustomDragger {
  constructor() {
    this.draggableTargets = new Map();
    this.draggedTarget = null;
    this.dragImage = null;
    this.offsetX = 0;
    this.offsetY = 0;
    this.disabled = false;

    document.addEventListener('mousemove', (e) => {
      this.moveDragImage(e);
    });
  }

  createDragImage(target, event) {
    const dragImage = target.cloneNode(true);
    dragImage.style.position = 'absolute';
    dragImage.style.pointerEvents = 'none';
    dragImage.style.zIndex = '1000';
    dragImage.style.opacity = '0.8';
    document.body.appendChild(dragImage);
    this.dragImage = dragImage;

    const rect = target.getBoundingClientRect();
    this.offsetX = event.clientX - rect.left;
    this.offsetY = event.clientY - rect.top;
  }

  moveDragImage(event) {
    if (this.dragImage) {
      this.dragImage.style.left = `${event.clientX - this.offsetX}px`;
      this.dragImage.style.top = `${event.clientY - this.offsetY}px`;
    }
  }

  removeDragImage() {
    if (this.dragImage) {
      document.body.removeChild(this.dragImage);
      this.dragImage = null;
    }
  }

  makeDraggable(target) {
    let isDragging = false;

    target.addEventListener('mousemove', () => {
      if ((this.draggedTarget && this.draggedTarget !== target) || this.disabled) {
        target.style.cursor = '';
      } else {
        target.style.cursor = 'grab';
      }
    });

    // Drag start listener
    const dragstart = (callback) => {
      target.addEventListener('mousedown', (e) => {
        if (this.disabled) return;

        if (e.button !== 0) return;

        const mouseMoveListener = (moveEvent) => {
          if (!isDragging) {
            isDragging = true;

            this.draggedTarget = target;
            this.createDragImage(this.draggedTarget, e);
            this.moveDragImage(moveEvent);

            callback({
              clientX: moveEvent.clientX,
              clientY: moveEvent.clientY,
              target: target,
            });
          }
        };

        const mouseUpListener = () => {
          document.removeEventListener('mousemove', mouseMoveListener);
          document.removeEventListener('mouseup', mouseUpListener);
        };

        document.addEventListener('mousemove', mouseMoveListener);
        document.addEventListener('mouseup', mouseUpListener);
      });
    };

    // Drag end listener
    const dragend = (callback) => {
      document.addEventListener('mouseup', (e) => {
        if (isDragging && this.draggedTarget === target) {
          isDragging = false;
          this.draggedTarget = null;
          this.removeDragImage();

          document.body.style.cursor = '';
          callback({
            clientX: e.clientX,
            clientY: e.clientY,
            target: target,
          });
        }
      });
    };

    // Drag event listener
    const drag = (callback) => {
      document.addEventListener('mousemove', (e) => {
        if (isDragging && this.draggedTarget === target) {
          document.body.style.cursor = 'grabbing';

          callback({
            clientX: e.clientX,
            clientY: e.clientY,
            target: target,
          });
        }
      });
    };

    this.draggableTargets.set(target, { dragstart, dragend, drag });
  }

  listener(func, target, callback) {
    const dragTarget = this.draggableTargets.get(target);
    dragTarget[func](callback);
  }
}

export default CustomDragger;
