import DrawHelper from './draw-helper';
import {options} from './constants';

const ZoomHandler = {
  scale: 1.0,
  lastZoomState: null,
  up: function(e) {
    this.scale = this.lastZoomState !== 'up' ? 1 : this.scale;
    this.scale += .01;
    this.lastZoomState = 'up';
    this.apply();
  },
  down: function(e) {
    this.scale = this.lastZoomState !== 'down' ? 1 : this.scale;
    this.scale -= .01;
    this.lastZoomState = 'down';
    this.apply();
  },
  apply: function() {
    // tempContext.scale(this.scale, this.scale);
    // context.scale(this.scale, this.scale);
    DrawHelper.redraw();
  },
  applyTemp: function(s) {
    // tempContext.scale(e, e);
    // context.scale(e, e);
    DrawHelper.redraw(s);
  },
  multiply: function(e) {
    this.scale *= e;
    this.scale = Math.max(this.scale, options.MIN_SCALE);
    this.scale = Math.min(this.scale, options.MAX_SCALE);
    this.apply();
  },
  icons: {
    up: function(ctx) {
      ctx.font = '22px Verdana';
      ctx.strokeText('+', 10, 30);
    },
    down: function(ctx) {
      ctx.font = '22px Verdana';
      ctx.strokeText('-', 10, 30);
    },
  },
};

export default ZoomHandler;
