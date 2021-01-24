import {
  addEvent,
  find,
} from '../common';
import DragHelper from '../drag-helper';
import globalOptions from '../global-options';
import TextHandler from '../text-handler';
import setSelection from './set-selection';

/**
   *
   * @param {*} context
   * @param {*} shape
   */
function bindEvent(context, shape) {
  const cache = {};

  if (shape === 'Pencil' || shape === 'Marker') {
    globalOptions.lineCap =
        globalOptions.lineJoin =
        'round';
  }

  addEvent(context.canvas, 'click', function() {
    // pdfHandler.pdfPageContainer.style.display = 'none';

    if (TextHandler.text.length) {
      TextHandler.appendPoints();
    }

    if (shape === 'Text') {
      TextHandler.onShapeSelected();
    } else {
      TextHandler.onShapeUnSelected();
    }

    if (shape === 'Pencil' || shape === 'Marker') {
      globalOptions.lineCap =
        globalOptions.lineJoin =
        'round';
    }

    DragHelper.global.startingIndex = 0;

    setSelection(this, shape);

    if (this.id === 'drag-last-path') {
      find('copy-last').checked = true;
      find('copy-all').checked = false;
    } else if (this.id === 'drag-all-paths') {
      find('copy-all').checked = true;
      find('copy-last').checked = false;
    }

    if (this.id === 'image-icon') {
      const selector = new FileSelector();
      selector.accept = 'image/*';
      selector.selectSingleFile(function(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
          const image = new Image();
          image.onload = function() {
            const index = imageHandler.images.length;

            imageHandler.lastImageURL = image.src;
            imageHandler.lastImageIndex = index;

            imageHandler.images.push(image);
            imageHandler.load(image.clientWidth, image.clientHeight);
          };
          image.style =
                'position: absolute; top: -99999999999; left: -999999999;';
          document.body.appendChild(image);
          image.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    if (this.id === 'pdf-icon') {
      const selector = new FileSelector();
      selector.selectSingleFile(function(file) {
        if (!file) return;

        /**
           *
           */
        function onGettingPdf() {
          const reader = new FileReader();
          reader.onload = function(event) {
            pdfHandler.pdf = null; // to make sure we call "getDocument" again
            pdfHandler.load(event.target.result);
          };
          reader.readAsDataURL(file);
        }
        onGettingPdf();
      }, null, 'application/pdf');
    }

    if (
      this.id === 'pencil-icon' ||
        this.id === 'eraser-icon' ||
        this.id === 'marker-icon'
    ) {
      cache.lineCap = globalOptions.lineCap;
      cache.lineJoin = globalOptions.lineJoin;

      globalOptions.lineCap = globalOptions.lineJoin = 'round';
    } else if (cache.lineCap && cache.lineJoin) {
      globalOptions.lineCap = cache.lineCap;
      globalOptions.lineJoin = cache.lineJoin;
    }

    if (this.id === 'eraser-icon') {
      cache.strokeStyle = globalOptions.pencilStrokeStyle; // strokeStyle;
      cache.fillStyle = globalOptions.fillStyle;
      cache.lineWidth = globalOptions.pencilLineWidth;

      // strokeStyle = 'White';
      // fillStyle = 'White';
      // lineWidth = 10;
    } else if (
      cache.strokeStyle &&
        cache.fillStyle &&
        typeof cache.lineWidth !== 'undefined'
    ) {
      strokeStyle = cache.strokeStyle;
      fillStyle = cache.fillStyle;
      lineWidth = cache.lineWidth;
    }
  });
}

export default bindEvent;
