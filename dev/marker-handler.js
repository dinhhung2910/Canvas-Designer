import {clone} from './common';
import DrawHelper from './draw-helper';
import globalOptions from './global-options';

const markerHandler = {
  ismousedown: false,
  prevX: 0,
  prevY: 0,
  mousedown: function(e) {
    const x = e.pageX - canvas.offsetLeft;
    const y = e.pageY - canvas.offsetTop;

    const t = this;

    t.prevX = x;
    t.prevY = y;

    t.ismousedown = true;

    // make sure that pencil is drawing shapes even
    // if mouse is down but mouse isn't moving
    tempContext.lineCap = 'round';
    markerDrawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);

    points[points.length] = [
      'line',
      [t.prevX, t.prevY, x, y],
      markerDrawHelper.getOptions(),
    ];

    t.prevX = x;
    t.prevY = y;
  },
  mouseup: function(e) {
    this.ismousedown = false;
  },
  mousemove: function(e) {
    const x = e.pageX - canvas.offsetLeft;
    const y = e.pageY - canvas.offsetTop;

    const t = this;

    if (t.ismousedown) {
      tempContext.lineCap = 'round';
      markerDrawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);

      points[points.length] = [
        'line',
        [t.prevX, t.prevY, x, y],
        markerDrawHelper.getOptions(),
      ];

      t.prevX = x;
      t.prevY = y;
    }
  },
};

const markerLineWidth = document.getElementById('marker-stroke-style').value;
globalOptions.markerStrokeStyle =
  '#' +
  document.getElementById('marker-fill-style').value;
const markerGlobalAlpha = 0.7;

const markerDrawHelper = clone(DrawHelper);

markerDrawHelper.getOptions = function() {
  return [
    markerLineWidth,
    globalOptions.markerStrokeStyle,
    fillStyle,
    markerGlobalAlpha,
    globalCompositeOperation,
    lineCap,
    lineJoin,
    font,
  ];
};
