import {
  addEvent,
  hexToRGBA,
  find,
  RGBA2hex,
} from '../common';
import {getContext, isEventContainDOM} from './utils';
import {dataURIs} from '../data-uris';
import globalOptions, {saveOptions} from '../global-options';
import bindEvent from './bind-event';
import hideContainers from './hide-containers';

/**
 * @param {*} options
 */
function decoratePencil(options) {
  options = options || {};

  const lineWidth = options.lineWidth ||
    globalOptions.pencilLineWidth ||
    5;
  const strokeStyle = options.strokeStyle ||
    globalOptions.pencilStrokeStyle ||
    '6699FF';

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

  // ASSIGN DEFAULT VALUE
  strokeStyleText.value = lineWidth;
  fillStyleText.value = strokeStyle.includes('rgb') ?
    RGBA2hex(strokeStyle) :
    strokeStyle;

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

  addEvent(canvas, 'contextmenu', function(e) {
    hideContainers();
    e.preventDefault();

    pencilContainer.style.display = 'block';
    pencilContainer.style.top = (canvas.offsetTop + 1) + 'px';
    pencilContainer.style.left =
        (canvas.offsetLeft + canvas.clientWidth) + 'px';

    fillStyleText.focus();
  });

  addEvent(btnPencilDone, 'click', function() {
    pencilContainer.style.display = 'none';
    pencilColorContainer.style.display = 'none';

    globalOptions.pencilLineWidth = strokeStyleText.value;
    globalOptions.pencilStrokeStyle = hexToRGBA(fillStyleText.value, alpha);

    saveOptions(globalOptions);
  });

  addEvent(pencilSelectedColor, 'click', function() {
    pencilColorContainer.style.display = 'block';
  });

  document.addEventListener('mousedown', (e) => {
    if (!isEventContainDOM(e, pencilContainer.id)) {
      pencilContainer.style.display = 'none';
    }
  });
}

export default decoratePencil;
