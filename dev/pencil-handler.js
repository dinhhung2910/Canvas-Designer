import {
  clone,
  tempContext,
} from './common';
import DrawHelper from './draw-helper';
import globalOptions from './global-options';
import globalObjects from './global-objects';

const {points} = globalObjects;
const canvas = tempContext.canvas;

const PencilHandler = {
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
    pencilDrawHelper.pencil(
      tempContext,
      ...DrawHelper.getPropertiesWithScale([t.prevX, t.prevY, x, y]),
    );

    points[points.length] = [
      'pencil',
      [t.prevX, t.prevY, x, y],
      pencilDrawHelper.getOptions(),
      'start',
    ];

    t.prevX = x;
    t.prevY = y;
  },
  /**
   * Use in touchable devices
   * When user touch with 2 fingers
   * First event will be fired with 1 finger
   * Next event will be fired with both finger
   */
  cancelMousedown: function() {
    points.pop();
    this.ismousedown = false;
  },
  mouseup: function(e) {
    const x = e.pageX - canvas.offsetLeft;
    const y = e.pageY - canvas.offsetTop;

    const t = this;

    if (t.ismousedown) {
      tempContext.lineCap = 'round';
      pencilDrawHelper.pencil(
        tempContext,
        ...DrawHelper.getPropertiesWithScale([t.prevX, t.prevY, x, y]),
      );

      points[points.length] = [
        'pencil',
        [t.prevX, t.prevY, x, y],
        pencilDrawHelper.getOptions(),
        'end',
      ];

      t.prevX = x;
      t.prevY = y;
    }

    this.ismousedown = false;
  },
  mousemove: function(e) {
    const x = e.pageX - canvas.offsetLeft;
    const y = e.pageY - canvas.offsetTop;

    const t = this;

    if (t.ismousedown) {
      tempContext.lineCap = 'round';
      pencilDrawHelper.pencil(
        tempContext,
        ...DrawHelper.getPropertiesWithScale([t.prevX, t.prevY, x, y]),
      );

      points[points.length] = [
        'pencil',
        [t.prevX, t.prevY, x, y],
        pencilDrawHelper.getOptions(),
      ];

      t.prevX = x;
      t.prevY = y;
    }
  },
};

const pencilDrawHelper = clone(DrawHelper);

pencilDrawHelper.getOptions = function() {
  return [
    globalOptions.pencilLineWidth,
    globalOptions.pencilStrokeStyle,
    globalOptions.fillStyle,
    globalOptions.globalAlpha,
    globalOptions.globalCompositeOperation,
    globalOptions.lineCap,
    globalOptions.lineJoin,
    globalOptions.font,
  ];
};

export default PencilHandler;
