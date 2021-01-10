import DrawHelper from './draw-helper';
import globalObjects from './global-objects';
import globalOptions from './global-options';
import TextHandler from './text-handler';

const is = {
  isLine: false,
  isArrow: false,
  isArc: false,
  isDragLastPath: false,
  isDragAllPaths: false,
  isRectangle: false,
  isQuadraticCurve: false,
  isBezierCurve: false,
  isPencil: false,
  isMarker: true,
  isEraser: false,
  isText: false,
  isImage: false,
  isPdf: false,

  set: function(shape) {
    const cache = this;

    cache.isLine =
        cache.isArrow =
        cache.isArc =
        cache.isDragLastPath =
        cache.isDragAllPaths =
        cache.isRectangle =
        cache.isQuadraticCurve =
        cache.isBezierCurve =
        cache.isPencil =
        cache.isMarker =
        cache.isEraser =
        cache.isText =
        cache.isImage =
        cache.isPdf = false;
    cache['is' + shape] = true;
  },
};

/**
 *
 * @param {*} element
 * @param {*} eventType
 * @param {*} callback
 * @return {*}
 */
function addEvent(element, eventType, callback) {
  if (eventType.split(' ').length > 1) {
    const events = eventType.split(' ');
    for (let i = 0; i < events.length; i++) {
      addEvent(element, events[i], callback);
    }
    return;
  }

  if (element.addEventListener) {
    element.addEventListener(eventType, callback, !1);
    return true;
  } else if (element.attachEvent) {
    return element.attachEvent('on' + eventType, callback);
  } else {
    element['on' + eventType] = callback;
  }
  return this;
}

/**
 *
 * @param {*} selector
 * @return {*}
 */
function find(selector) {
  return document.getElementById(selector);
}

const textarea = find('code-text');
const lineWidth = 2;
const strokeStyle = '#6c96c8';

/**
 *
 * @param {*} id
 * @return {*}
 */
function getContext(id) {
  const canv = find(id);
  const ctx = canv.getContext('2d');

  canv.setAttribute('width', innerWidth);
  canv.setAttribute('height', innerHeight);

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.fillStyle = globalOptions.fillStyle;
  ctx.font = globalOptions.font;

  return ctx;
}

const context = getContext('main-canvas');
const tempContext = getContext('temp-canvas');

const common = {
  updateTextArea: function() {
    const c = common;
    const toFixed = c.toFixed;
    const getPoint = c.getPoint;

    const isAbsolutePoints = find('is-absolute-points').checked;
    const isShortenCode = find('is-shorten-code').checked;

    if (isAbsolutePoints && isShortenCode) c.absoluteShortened();
    if (isAbsolutePoints && !isShortenCode) c.absoluteNOTShortened(toFixed);
    if (!isAbsolutePoints && isShortenCode) {
      c.relativeShortened(toFixed, getPoint);
    }
    if (!isAbsolutePoints && !isShortenCode) {
      c.relativeNOTShortened(toFixed, getPoint);
    }
  },
  toFixed: function(input) {
    return Number(input).toFixed(1);
  },
  getPoint: function(pointToCompare, compareWith, prefix) {
    if (pointToCompare > compareWith) {
      pointToCompare = prefix + ' + ' + (pointToCompare - compareWith);
    } else if (pointToCompare < compareWith) {
      pointToCompare = prefix + ' - ' + (compareWith - pointToCompare);
    } else {
      pointToCompare = prefix;
    }

    return pointToCompare;
  },
  absoluteShortened: function() {
    let output = '';
    const length = points.length;
    let i = 0;
    let point;
    for (i; i < length; i++) {
      point = points[i];
      output += this.shortenHelper(point[0], point[1], point[2]);
    }

    output = output.substr(0, output.length - 2);
    textarea.value =
      'var points = [' + output + '], ' +
      'length = points.length, point, p, i = 0;\n\n' +
      drawArrow.toString() + '\n\n' + this.forLoop;

    this.prevProps = null;
  },
  absoluteNOTShortened: function(toFixed) {
    const tempArray = [];
    let i; let point; let p;

    for (i = 0; i < points.length; i++) {
      p = points[i];
      point = p[1];

      if (p[0] === 'pencil') {
        tempArray[i] = [
          'context.beginPath();\n' +
          'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' +
          'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' +
          this.strokeOrFill(p[2]),
        ];
      }

      if (p[0] === 'marker') {
        tempArray[i] = [
          'context.beginPath();\n' +
          'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' +
          'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' +
          this.strokeOrFill(p[2]),
        ];
      }

      if (p[0] === 'eraser') {
        tempArray[i] = [
          'context.beginPath();\n' +
          'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' +
          'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' +
          this.strokeOrFill(p[2]),
        ];
      }

      if (p[0] === 'line') {
        tempArray[i] = [
          'context.beginPath();\n' +
          'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' +
          'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' +
          this.strokeOrFill(p[2]),
        ];
      }

      if (p[0] === 'pencil') {
        tempArray[i] = [
          'context.beginPath();\n' +
          'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' +
          'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' +
          this.strokeOrFill(p[2]),
        ];
      }

      if (p[0] === 'text') {
        tempArray[i] = [
          this.strokeOrFill(p[2]) +
          // eslint-disable-next-line max-len
          '\ncontext.fillText(' + point[0] + ', ' + point[1] + ', ' + point[2] + ');',
        ];
      }

      if (p[0] === 'arrow') {
        tempArray[i] = [
          // eslint-disable-next-line max-len
          'drawArrow(' + point[0] + ', ' + point[1] + ', ' + point[2] + ', ' + point[3] + ', \'' +
          p[2].join('\',\'') + '\');'];
      }

      if (p[0] === 'arc') {
        tempArray[i] = [
          'context.beginPath(); \n' +
          'context.arc(' +
            toFixed(point[0]) + ',' +
            toFixed(point[1]) + ',' +
            toFixed(point[2]) + ',' +
            toFixed(point[3]) + ', 0,' +
            point[4] +
          '); \n' +
          this.strokeOrFill(p[2])];
      }

      if (p[0] === 'rect') {
        tempArray[i] = [
          this.strokeOrFill(p[2]) + '\n' +
          'context.strokeRect(' +
            point[0] + ', ' +
            point[1] + ',' +
            point[2] + ',' +
            point[3] +
          ');\n' +
          'context.fillRect(' +
            point[0] + ', ' +
            point[1] + ',' +
            point[2] + ',' +
            point[3] +
          ');',
        ];
      }

      if (p[0] === 'quadratic') {
        tempArray[i] = [
          'context.beginPath();\n' +
          'context.moveTo(' +
            point[0] + ', ' +
            point[1] +
          ');\n' +
          'context.quadraticCurveTo(' +
            point[2] + ', ' +
            point[3] + ', ' +
            point[4] + ', ' +
            point[5] +
          ');\n' +
          this.strokeOrFill(p[2]),
        ];
      }

      if (p[0] === 'bezier') {
        tempArray[i] = [
          'context.beginPath();\n' +
          'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' +
          'context.bezierCurveTo(' +
            point[2] + ', ' +
            point[3] + ', ' +
            point[4] + ', ' +
            point[5] + ', ' +
            point[6] + ', ' +
            point[7] +
          ');\n' +
          this.strokeOrFill(p[2]),
        ];
      }
    }
    textarea.value =
      tempArray.join('\n\n') +
      this.strokeFillText + '\n\n' +
      drawArrow.toString();

    this.prevProps = null;
  },
  relativeShortened: function(toFixed, getPoint) {
    let i = 0;
    let point; let p; const length = points.length;
    let output = '';
    let x = 0;
    let y = 0;

    for (i; i < length; i++) {
      p = points[i];
      point = p[1];

      if (i === 0) {
        x = point[0];
        y = point[1];
      }

      if (p[0] === 'text') {
        x = point[1];
        y = point[2];
      }

      if (p[0] === 'pencil') {
        output += this.shortenHelper(p[0], [
          getPoint(point[0], x, 'x'),
          getPoint(point[1], y, 'y'),
          getPoint(point[2], x, 'x'),
          getPoint(point[3], y, 'y'),
        ], p[2]);
      }

      if (p[0] === 'marker') {
        output += this.shortenHelper(p[0], [
          getPoint(point[0], x, 'x'),
          getPoint(point[1], y, 'y'),
          getPoint(point[2], x, 'x'),
          getPoint(point[3], y, 'y'),
        ], p[2]);
      }

      if (p[0] === 'eraser') {
        output += this.shortenHelper(p[0], [
          getPoint(point[0], x, 'x'),
          getPoint(point[1], y, 'y'),
          getPoint(point[2], x, 'x'),
          getPoint(point[3], y, 'y'),
        ], p[2]);
      }

      if (p[0] === 'line') {
        output += this.shortenHelper(p[0], [
          getPoint(point[0], x, 'x'),
          getPoint(point[1], y, 'y'),
          getPoint(point[2], x, 'x'),
          getPoint(point[3], y, 'y'),
        ], p[2]);
      }

      if (p[0] === 'pencil') {
        output += this.shortenHelper(p[0], [
          getPoint(point[0], x, 'x'),
          getPoint(point[1], y, 'y'),
          getPoint(point[2], x, 'x'),
          getPoint(point[3], y, 'y'),
        ], p[2]);
      }

      if (p[0] === 'arrow') {
        output += this.shortenHelper(p[0], [
          getPoint(point[0], x, 'x'),
          getPoint(point[1], y, 'y'),
          getPoint(point[2], x, 'x'),
          getPoint(point[3], y, 'y'),
        ], p[2]);
      }

      if (p[0] === 'text') {
        output += this.shortenHelper(p[0], [
          point[0],
          getPoint(point[1], x, 'x'),
          getPoint(point[2], y, 'y'),
        ], p[2]);
      }

      if (p[0] === 'arc') {
        output += this.shortenHelper(p[0], [
          getPoint(point[0], x, 'x'),
          getPoint(point[1], y, 'y'),
          point[2],
          point[3],
          point[4],
        ], p[2]);
      }

      if (p[0] === 'rect') {
        output += this.shortenHelper(p[0], [
          getPoint(point[0], x, 'x'),
          getPoint(point[1], y, 'y'),
          getPoint(point[2], x, 'x'),
          getPoint(point[3], y, 'y'),
        ], p[2]);
      }

      if (p[0] === 'quadratic') {
        output += this.shortenHelper(p[0], [
          getPoint(point[0], x, 'x'),
          getPoint(point[1], y, 'y'),
          getPoint(point[2], x, 'x'),
          getPoint(point[3], y, 'y'),
          getPoint(point[4], x, 'x'),
          getPoint(point[5], y, 'y'),
        ], p[2]);
      }

      if (p[0] === 'bezier') {
        output += this.shortenHelper(p[0], [
          getPoint(point[0], x, 'x'),
          getPoint(point[1], y, 'y'),
          getPoint(point[2], x, 'x'),
          getPoint(point[3], y, 'y'),
          getPoint(point[4], x, 'x'),
          getPoint(point[5], y, 'y'),
          getPoint(point[6], x, 'x'),
          getPoint(point[7], y, 'y'),
        ], p[2]);
      }
    }

    output = output.substr(0, output.length - 2);
    textarea.value =
      'var x = ' + x + ',' +
      'y = ' + y + ',' +
      'points = [' + output + '],' +
      'length = points.length, point, p, i = 0;\n\n' +
      drawArrow.toString() + '\n\n' + this.forLoop;

    this.prevProps = null;
  },
  relativeNOTShortened: function(toFixed, getPoint) {
    let i; let point; let p; const length = points.length;
    let output = '';
    let x = 0;
    let y = 0;

    for (i = 0; i < length; i++) {
      p = points[i];
      point = p[1];

      if (i === 0) {
        x = point[0];
        y = point[1];

        if (p[0] === 'text') {
          x = point[1];
          y = point[2];
        }

        output = 'var x = ' + x + ', y = ' + y + ';\n\n';
      }

      if (p[0] === 'arc') {
        output +=
          'context.beginPath();\n' +
          'context.arc(' +
            getPoint(point[0], x, 'x') + ', ' +
            getPoint(point[1], y, 'y') + ', ' +
            point[2] + ', ' +
            point[3] + ', 0, ' +
            point[4] +
          ');\n' +
          this.strokeOrFill(p[2]);
      }

      if (p[0] === 'pencil') {
        output +=
          'context.beginPath();\n' +
          'context.moveTo(' +
            getPoint(point[0], x, 'x') + ', ' +
            getPoint(point[1], y, 'y') +
          ');\n' +
          'context.lineTo(' +
            getPoint(point[2], x, 'x') + ', ' +
            getPoint(point[3], y, 'y') +
          ');\n' +
          this.strokeOrFill(p[2]);
      }

      if (p[0] === 'marker') {
        output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n' +
                    this.strokeOrFill(p[2]);
      }

      if (p[0] === 'eraser') {
        output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n' +
                    this.strokeOrFill(p[2]);
      }

      if (p[0] === 'line') {
        output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n' + this.strokeOrFill(p[2]);
      }

      if (p[0] === 'pencil') {
        output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n' + this.strokeOrFill(p[2]);
      }

      if (p[0] === 'arrow') {
        output += 'drawArrow(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ', ' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ', \'' + p[2].join('\',\'') + '\');\n';
      }

      if (p[0] === 'text') {
        output += this.strokeOrFill(p[2]) + '\n' + 'context.fillText(' + point[0] + ', ' + getPoint(point[1], x, 'x') + ', ' + getPoint(point[2], y, 'y') + ');';
      }

      if (p[0] === 'rect') {
        output += this.strokeOrFill(p[2]) + '\n' + 'context.strokeRect(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ', ' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n' + 'context.fillRect(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ', ' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');';
      }

      if (p[0] === 'quadratic') {
        output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.quadraticCurveTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ', ' + getPoint(point[4], x, 'x') + ', ' + getPoint(point[5], y, 'y') + ');\n' +
                    this.strokeOrFill(p[2]);
      }

      if (p[0] === 'bezier') {
        output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.bezierCurveTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ', ' + getPoint(point[4], x, 'x') + ', ' + getPoint(point[5], y, 'y') + ', ' + getPoint(point[6], x, 'x') + ', ' + getPoint(point[7], y, 'y') + ');\n' +
                    this.strokeOrFill(p[2]);
      }

      if (i !== length - 1) output += '\n\n';
    }
    textarea.value = output + this.strokeFillText + '\n\n' + drawArrow.toString();

    this.prevProps = null;
  },
  forLoop: 'for(i; i < length; i++) {\n' + '    p = points[i];\n' + '    point = p[1];\n' + '    context.beginPath();\n\n'

        // globals
        +
        '    if(p[2]) { \n' + '\tcontext.lineWidth = p[2][0];\n' + '\tcontext.strokeStyle = p[2][1];\n' + '\tcontext.fillStyle = p[2][2];\n' +
        '\tcontext.globalAlpha = p[2][3];\n' + '\tcontext.globalCompositeOperation = p[2][4];\n' + '\tcontext.lineCap = p[2][5];\n' + '\tcontext.lineJoin = p[2][6];\n' + '\tcontext.font = p[2][7];\n' + '    }\n\n'

  // line

        +
        '    if(p[0] === "line") { \n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.lineTo(point[2], point[3]);\n' + '    }\n\n'

  // arrow

        +
        '    if(p[0] === "arrow") { \n' + '\tdrawArrow(point[0], point[1], point[2], point[3], p[2]);\n' + '    }\n\n'

  // pencil

        +
        '    if(p[0] === "pencil") { \n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.lineTo(point[2], point[3]);\n' + '    }\n\n'

  // marker

        +
        '    if(p[0] === "marker") { \n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.lineTo(point[2], point[3]);\n' + '    }\n\n'


  // text

        +
        '    if(p[0] === "text") { \n' + '\tcontext.fillText(point[0], point[1], point[2]);\n' + '    }\n\n'

  // eraser

        +
        '    if(p[0] === "eraser") { \n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.lineTo(point[2], point[3]);\n' + '    }\n\n'

  // arc

        +
        '    if(p[0] === "arc") context.arc(point[0], point[1], point[2], point[3], 0, point[4]); \n\n'

  // rect

        +
        '    if(p[0] === "rect") {\n' + '\tcontext.strokeRect(point[0], point[1], point[2], point[3]);\n' + '\tcontext.fillRect(point[0], point[1], point[2], point[3]);\n' +
        '    }\n\n'

  // quadratic

        +
        '    if(p[0] === "quadratic") {\n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.quadraticCurveTo(point[2], point[3], point[4], point[5]);\n' + '    }\n\n'

  // bezier

        +
        '    if(p[0] === "bezier") {\n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.bezierCurveTo(point[2], point[3], point[4], point[5], point[6], point[7]);\n' + '    }\n\n'

  // end-fill

        +
        '    context.stroke();\n' + '    context.fill();\n' +
        '}',

  strokeFillText: '\n\nfunction strokeOrFill(lineWidth, strokeStyle, fillStyle, globalAlpha, globalCompositeOperation, lineCap, lineJoin, font) { \n' + '    if(lineWidth) { \n' + '\tcontext.globalAlpha = globalAlpha;\n' + '\tcontext.globalCompositeOperation = globalCompositeOperation;\n' + '\tcontext.lineCap = lineCap;\n' + '\tcontext.lineJoin = lineJoin;\n' +
        '\tcontext.lineWidth = lineWidth;\n' + '\tcontext.strokeStyle = strokeStyle;\n' + '\tcontext.fillStyle = fillStyle;\n' + '\tcontext.font = font;\n' + '    } \n\n' +
        '    context.stroke();\n' + '    context.fill();\n' +
        '}',
  strokeOrFill: function(p) {
    if (!this.prevProps || this.prevProps !== p.join(',')) {
      this.prevProps = p.join(',');

      return 'strokeOrFill(\'' + p.join('\', \'') + '\');';
    }

    return 'strokeOrFill();';
  },
  prevProps: null,
  shortenHelper: function(name, p1, p2) {
    let result = '[\'' + name + '\', [' + p1.join(', ') + ']';

    if (!this.prevProps || this.prevProps !== p2.join(',')) {
      this.prevProps = p2.join(',');
      result += ', [\'' + p2.join('\', \'') + '\']';
    }

    return result + '], ';
  },
};

function drawArrow(mx, my, lx, ly, options) {
  function getOptions(opt) {
    opt = opt || {};

    return [
      opt.lineWidth || 2,
      opt.strokeStyle || '#6c96c8',
      opt.fillStyle || 'rgba(0,0,0,0)',
      opt.globalAlpha || 1,
      opt.globalCompositeOperation || 'source-over',
      opt.lineCap || 'round',
      opt.lineJoin || 'round',
      opt.font || '15px "Arial"',
    ];
  }

  function handleOptions(opt, isNoFillStroke) {
    opt = opt || getOptions();

    context.globalAlpha = opt[3];
    context.globalCompositeOperation = opt[4];

    context.lineCap = opt[5];
    context.lineJoin = opt[6];
    context.lineWidth = opt[0];

    context.strokeStyle = opt[1];
    context.fillStyle = opt[2];

    context.font = opt[7];

    if (!isNoFillStroke) {
      context.stroke();
      context.fill();
    }
  }

  const arrowSize = 10;
  const angle = Math.atan2(ly - my, lx - mx);

  context.beginPath();
  context.moveTo(mx, my);
  context.lineTo(lx, ly);

  handleOptions();

  context.beginPath();
  context.moveTo(lx, ly);
  context.lineTo(lx - arrowSize * Math.cos(angle - Math.PI / 7), ly - arrowSize * Math.sin(angle - Math.PI / 7));
  context.lineTo(lx - arrowSize * Math.cos(angle + Math.PI / 7), ly - arrowSize * Math.sin(angle + Math.PI / 7));
  context.lineTo(lx, ly);
  context.lineTo(lx - arrowSize * Math.cos(angle - Math.PI / 7), ly - arrowSize * Math.sin(angle - Math.PI / 7));

  handleOptions();
}

/**
 *
 */
function endLastPath() {
  const cache = is;

  if (cache.isArc) arcHandler.end();
  else if (cache.isQuadraticCurve) quadraticHandler.end();
  else if (cache.isBezierCurve) bezierHandler.end();

  DrawHelper.redraw();

  if (TextHandler.text && TextHandler.text.length) {
    TextHandler.appendPoints();
    TextHandler.onShapeUnSelected();
  }
  TextHandler.showOrHideTextTools('hide');
}

let copiedStuff = [];

function copy() {
  endLastPath();

  dragHelper.global.startingIndex = 0;

  if (find('copy-last').checked) {
    copiedStuff = points[points.length - 1];
    setSelection(find('drag-last-path'), 'DragLastPath');
  } else {
    copiedStuff = points;
    setSelection(find('drag-all-paths'), 'DragAllPaths');
  }
}

/**
 *
 */
function paste() {
  endLastPath();

  dragHelper.global.startingIndex = 0;

  if (find('copy-last').checked) {
    points[points.length] = copiedStuff;

    dragHelper.global = {
      prevX: 0,
      prevY: 0,
      startingIndex: points.length - 1,
    };

    dragHelper.dragAllPaths(0, 0);
    setSelection(find('drag-last-path'), 'DragLastPath');
  } else {
    dragHelper.global.startingIndex = points.length;
    globalObjects.points = points.concat(copiedStuff);
    setSelection(find('drag-all-paths'), 'DragAllPaths');
  }
}

// marker + pencil
function hexToR(h) {
  return parseInt((cutHex(h)).substring(0, 2), 16);
}

function hexToG(h) {
  return parseInt((cutHex(h)).substring(2, 4), 16);
}

function hexToB(h) {
  return parseInt((cutHex(h)).substring(4, 6), 16);
}

function cutHex(h) {
  return (h.charAt(0) == '#') ? h.substring(1, 7) : h;
}

/**
 * Clone object
 * @param {*} obj
 * @return {*} Cloned object
 */
function clone(obj) {
  if (obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj) {
    return obj;
  }
  let temp = null;

  if (obj instanceof Date) {
    // or new Date(obj);
    temp = new obj.constructor();
  } else {
    temp = obj.constructor();
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      obj['isActiveClone'] = null;
      temp[key] = clone(obj[key]);
      delete obj['isActiveClone'];
    }
  }

  return temp;
}

/**
 *
 * @param {String} h Hex code
 * @return {String} RGB code
 */
function hexToRGB(h) {
  return [
    hexToR(h),
    hexToG(h),
    hexToB(h),
  ];
}

/**
 *
 * @param {*} h
 * @param {*} alpha
 * @return {*}
 */
function hexToRGBA(h, alpha) {
  return 'rgba(' + hexToRGB(h).join(',') + ',1)';
}

/**
 *
 * @param {String} orig rgba color code
 */
function RGBA2hex(orig) {
  let a; let isPercent;
  const rgb = orig.
    replace(/\s/g, '').
    match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i);
  const alpha = (rgb && rgb[4] || '').trim();
  let hex = rgb ?
    (rgb[1] | 1 << 8).toString(16).slice(1) +
    (rgb[2] | 1 << 8).toString(16).slice(1) +
    (rgb[3] | 1 << 8).toString(16).slice(1) : orig;

  if (alpha !== '') {
    a = alpha;
  } else {
    a = 1;
  }
  // multiply before convert to HEX
  a = ((a * 255) | 1 << 8).toString(16).slice(1);
  hex = hex + a;

  return hex;
}

export {
  clone,
  addEvent,
  find,
  is,
  endLastPath,
  hexToRGB,
  hexToRGBA,
  RGBA2hex,
  tempContext,
  context,
  common,
};
