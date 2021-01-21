import {tempContext} from './common';
import DrawHelper from './draw-helper';
import globalObject from './global-objects';
import globalOptions from './global-options';

const canvas = tempContext.canvas;

const getEraserOptions = () => {
  return {
    lineWidth: globalOptions.eraserLineWidth || 10,
    strokeStyle: 'White',
    fillStyle: 'White',
  };
};

const EraserHandler = {
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

    tempContext.lineCap = 'round';
    const options = DrawHelper.getOptions(getEraserOptions());
    DrawHelper.line(
      tempContext,
      ...DrawHelper.getPropertiesWithScale([t.prevX, t.prevY, x, y], options),
    );

    globalObject.points.push([
      'line',
      [t.prevX, t.prevY, x, y],
      options,
    ]);

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
      const options = DrawHelper.getOptions(getEraserOptions());
      DrawHelper.line(
        tempContext,
        ...DrawHelper.getPropertiesWithScale([t.prevX, t.prevY, x, y], options),
      );

      globalObject.points.push([
        'line',
        [t.prevX, t.prevY, x, y],
        options,
      ]);

      t.prevX = x;
      t.prevY = y;
    }
  },
};

export default EraserHandler;
