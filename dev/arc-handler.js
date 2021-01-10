import {addEvent, find} from './common';
import globalOptions from './global-options';

const arcHandler = {
  global: {
    ismousedown: false,
    prevX: 0,
    prevY: 0,
    prevRadius: 0,
    isCircleDrawn: false,
    isCircledEnded: true,
    isClockwise: false,
    arcRangeContainer: null,
    arcRange: null,
  },
  mousedown: function(e) {
    const g = this.global;

    const x = e.pageX - canvas.offsetLeft;
    const y = e.pageY - canvas.offsetTop;

    g.prevX = x;
    g.prevY = y;

    g.ismousedown = true;
  },
  mouseup: function(e) {
    const g = this.global;

    const x = e.pageX - canvas.offsetLeft;
    const y = e.pageY - canvas.offsetTop;

    if (g.ismousedown) {
      if (!g.isCircleDrawn && g.isCircledEnded) {
        const prevX = g.prevX;
        const prevY = g.prevY;
        const radius = ((x - prevX) + (y - prevY)) / 3;

        g.prevRadius = radius;
        g.isCircleDrawn = true;
        g.isCircleEnded = false;

        const c = (2 * Math.PI * radius) / 21;
        let angle;
        const xx = prevX > x ? prevX - x : x - prevX;
        const yy = prevY > y ? prevY - y : y - prevY;

        angle = (xx + yy) / (2 * c);
        points[points.length] = [
          'arc',
          [prevX + radius, prevY + radius, radius, angle, 1],
          drawHelper.getOptions()];

        const arcRange = g.arcRange;
        const arcRangeContainer = g.arcRangeContainer;

        arcRangeContainer.style.display = 'block';
        arcRange.focus();

        arcRangeContainer.style.top = (y + canvas.offsetTop + 20) + 'px';
        arcRangeContainer.style.left = x + 'px';

        arcRange.value = 2;
      } else if (g.isCircleDrawn && !g.isCircleEnded) {
        this.end();
      }
    }

    g.ismousedown = false;

    this.fixAllPoints();
  },
  mousemove: function(e) {
    const g = this.global;

    const x = e.pageX - canvas.offsetLeft;
    const y = e.pageY - canvas.offsetTop;

    const ismousedown = g.ismousedown;
    const isCircleDrawn = g.isCircleDrawn;
    const isCircleEnded = g.isCircledEnded;

    if (ismousedown) {
      if (!isCircleDrawn && isCircleEnded) {
        const prevX = g.prevX;
        const prevY = g.prevY;
        const radius = ((x - prevX) + (y - prevY)) / 3;

        tempContext.clearRect(0, 0, 2000, 2000);

        drawHelper.arc(
          tempContext,
          [prevX + radius, prevY + radius, radius, Math.PI * 2, true],
        );
      }
    }
  },
  fixAllPoints: function() {
    const toFixed = this.toFixed;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      let point;
      if (p[0] === 'arc') {
        point = p[1];
        points[i] = [
          'arc',
          [
            toFixed(point[0]),
            toFixed(point[1]),
            toFixed(point[2]),
            toFixed(point[3]),
            point[4],
          ],
          p[2],
        ];
      }
    }
  },
  init: function() {
    const markIsClockwise = find('is-clockwise');
    const g = this.global;

    g.arcRangeContainer = find('arc-range-container');
    g.arcRange = find('arc-range');

    addEvent(markIsClockwise, 'change', function(e) {
      g.isClockwise = markIsClockwise.checked;

      g.arcRange.value = arcHandler.toFixed(g.arcRange.value);
      g.arcRange.focus();

      arcHandler.arcRangeHandler(e);

      if (!points.length) return;

      const p = points[points.length - 1];
      const point = p[1];

      tempContext.clearRect(0, 0, innerWidth, innerHeight);
      drawHelper.arc(
        tempContext,
        [point[0], point[1], point[2], point[3], point[4]],
      );
    });

    const arcRange = g.arcRange;
    addEvent(arcRange, 'keydown', this.arcRangeHandler);
    addEvent(arcRange, 'focus', this.arcRangeHandler);
  },
  arcRangeHandler: function(e) {
    const g = arcHandler.global;
    const arcRange = g.arcRange;

    const key = e.keyCode;
    const value = +arcRange.value;
    if (key == 39 || key == 40) {
      arcRange.value = (value < 2 ? value : 1.98) + .02;
    }
    if (key == 37 || key == 38) {
      arcRange.value = (value > 0 ? value : .02) - .02;
    }

    if (!key || key == 13 || key == 39 || key == 40 || key == 37 || key == 38) {
      const range = Math.PI * arcHandler.toFixed(value);
      const p = points[points.length - 1];

      if (p[0] === 'arc') {
        const point = p[1];
        points[points.length - 1] = [
          'arc',
          [point[0], point[1], point[2], range, g.isClockwise ? 1 : 0],
          p[2],
        ];

        drawHelper.redraw();
      }
    }
  },
  toFixed: function(input) {
    return Number(input).toFixed(1);
  },
  end: function() {
    const g = this.global;

    g.arcRangeContainer.style.display = 'none';
    g.arcRange.value = 2;

    g.isCircleDrawn = false;
    g.isCircleEnded = true;

    drawHelper.redraw();
  },
};

arcHandler.init();
