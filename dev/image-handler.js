import DrawHelper from './draw-helper';
import globalObjects from './global-objects';
import {syncPoints} from './share-drawings';

const ImageHandler = {
  lastImageURL: null,
  lastImageIndex: 0,
  images: [],

  ismousedown: false,
  prevX: 0,
  prevY: 0,
  load: function(width, height) {
    const t = ImageHandler;
    globalObjects.points.push([
      'image',
      [
        ImageHandler.lastImageURL,
        t.prevX, t.prevY, width, height,
        ++ImageHandler.lastImageIndex,
      ],
      DrawHelper.getOptions(),
    ]);
    document.getElementById('drag-last-path').click();

    // share to webrtc
    syncPoints(true);
  },
  mousedown: function(e) {
    const x = e.pageX - canvas.offsetLeft;
    const y = e.pageY - canvas.offsetTop;

    const t = this;

    t.prevX = x;
    t.prevY = y;

    t.ismousedown = true;
  },
  mouseup: function(e) {
    const x = e.pageX - canvas.offsetLeft;
    const y = e.pageY - canvas.offsetTop;

    const t = this;
    if (t.ismousedown) {
      globalObjects.points.push([
        'image',
        [
          ImageHandler.lastImageURL,
          t.prevX,
          t.prevY,
          x - t.prevX,
          y - t.prevY,
          ImageHandler.lastImageIndex,
        ],
        DrawHelper.getOptions(),
      ]);

      t.ismousedown = false;
    }
  },
  mousemove: function(e) {
    const x = e.pageX - canvas.offsetLeft;
    const y = e.pageY - canvas.offsetTop;

    const t = this;
    if (t.ismousedown) {
      TempContext.clearRect(0, 0, innerWidth, innerHeight);

      DrawHelper.image(
        tempContext,
        [
          ImageHandler.lastImageURL,
          t.prevX,
          t.prevY,
          x - t.prevX,
          y - t.prevY,
          ImageHandler.lastImageIndex,
        ],
      );
    }
  },
};

export default ImageHandler;
