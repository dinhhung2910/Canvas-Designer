const path = require('path');

module.exports = {
  entry:  [
    //'./dev/head.js',
    './dev/common.js',

    './dev/draw-helper.js',
    './dev/drag-helper.js',
    './dev/pencil-handler.js',
    './dev/marker-handler.js',
    './dev/eraser-handler.js',
    './dev/text-handler.js',
    './dev/arc-handler.js',
    './dev/line-handler.js',
    './dev/arrow-handler.js',
    './dev/rect-handler.js',
    './dev/quadratic-handler.js',
    './dev/bezier-handler.js',
    './dev/zoom-handler.js',
    './dev/file-selector.js',
    './dev/image-handler.js',
    './dev/pdf-handler.js',

    './dev/data-uris.js',

    './dev/decorator.js',
    './dev/events-handler.js',

    './dev/share-drawings.js',
    './dev/webrtc-handler.js',
    './dev/canvas-designer-widget.js',

    //'./dev/tail.js'
  ]
};