import {
  tempContext,
  context,
} from './common';
import globalObjects from './global-objects';
import globalOptions from './global-options';
import ImageHandler from './image-handler';
import TextHandler from './text-handler';
import ZoomHandler from './zoom-handler';

const DrawHelper = {
  redraw: async function(scale) {
    const points = globalObjects.points;

    tempContext.clearRect(0, 0, innerWidth, innerHeight);
    context.clearRect(0, 0, innerWidth, innerHeight);

    // Get scale
    scale = scale || ZoomHandler.scale;

    let i; let point; const length = points.length;
    for (i = 0; i < length; i++) {
      point = points[i];

      if (point && point.length && this[point[0]]) {
        await this[point[0]](
          context,
          ...this.getPropertiesWithScale(point[1], point[2], scale));
      }
      // else warn
    }
  },
  getPropertiesWithScale: function(coor, opt, scale) {
    scale = scale || ZoomHandler.scale;
    let scaledOpt = null;
    const scaledCoor = coor.map((en) => {
      if (parseFloat(en)) {
        return en * scale;
      } else {
        return en;
      }
    });

    if (Array.isArray(opt)) {
      scaledOpt = opt.map((en) => en);
      scaledOpt[0] = parseFloat(scaledOpt[0]) * scale;
    } else {
      scaledOpt = opt;
    }

    return [scaledCoor, scaledOpt];
  },
  getOptions: function(opt) {
    opt = opt || {};
    return [
      opt.lineWidth || globalOptions.pencilLineWidth,
      opt.strokeStyle || globalOptions.pencilStrokeStyle,
      opt.fillStyle || globalOptions.fillStyle,
      opt.globalAlpha || globalOptions.globalAlpha,
      opt.globalCompositeOperation || globalOptions.globalCompositeOperation,
      opt.lineCap || globalOptions.lineCap,
      opt.lineJoin || globalOptions.lineJoin,
      opt.font || globalOptions.font,
    ];
  },
  handleOptions: function(context, opt, isNoFillStroke) {
    opt = opt || this.getPropertiesWithScale([], this.getOptions())[1];

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
  },
  line: function(context, point, options) {
    context.beginPath();
    context.moveTo(point[0], point[1]);
    context.lineTo(point[2], point[3]);
    this.handleOptions(context, options);
  },
  pencil: function(context, point, options) {
    context.beginPath();
    context.moveTo(point[0], point[1]);
    context.lineTo(point[2], point[3]);

    this.handleOptions(context, options);
  },
  marker: function(context, point, options) {
    context.beginPath();
    context.moveTo(point[0], point[1]);
    context.lineTo(point[2], point[3]);

    this.handleOptions(context, options);
  },
  arrow: function(context, point, options) {
    const mx = point[0];
    const my = point[1];

    const lx = point[2];
    const ly = point[3];

    let arrowSize = arrowHandler.arrowSize;

    if (arrowSize == 10) {
      arrowSize = (options ? options[0] : lineWidth) * 5;
    }

    const angle = Math.atan2(ly - my, lx - mx);

    context.beginPath();
    context.moveTo(mx, my);
    context.lineTo(lx, ly);

    this.handleOptions(context, options);

    context.beginPath();
    context.moveTo(lx, ly);
    context.lineTo(
      lx - arrowSize * Math.cos(angle - Math.PI / 7),
      ly - arrowSize * Math.sin(angle - Math.PI / 7),
    );
    context.lineTo(
      lx - arrowSize * Math.cos(angle + Math.PI / 7),
      ly - arrowSize * Math.sin(angle + Math.PI / 7),
    );
    context.lineTo(lx, ly);
    context.lineTo(
      lx - arrowSize * Math.cos(angle - Math.PI / 7),
      ly - arrowSize * Math.sin(angle - Math.PI / 7),
    );

    this.handleOptions(context, options);
  },
  text: function(context, point, options) {
    this.handleOptions(context, options);
    context.fillStyle = TextHandler.getFillColor(options[2]);
    context.fillText(
      point[0].substr(1, point[0].length - 2),
      point[1],
      point[2],
    );
  },
  arc: function(context, point, options) {
    context.beginPath();
    context.arc(point[0], point[1], point[2], point[3], 0, point[4]);

    this.handleOptions(context, options);
  },
  rect: function(context, point, options) {
    this.handleOptions(context, options, true);

    context.strokeRect(point[0], point[1], point[2], point[3]);
    context.fillRect(point[0], point[1], point[2], point[3]);
  },
  image: function(context, point, options) {
    this.handleOptions(context, options, true);

    let image = ImageHandler.images[point[5]];

    return new Promise((resolve) => {
      if (!image) {
        image = new Image();
        image.onload = function() {
          const index = ImageHandler.images.length;

          ImageHandler.lastImageURL = image.src;
          ImageHandler.lastImageIndex = index;

          ImageHandler.images.push(image);
          context.drawImage(image, point[1], point[2], point[3], point[4]);
          resolve();
        };
        image.src = point[0];
        return;
      } else {
        context.drawImage(image, point[1], point[2], point[3], point[4]);
        resolve();
      }
    });
  },
  pdf: function(context, point, options) {
    this.handleOptions(context, options, true);

    let image = pdfHandler.images[point[5]];
    if (!image) {
      image = new Image();
      image.onload = function() {
        const index = ImageHandler.images.length;

        pdfHandler.lastPage = image.src;
        pdfHandler.lastIndex = index;

        pdfHandler.images.push(image);
        context.drawImage(image, point[1], point[2], point[3], point[4]);
      };
      image.src = point[0];
      return;
    }

    context.drawImage(image, point[1], point[2], point[3], point[4]);
    pdfHandler.reset_pos(point[1], point[2]);
  },
  quadratic: function(context, point, options) {
    context.beginPath();
    context.moveTo(point[0], point[1]);
    context.quadraticCurveTo(point[2], point[3], point[4], point[5]);

    this.handleOptions(context, options);
  },
  bezier: function(context, point, options) {
    context.beginPath();
    context.moveTo(point[0], point[1]);
    context.bezierCurveTo(
      point[2],
      point[3],
      point[4],
      point[5],
      point[6],
      point[7],
    );

    this.handleOptions(context, options);
  },
};

export default DrawHelper;
