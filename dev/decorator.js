import {
  is,
  addEvent,
  hexToRGB,
  endLastPath,
  find,
  common,
} from './common';
import {dataURIs} from './data-uris';
import DragHelper from './drag-helper';
import globalOptions from './global-options';
import TextHandler from './text-handler';

let tools = {
  line: true,
  arrow: true,
  pencil: true,
  marker: true,
  dragSingle: true,
  dragMultiple: true,
  eraser: true,
  rectangle: true,
  arc: true,
  bezier: true,
  quadratic: true,
  text: true,
  image: true,
  pdf: true,
  zoom: true,
  lineWidth: true,
  colorsPicker: true,
  extraOptions: true,
  code: true,
  undo: true,
};

if (params.tools) {
  try {
    const t = JSON.parse(params.tools);
    tools = t;
  } catch (e) {}
}

if (tools.code === true) {
  document.querySelector('.preview-panel').style.display = 'block';
}

/**
 *
 * @param {*} element
 * @param {*} prop
 */
function setSelection(element, prop) {
  endLastPath();
  hideContainers();

  is.set(prop);

  const selected = document.getElementsByClassName('selected-shape')[0];
  if (selected) {
    selected.className = selected.className.replace(/selected-shape/g, '');
  }

  if (!element.className) {
    element.className = '';
  }

  element.className += ' selected-shape';
}

/* Default: setting default selected shape!! */
is.set(window.selectedIcon);

/**
 *
 */
function setDefaultSelectedIcon() {
  const toolBox = document.getElementById('tool-box');
  const canvasElements = toolBox.getElementsByTagName('canvas');
  const shape = window.selectedIcon.toLowerCase();

  let firstMatch;
  for (let i = 0; i < canvasElements.length; i++) {
    if (!firstMatch && (canvasElements[i].id || '').indexOf(shape) !== -1) {
      firstMatch = canvasElements[i];
    }
  }
  if (!firstMatch) {
    window.selectedIcon = 'Pencil';
    firstMatch = document.getElementById('pencil-icon');
  }

  setSelection(firstMatch, window.selectedIcon);
}

window.addEventListener('load', function() {
  setDefaultSelectedIcon();
}, false);

(function() {
  const cache = {};

  const lineCapSelect = find('lineCap-select');
  const lineJoinSelect = find('lineJoin-select');

  /**
   *
   * @param {*} id
   * @return {*}
   */
  function getContext(id) {
    const context = find(id).getContext('2d');
    context.lineWidth = 2;
    context.strokeStyle = '#6c96c8';
    return context;
  }

  /**
   *
   * @param {*} context
   * @param {*} shape
   */
  function bindEvent(context, shape) {
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
        cache.strokeStyle = strokeStyle;
        cache.fillStyle = fillStyle;
        cache.lineWidth = lineWidth;

        strokeStyle = 'White';
        fillStyle = 'White';
        lineWidth = 10;
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

  const toolBox = find('tool-box');
  // console.log(toolBox);
  toolBox.style.height = (innerHeight) + 'px'; // -toolBox.offsetTop - 77

  /**
   *
   */
  function decorateDragLastPath() {
    const context = getContext('drag-last-path');

    const image = new Image();
    image.onload = function() {
      context.drawImage(image, 4, 4, 32, 32);
      bindEvent(context, 'DragLastPath');
    };
    image.src = dataURIs.dragSingle;
  }

  decorateDragLastPath();

  if (tools.dragSingle === true) {
    document.getElementById('drag-last-path').style.display = 'block';
  }

  /**
   *
   */
  function decorateDragAllPaths() {
    const context = getContext('drag-all-paths');

    const image = new Image();
    image.onload = function() {
      context.drawImage(image, 4, 4, 32, 32);
      bindEvent(context, 'DragAllPaths');
    };
    image.src = dataURIs.dragMultiple;
  }

  decorateDragAllPaths();

  if (tools.dragMultiple === true) {
    document.getElementById('drag-all-paths').style.display = 'block';
  }

  /**
   *
   */
  function decorateLine() {
    const context = getContext('line');

    const image = new Image();
    image.onload = function() {
      context.drawImage(image, 4, 4, 32, 32);
      bindEvent(context, 'Line');
    };
    image.src = dataURIs.line;
  }

  if (tools.line === true) {
    decorateLine();
    document.getElementById('line').style.display = 'block';
  }

  /**
   *
   */
  function decorateUndo() {
    const context = getContext('undo');

    const image = new Image();
    image.onload = function() {
      context.drawImage(image, 4, 4, 32, 32);

      document.querySelector('#undo').onclick = function() {
        if (points.length) {
          points.length = points.length - 1;
          drawHelper.redraw();
        }

        // share to webrtc
        syncPoints(true);
      };
    };
    image.src = dataURIs.undo;
  }

  if (tools.undo === true) {
    decorateUndo();
    document.getElementById('undo').style.display = 'block';
  }

  /**
   *
   */
  function decorateArrow() {
    const context = getContext('arrow');

    const image = new Image();
    image.onload = function() {
      context.drawImage(image, 4, 4, 32, 32);
      bindEvent(context, 'Arrow');
    };
    image.src = dataURIs.arrow;
  }

  if (tools.arrow === true) {
    decorateArrow();
    document.getElementById('arrow').style.display = 'block';
  }

  /**
   *
   */
  function decoreZoomUp() {
    const context = getContext('zoom-up');
    // zoomHandler.icons.up(context);
    addEvent(context.canvas, 'click', function() {
      zoomHandler.up();
    });

    const image = new Image();
    image.onload = function() {
      context.drawImage(image, 4, 4, 32, 32);
    };
    image.src = dataURIs.zoom_in;
  }

  /**
   *
   */
  function decoreZoomDown() {
    const context = getContext('zoom-down');
    // zoomHandler.icons.down(context);
    addEvent(context.canvas, 'click', function() {
      zoomHandler.down();
    });

    const image = new Image();
    image.onload = function() {
      context.drawImage(image, 4, 4, 32, 32);
    };
    image.src = dataURIs.zoom_out;
  }

  if (tools.zoom === true) {
    decoreZoomUp();
    decoreZoomDown();

    document.getElementById('zoom-up').style.display = 'block';
    document.getElementById('zoom-down').style.display = 'block';
  }

  /**
   *
   */
  function decoratePencil() {
    /**
     *
     * @param {*} h
     * @param {*} alpha
     * @return {*}
     */
    function hexToRGBA(h, alpha) {
      return 'rgba(' + hexToRGB(h).join(',') + ',1)';
    }

    const colors = [
      ['FFFFFF', '006600', '000099', 'CC0000', '8C4600'],
      ['CCCCCC', '00CC00', '6633CC', 'FF0000', 'B28500'],
      ['666666', '66FFB2', '006DD9', 'FF7373', 'FF9933'],
      ['333333', '26FF26', '6699FF', 'CC33FF', 'FFCC99'],
      ['000000', 'CCFF99', 'BFDFFF', 'FFBFBF', 'FFFF33'],
    ];

    const context = getContext('pencil-icon');

    const image = new Image();
    image.onload = function() {
      context.drawImage(image, 4, 4, 32, 32);
      bindEvent(context, 'Pencil');
    };
    image.src = dataURIs.pencil;

    const pencilContainer = find('pencil-container');
    const pencilColorContainer = find('pencil-fill-colors');
    const strokeStyleText = find('pencil-stroke-style');
    const pencilColorsList = find('pencil-colors-list');
    const fillStyleText = find('pencil-fill-style');
    const pencilSelectedColor = find('pencil-selected-color');
    const pencilSelectedColor2 = find('pencil-selected-color-2');
    const btnPencilDone = find('pencil-done');
    const canvas = context.canvas;
    const alpha = 0.2;

    // START INIT PENCIL


    globalOptions.pencilStrokeStyle = hexToRGBA(fillStyleText.value, alpha);

    pencilSelectedColor.style.backgroundColor =
      pencilSelectedColor2.style.backgroundColor = '#' + fillStyleText.value;

    colors.forEach(function(colorRow) {
      let row = '<tr>';

      colorRow.forEach(function(color) {
        row += '<td style="background-color:#' + color +
          '" data-color="' + color + '"></td>';
      });
      row += '</tr>';

      pencilColorsList.innerHTML += row;
    });

    Array.prototype.slice.call(
      pencilColorsList.getElementsByTagName('td'),
    ).forEach(function(td) {
      addEvent(td, 'mouseover', function() {
        const elColor = td.getAttribute('data-color');
        pencilSelectedColor2.style.backgroundColor = '#' + elColor;
        fillStyleText.value = elColor;
      });

      addEvent(td, 'click', function() {
        const elColor = td.getAttribute('data-color');
        pencilSelectedColor.style.backgroundColor =
                    pencilSelectedColor2.style.backgroundColor = '#' + elColor;

        fillStyleText.value = elColor;


        pencilColorContainer.style.display = 'none';
      });
    });

    // END INIT PENCIL

    addEvent(canvas, 'click', function() {
      hideContainers();

      pencilContainer.style.display = 'block';
      pencilContainer.style.top = (canvas.offsetTop + 1) + 'px';
      pencilContainer.style.left =
        (canvas.offsetLeft + canvas.clientWidth) + 'px';

      fillStyleText.focus();
    });

    addEvent(btnPencilDone, 'click', function() {
      pencilContainer.style.display = 'none';
      pencilColorContainer.style.display = 'none';

      pencilLineWidth = strokeStyleText.value;
      pencilStrokeStyle = hexToRGBA(fillStyleText.value, alpha);
    });

    addEvent(pencilSelectedColor, 'click', function() {
      pencilColorContainer.style.display = 'block';
    });
  }

  if (tools.pencil === true) {
    decoratePencil();
    document.getElementById('pencil-icon').style.display = 'block';
  }

  /**
   *
   */
  function decorateMarker() {
    /**
     *
     * @param {*} h
     * @param {*} alpha
     * @return {String}
     */
    function hexToRGBA(h, alpha) {
      return 'rgba(' + hexToRGB(h).join(',') + ',' + alpha + ')';
    }
    const colors = [
      ['FFFFFF', '006600', '000099', 'CC0000', '8C4600'],
      ['CCCCCC', '00CC00', '6633CC', 'FF0000', 'B28500'],
      ['666666', '66FFB2', '006DD9', 'FF7373', 'FF9933'],
      ['333333', '26FF26', '6699FF', 'CC33FF', 'FFCC99'],
      ['000000', 'CCFF99', 'BFDFFF', 'FFBFBF', 'FFFF33'],
    ];

    const context = getContext('marker-icon');

    const image = new Image();
    image.onload = function() {
      context.drawImage(image, 4, 4, 32, 32);
      bindEvent(context, 'Marker');
    };
    image.src = dataURIs.marker;

    const markerContainer = find('marker-container');
    const markerColorContainer = find('marker-fill-colors');
    const strokeStyleText = find('marker-stroke-style');
    const markerColorsList = find('marker-colors-list');
    const fillStyleText = find('marker-fill-style');
    const markerSelectedColor = find('marker-selected-color');
    const markerSelectedColor2 = find('marker-selected-color-2');
    const btnMarkerDone = find('marker-done');
    const canvas = context.canvas;
    const alpha = 0.2;

    // START INIT MARKER


    globalOptions.markerStrokeStyle = hexToRGBA(fillStyleText.value, alpha);

    markerSelectedColor.style.backgroundColor =
      markerSelectedColor2.style.backgroundColor = '#' + fillStyleText.value;

    colors.forEach(function(colorRow) {
      let row = '<tr>';

      colorRow.forEach(function(color) {
        row += '<td style="background-color:#' + color +
          '" data-color="' + color + '"></td>';
      });
      row += '</tr>';

      markerColorsList.innerHTML += row;
    });

    Array.prototype.slice.call(
      markerColorsList.getElementsByTagName('td'),
    ).forEach(function(td) {
      addEvent(td, 'mouseover', function() {
        const elColor = td.getAttribute('data-color');
        markerSelectedColor2.style.backgroundColor = '#' + elColor;
        fillStyleText.value = elColor;
      });

      addEvent(td, 'click', function() {
        const elColor = td.getAttribute('data-color');
        markerSelectedColor.style.backgroundColor =
                    markerSelectedColor2.style.backgroundColor = '#' + elColor;

        fillStyleText.value = elColor;


        markerColorContainer.style.display = 'none';
      });
    });

    // END INIT MARKER

    addEvent(canvas, 'click', function() {
      hideContainers();

      markerContainer.style.display = 'block';
      markerContainer.style.top = (canvas.offsetTop + 1) + 'px';
      markerContainer.style.left =
        (canvas.offsetLeft + canvas.clientWidth) + 'px';

      fillStyleText.focus();
    });

    addEvent(btnMarkerDone, 'click', function() {
      markerContainer.style.display = 'none';
      markerColorContainer.style.display = 'none';

      markerLineWidth = strokeStyleText.value;
      markerStrokeStyle = hexToRGBA(fillStyleText.value, alpha);
    });

    addEvent(markerSelectedColor, 'click', function() {
      markerColorContainer.style.display = 'block';
    });
  }

  if (tools.marker === true) {
    decorateMarker();
    document.getElementById('marker-icon').style.display = 'block';
  }

  /**
   *
   */
  function decorateEraser() {
    const context = getContext('eraser-icon');

    const image = new Image();
    image.onload = function() {
      context.drawImage(image, 4, 4, 32, 32);
      bindEvent(context, 'Eraser');
    };
    image.src = dataURIs.eraser;
  }

  if (tools.eraser === true) {
    decorateEraser();
    document.getElementById('eraser-icon').style.display = 'block';
  }

  /**
   *
   */
  function decorateText() {
    const context = getContext('text-icon');

    const image = new Image();
    image.onload = function() {
      context.drawImage(image, 4, 4, 32, 32);
      bindEvent(context, 'Text');
    };
    image.src = dataURIs.text;
  }

  if (tools.text === true) {
    decorateText();
    document.getElementById('text-icon').style.display = 'block';
  }

  /**
   *
   */
  function decorateImage() {
    const context = getContext('image-icon');

    const image = new Image();
    image.onload = function() {
      context.drawImage(image, 4, 4, 32, 32);
      bindEvent(context, 'Image');
    };
    image.src = dataURIs.image;
  }

  if (tools.image === true) {
    decorateImage();
    document.getElementById('image-icon').style.display = 'block';
  }


  /**
   *
   */
  function decoratePDF() {
    const context = getContext('pdf-icon');

    const image = new Image();
    image.onload = function() {
      context.drawImage(image, 4, 4, 32, 32);
      bindEvent(context, 'Pdf');
    };
    image.src = dataURIs.pdf;
  }

  if (tools.pdf === true) {
    decoratePDF();
    document.getElementById('pdf-icon').style.display = 'block';
  }

  /**
   *
   */
  function decorateArc() {
    const context = getContext('arc');

    const image = new Image();
    image.onload = function() {
      context.drawImage(image, 4, 4, 32, 32);
      bindEvent(context, 'Arc');
    };
    image.src = dataURIs.arc;
  }

  if (tools.arc === true) {
    decorateArc();
    document.getElementById('arc').style.display = 'block';
  }

  /**
   *
   */
  function decorateRect() {
    const context = getContext('rectangle');

    const image = new Image();
    image.onload = function() {
      context.drawImage(image, 4, 4, 32, 32);
      bindEvent(context, 'Rectangle');
    };
    image.src = dataURIs.rectangle;
  }

  if (tools.rectangle === true) {
    decorateRect();
    document.getElementById('rectangle').style.display = 'block';
  }

  /**
   *
   */
  function decorateQuadratic() {
    const context = getContext('quadratic-curve');

    const image = new Image();
    image.onload = function() {
      context.drawImage(image, 4, 4, 32, 32);
      bindEvent(context, 'QuadraticCurve');
    };
    image.src = dataURIs.quadratic;
  }

  if (tools.quadratic === true) {
    decorateQuadratic();
    document.getElementById('quadratic-curve').style.display = 'block';
  }

  /**
   *
   */
  function decorateBezier() {
    const context = getContext('bezier-curve');

    const image = new Image();
    image.onload = function() {
      context.drawImage(image, 4, 4, 32, 32);
      bindEvent(context, 'Bezier');
    };
    image.src = dataURIs.bezier;
  }

  if (tools.bezier === true) {
    decorateBezier();
    document.getElementById('bezier-curve').style.display = 'block';
  }

  /**
   *
   * @param {*} context
   * @param {*} width
   * @param {*} mx
   * @param {*} my
   * @param {*} lx
   * @param {*} ly
   */
  function tempStrokeTheLine(context, width, mx, my, lx, ly) {
    context.beginPath();
    context.lineWidth = width;
    context.moveTo(mx, my);
    context.lineTo(lx, ly);
    context.stroke();
  }

  /**
   *
   */
  function decorateLineWidth() {
    const context = getContext('line-width');

    const image = new Image();
    image.onload = function() {
      context.drawImage(image, 4, 4, 32, 32);
    };
    image.src = dataURIs.lineWidth;

    const lineWidthContainer = find('line-width-container');
    const lineWidthText = find('line-width-text');
    const btnLineWidthDone = find('line-width-done');
    const h1 = document.getElementsByTagName('h1')[0];
    const canvas = context.canvas;

    addEvent(canvas, 'click', function() {
      hideContainers();

      lineWidthContainer.style.display = 'block';
      lineWidthContainer.style.top = (canvas.offsetTop + 1) + 'px';
      lineWidthContainer.style.left =
        (canvas.offsetLeft + canvas.clientWidth) + 'px';

      lineWidthText.focus();
    });

    addEvent(btnLineWidthDone, 'click', function() {
      lineWidthContainer.style.display = 'none';
      lineWidth = lineWidthText.value;
    });
  }

  if (tools.lineWidth === true) {
    decorateLineWidth();
    document.getElementById('line-width').style.display = 'block';
  }

  /**
   *
   */
  function decorateColors() {
    const context = getContext('colors');

    const image = new Image();
    image.onload = function() {
      context.drawImage(image, 4, 4, 32, 32);
    };
    image.src = dataURIs.colorsPicker;

    const colorsContainer = find('colors-container');
    const strokeStyleText = find('stroke-style');
    const fillStyleText = find('fill-style');
    const btnColorsDone = find('colors-done');
    const h1 = document.getElementsByTagName('h1')[0];
    const canvas = context.canvas;

    addEvent(canvas, 'click', function() {
      hideContainers();

      colorsContainer.style.display = 'block';
      colorsContainer.style.top = (canvas.offsetTop + 1) + 'px';
      colorsContainer.style.left =
        (canvas.offsetLeft + canvas.clientWidth) + 'px';

      strokeStyleText.focus();
    });

    addEvent(btnColorsDone, 'click', function() {
      colorsContainer.style.display = 'none';
      strokeStyle = strokeStyleText.value;
      fillStyle = fillStyleText.value;
    });
  }

  if (tools.colorsPicker === true) {
    decorateColors();
    document.getElementById('colors').style.display = 'block';
  }

  /**
   *
   */
  function decorateAdditionalOptions() {
    const context = getContext('additional');

    const image = new Image();
    image.onload = function() {
      context.drawImage(image, 4, 4, 32, 32);
    };
    image.src = dataURIs.extraOptions;

    const additionalContainer = find('additional-container');
    const btnAdditionalClose = find('additional-close');
    const h1 = document.getElementsByTagName('h1')[0];
    const canvas = context.canvas;
    const globalAlphaSelect = find('globalAlpha-select');
    const globalCompositeOperationSelect =
      find('globalCompositeOperation-select');

    addEvent(canvas, 'click', function() {
      hideContainers();

      additionalContainer.style.display = 'block';
      additionalContainer.style.top = (canvas.offsetTop + 1) + 'px';
      additionalContainer.style.left =
        (canvas.offsetLeft + canvas.clientWidth) + 'px';
    });

    addEvent(btnAdditionalClose, 'click', function() {
      additionalContainer.style.display = 'none';

      globalAlpha = globalAlphaSelect.value;
      globalCompositeOperation = globalCompositeOperationSelect.value;
      globalOptions.lineCap = lineCapSelect.value;
      globalOptions.lineJoin = lineJoinSelect.value;
    });
  }

  if (tools.extraOptions === true) {
    decorateAdditionalOptions();
    document.getElementById('additional').style.display = 'block';
  }

  const designPreview = find('design-preview');
  const codePreview = find('code-preview');

  // todo: use this function in share-drawings.js
  // to sync buttons' states
  window.selectBtn = function(btn, isSkipWebRTCMessage) {
    codePreview.className = designPreview.className = '';

    if (btn == designPreview) designPreview.className = 'preview-selected';
    else codePreview.className = 'preview-selected';

    if (
      !isSkipWebRTCMessage &&
      window.connection &&
      connection.numberOfConnectedUsers >= 1
    ) {
      connection.send({
        btnSelected: btn.id,
      });
    } else {
      // to sync buttons' UI-states
      if (btn == designPreview) btnDesignerPreviewClicked();
      else btnCodePreviewClicked();
    }
  };

  addEvent(designPreview, 'click', function() {
    selectBtn(designPreview);
    btnDesignerPreviewClicked();
  });

  /**
   *
   */
  function btnDesignerPreviewClicked() {
    codeText.parentNode.style.display = 'none';
    optionsContainer.style.display = 'none';

    hideContainers();
    endLastPath();
  }

  addEvent(codePreview, 'click', function() {
    selectBtn(codePreview);
    btnCodePreviewClicked();
  });

  /**
   *
   */
  function btnCodePreviewClicked() {
    codeText.parentNode.style.display = 'block';
    optionsContainer.style.display = 'block';

    codeText.focus();
    common.updateTextArea();

    setHeightForCodeAndOptionsContainer();

    hideContainers();
    endLastPath();
  }

  const codeText = find('code-text');
  const optionsContainer = find('options-container');

  /**
   *
   */
  function setHeightForCodeAndOptionsContainer() {
    codeText.style.width =
      (innerWidth - optionsContainer.clientWidth - 30) + 'px';
    codeText.style.height = (innerHeight - 40) + 'px';

    codeText.style.marginLeft = (optionsContainer.clientWidth) + 'px';
    optionsContainer.style.height = (innerHeight) + 'px';
  }

  const isAbsolute = find('is-absolute-points');
  const isShorten = find('is-shorten-code');

  addEvent(isShorten, 'change', common.updateTextArea);
  addEvent(isAbsolute, 'change', common.updateTextArea);
})();

/**
 *
 */
function hideContainers() {
  const additionalContainer = find('additional-container');
  const colorsContainer = find('colors-container');
  const markerContainer = find('marker-container');
  const markerColorContainer = find('marker-fill-colors');
  const pencilContainer = find('pencil-container');
  const pencilColorContainer = find('pencil-fill-colors');
  const lineWidthContainer = find('line-width-container');

  additionalContainer.style.display =
        colorsContainer.style.display =
        markerColorContainer.style.display =
        markerContainer.style.display =
        pencilColorContainer.style.display =
        pencilContainer.style.display =
        lineWidthContainer.style.display = 'none';
}

/**
 *
 */
function setTemporaryLine() {
  const arr = ['line', [139, 261, 170, 219],
    [
      1,
      'rgba(0,0,0,0)',
      'rgba(0,0,0,0)',
      1,
      'source-over',
      'round',
      'round',
      '15px "Arial"',
    ],
  ];
  points.push(arr);
  drawHelper.redraw();

  setTimeout(function() {
    setSelection(document.getElementById('line'), 'Line');
  }, 1000);

  setTimeout(setDefaultSelectedIcon, 2000);
}
