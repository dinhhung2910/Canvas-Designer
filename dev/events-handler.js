import {
  tempContext,
  addEvent,
  is,
} from './common';
import globalEvents from './global-events';
import globalObjects from './global-objects';
import PencilHandler from './pencil-handler';
import DrawHelper from './draw-helper';
import {syncPoints} from './share-drawings';
import hideContainers from './decorator/hide-containers';
import * as Hammer from 'hammerjs';
import ZoomHandler from './zoom-handler';
import EraserHandler from './eraser-handler';
import TextHandler from './text-handler';
import ImageHandler from './image-handler';
import DragHelper from './drag-helper';

const {points} = globalObjects;
const canvas = tempContext.canvas;
const isTouch = 'createTouch' in document || 'ontouchstart' in window;

/** Handle zoom event */
if (isTouch) {
  const mc = new Hammer.Manager(canvas);
  const Pinch = new Hammer.Pinch();
  mc.add(Pinch);

  mc.on('pinch', function(e) {
    const x = Math.log10(e.scale) + 1;
    ZoomHandler.applyTemp(x * ZoomHandler.scale);
  });

  mc.on('pinchend', function(e) {
    const x = Math.log10(e.scale) + 1;
    ZoomHandler.multiply(x);
  });
}

addEvent(canvas, isTouch ? 'touchstart' : 'mousedown', function(e) {
  let isMultiTouch = false;

  if (isTouch) {
    if (e.touches && e.touches.length > 1) {
      isMultiTouch = true;
    }

    e = e.pageX ? e : e.touches.length ? e.touches[0] : {
      pageX: 0,
      pageY: 0,
    };
  }

  const cache = is;
  // apply scale
  e = {
    pageX: e.pageX / ZoomHandler.scale,
    pageY: e.pageY / ZoomHandler.scale,
  };

  if (cache.isLine) lineHandler.mousedown(e);
  else if (cache.isArc) arcHandler.mousedown(e);
  else if (cache.isRectangle) rectHandler.mousedown(e);
  else if (cache.isQuadraticCurve) quadraticHandler.mousedown(e);
  else if (cache.isBezierCurve) bezierHandler.mousedown(e);
  else if (cache.isDragLastPath || cache.isDragAllPaths) {
    if (isMultiTouch) {
      DragHelper.cancelMousedown(e);
    } else {
      DragHelper.mousedown(e);
    }
  } else if (cache.isPencil) {
    if (isMultiTouch) {
      PencilHandler.cancelMousedown();
    } else {
      PencilHandler.mousedown(e);
    }
  } else if (cache.isEraser) {
    if (isMultiTouch) {
      // EraserHandler.
    } else {
      EraserHandler.mousedown(e);
    }
  } else if (cache.isText) TextHandler.mousedown(e);
  else if (cache.isImage) ImageHandler.mousedown(e);
  else if (cache.isPdf) pdfHandler.mousedown(e);
  else if (cache.isArrow) arrowHandler.mousedown(e);
  else if (cache.isMarker) markerHandler.mousedown(e);

  !cache.isPdf && DrawHelper.redraw();

  // Hide all option boxes
  hideContainers();
  preventStopEvent(e);
});

/**
 *
 * @param {Event} e
 */
function preventStopEvent(e) {
  if (!e) {
    return;
  }

  if (typeof e.preventDefault === 'function') {
    e.preventDefault();
  }

  if (typeof e.stopPropagation === 'function') {
    e.stopPropagation();
  }
}

addEvent(
  canvas, isTouch ? 'touchend touchcancel mouseup' : 'mouseup',
  function(e) {
    let isMultiTouch = false;

    if (isTouch) {
      if (e.touches && e.touches.length > 1) {
        isMultiTouch = true;
      }
    }

    if (isTouch && (!e || !('pageX' in e))) {
      if (e && e.touches && e.touches.length) {
        e = e.touches[0];
      } else if (e && e.changedTouches && e.changedTouches.length) {
        e = e.changedTouches[0];
      } else {
        e = {
          pageX: 0,
          pageY: 0,
        };
      }
    }

    const cache = is;
    // apply scale
    e = {
      pageX: e.pageX / ZoomHandler.scale,
      pageY: e.pageY / ZoomHandler.scale,
    };

    if (cache.isLine) lineHandler.mouseup(e);
    else if (cache.isArc) arcHandler.mouseup(e);
    else if (cache.isRectangle) rectHandler.mouseup(e);
    else if (cache.isQuadraticCurve) quadraticHandler.mouseup(e);
    else if (cache.isBezierCurve) bezierHandler.mouseup(e);
    else if (cache.isDragLastPath || cache.isDragAllPaths) {
      DragHelper.mouseup(e);
    } else if (cache.isPencil && !isMultiTouch) PencilHandler.mouseup(e);
    else if (cache.isEraser && !isMultiTouch) EraserHandler.mouseup(e);
    else if (cache.isText) TextHandler.mouseup(e);
    else if (cache.isImage) ImageHandler.mouseup(e);
    else if (cache.isPdf) pdfHandler.mousedown(e);
    else if (cache.isArrow) arrowHandler.mouseup(e);
    else if (cache.isMarker) markerHandler.mouseup(e);

    !cache.isPdf && DrawHelper.redraw();

    syncPoints(is.isDragAllPaths || is.isDragLastPath ? true : false);

    preventStopEvent(e);
  });

addEvent(canvas, isTouch ? 'touchmove mousemove' : 'mousemove', function(e) {
  let isMultiTouch = false;

  if (isTouch) {
    if (e.touches && e.touches.length > 1) {
      isMultiTouch = true;
    }

    e = e.pageX ? e : e.touches.length ? e.touches[0] : {
      pageX: 0,
      pageY: 0,
    };
  }

  const cache = is;
  // apply scale
  e = {
    pageX: e.pageX / ZoomHandler.scale,
    pageY: e.pageY / ZoomHandler.scale,
  };

  if (cache.isLine) lineHandler.mousemove(e);
  else if (cache.isArc) arcHandler.mousemove(e);
  else if (cache.isRectangle) rectHandler.mousemove(e);
  else if (cache.isQuadraticCurve) quadraticHandler.mousemove(e);
  else if (cache.isBezierCurve) bezierHandler.mousemove(e);
  else if (cache.isDragLastPath || cache.isDragAllPaths) {
    DragHelper.mousemove(e);
  } else if (cache.isPencil && !isMultiTouch) PencilHandler.mousemove(e);
  else if (cache.isEraser && !isMultiTouch) EraserHandler.mousemove(e);
  else if (cache.isText) TextHandler.mousemove(e);
  else if (cache.isImage) ImageHandler.mousemove(e);
  else if (cache.isPdf) pdfHandler.mousedown(e);
  else if (cache.isArrow) arrowHandler.mousemove(e);
  else if (cache.isMarker) markerHandler.mousemove(e);

  preventStopEvent(e);
});

let keyCode;

/**
 *
 * @param {Event} e
 */
function onkeydown(e) {
  keyCode = e.which || e.keyCode || 0;

  if (keyCode == 8 || keyCode == 46) {
    if (isBackKey(e, keyCode)) {
      // back key pressed
    }
    return;
  }

  if (e.metaKey) {
    globalEvents.isControlKeyPressed = true;
    keyCode = 17;
  }

  if (!globalEvents.isControlKeyPressed && keyCode === 17) {
    globalEvents.isControlKeyPressed = true;
  }
}

/**
 *
 * @param {Event} e
 * @param {*} keyCode
 * @return {*}
 */
function isBackKey(e, keyCode) {
  let doPrevent = false;
  const d = e.srcElement || e.target;
  if ((d.tagName.toUpperCase() === 'INPUT' &&
            (
              d.type.toUpperCase() === 'TEXT' ||
                d.type.toUpperCase() === 'PASSWORD' ||
                d.type.toUpperCase() === 'FILE' ||
                d.type.toUpperCase() === 'SEARCH' ||
                d.type.toUpperCase() === 'EMAIL' ||
                d.type.toUpperCase() === 'NUMBER' ||
                d.type.toUpperCase() === 'DATE')
  ) ||
        d.tagName.toUpperCase() === 'TEXTAREA') {
    doPrevent = d.readOnly || d.disabled;
  } else {
    doPrevent = true;
  }

  if (doPrevent) {
    e.preventDefault();
  }
  return doPrevent;
}

addEvent(document, 'keydown', onkeydown);

/**
 *
 * @param {*} e
 */
function onkeyup(e) {
  if (e.which == null && (e.charCode != null || e.keyCode != null)) {
    e.which = e.charCode != null ? e.charCode : e.keyCode;
  }

  keyCode = e.which || e.keyCode || 0;

  if (keyCode === 13 && is.isText) {
    // no handle anumore
    // TextHandler.onReturnKeyPressed();
    return;
  }

  if (keyCode == 8 || keyCode == 46) {
    if (isBackKey(e, keyCode)) {
      // no handle anymore
      // TextHandler.writeText(TextHandler.lastKeyPress, true);
    }
    return;
  }

  // Ctrl + t
  if (globalEvents.isControlKeyPressed && keyCode === 84 && is.isText) {
    TextHandler.showTextTools();
    return;
  }

  // Ctrl + z
  if (globalEvents.isControlKeyPressed && keyCode === 90) {
    if (points.length) {
      points.length = points.length - 1;
      DrawHelper.redraw();

      syncPoints(is.isDragAllPaths || is.isDragLastPath ? true : false);
    }
  }

  // Ctrl + a
  if (globalEvents.isControlKeyPressed && keyCode === 65) {
    DragHelper.global.startingIndex = 0;

    endLastPath();

    setSelection(find('drag-all-paths'), 'DragAllPaths');
  }

  // Ctrl + c
  if (globalEvents.isControlKeyPressed && keyCode === 67 && points.length) {
    copy();
  }

  // Ctrl + v
  if (
    globalEvents.isControlKeyPressed &&
    keyCode === 86 &&
    copiedStuff.length
  ) {
    paste();

    syncPoints(is.isDragAllPaths || is.isDragLastPath ? true : false);
  }

  // Ending the Control Key
  if (typeof e.metaKey !== 'undefined' && e.metaKey === false) {
    globalEvents.isControlKeyPressed = false;
    keyCode = 17;
  }

  if (keyCode === 17) {
    globalEvents.isControlKeyPressed = false;
  }
}

addEvent(document, 'keyup', onkeyup);

/**
 *
 * @param {*} e
 */
function onkeypress(e) {
  if (e.which == null && (e.charCode != null || e.keyCode != null)) {
    e.which = e.charCode != null ? e.charCode : e.keyCode;
  }

  keyCode = e.which || e.keyCode || 0;

  const inp = String.fromCharCode(keyCode);
  if (/[a-zA-Z0-9-_ !?|\/'",.=:;(){}\[\]`~@#$%^&*+-]/.test(inp)) {
    // no handle anymore
    // TextHandler.writeText(String.fromCharCode(keyCode));
  }
}

addEvent(document, 'keypress', onkeypress);

/**
 *
 * @param {*} e
 */
function onTextFromClipboard(e) {
  if (!is.isText) return;
  let pastedText;
  if (window.clipboardData && window.clipboardData.getData) { // IE
    pastedText = window.clipboardData.getData('Text');
  } else if (e.clipboardData && e.clipboardData.getData) {
    pastedText = e.clipboardData.getData('text/plain');
  }
  if (pastedText && pastedText.length) {
    TextHandler.writeText(pastedText);
  }
}

addEvent(document, 'paste', onTextFromClipboard);
