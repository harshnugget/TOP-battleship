class CustomDragger {
  constructor() {
    this.draggableTargets = new Map();
    this.disabled = false;
  }

  // Create the drag image to follow the mouse cursor
  createDragImage(target, event) {
    const rect = target.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    const dragImage = target.cloneNode(true);
    Object.assign(dragImage.style, {
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: '1000',
      opacity: '0.8',
      left: `${event.clientX - offsetX}px`,
      top: `${event.clientY - offsetY}px`,
    });

    document.body.append(dragImage);

    const onMouseMove = (e) => {
      dragImage.style.left = `${e.clientX - offsetX}px`;
      dragImage.style.top = `${e.clientY - offsetY}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.body.removeChild(dragImage);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp, { once: true });
  }

  // Add event listeners to make a target draggable
  makeDraggable(target) {
    if (this.draggableTargets.has(target)) return;

    const callbacks = { dragStart: null, drag: null, dragEnd: null };
    this.draggableTargets.set(target, callbacks);

    let isDragging = false;

    const onMouseEnter = () => {
      if (!this.disabled) {
        document.body.style.cursor = 'grab';
      }
    };

    const onMouseLeave = () => {
      document.body.style.cursor = '';
    };

    const onMouseDown = (e) => {
      if (this.disabled || e.button !== 0) return;

      document.body.style.cursor = 'grabbing';

      // Start the drag event
      const onMouseMove = (e) => {
        if (!isDragging) {
          isDragging = true;
          this.createDragImage(target, e);
          callbacks.dragStart?.({ clientX: e.clientX, clientY: e.clientY, target });
        } else {
          callbacks.drag?.({ clientX: e.clientX, clientY: e.clientY, target });
        }
      };

      // End the drag event
      const onMouseUp = (e) => {
        if (isDragging) {
          isDragging = false;
          callbacks.dragEnd?.({ clientX: e.clientX, clientY: e.clientY, target });
        }
        document.body.style.cursor = 'grab';
        document.removeEventListener('mousemove', onMouseMove);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp, { once: true });
    };

    target.addEventListener('mouseenter', onMouseEnter);
    target.addEventListener('mouseleave', onMouseLeave);
    target.addEventListener('mousedown', onMouseDown);
  }

  // Set or update callbacks for drag events
  setCallback(target, type, callback) {
    if (!this.draggableTargets.has(target)) {
      this.makeDraggable(target);
    }
    this.draggableTargets.get(target)[type] = callback;
  }

  dragStart(target, callback) {
    this.setCallback(target, 'dragStart', callback);
  }

  drag(target, callback) {
    this.setCallback(target, 'drag', callback);
  }

  dragEnd(target, callback) {
    this.setCallback(target, 'dragEnd', callback);
  }
}

export default CustomDragger;
