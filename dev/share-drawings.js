
import DrawHelper from './draw-helper';
import globalObjects from './global-objects';

// scripts on this page directly touches DOM-elements
// removing or altering anything may cause failures in the UI event handlers
// it is used only to bring collaboration for canvas-surface
let lastPointIndex = 0;

let uid;

window.addEventListener('message', function(event) {
  if (!event.data) return;

  if (!uid) {
    uid = event.data.uid;
  }

  if (event.data.captureStream) {
    webrtcHandler.createOffer(function(sdp) {
      sdp.uid = uid;
      window.parent.postMessage(sdp, '*');
    });
    return;
  }

  if (event.data.renderStream) {
    setTemporaryLine();
    return;
  }

  if (event.data.sdp) {
    webrtcHandler.setRemoteDescription(event.data);
    return;
  }

  if (event.data.genDataURL) {
    const dataURL = context.canvas.toDataURL(event.data.format, 1);
    window.parent.postMessage({
      dataURL: dataURL,
      uid: uid,
    }, '*');
    return;
  }

  if (event.data.undo && points.length) {
    let index = event.data.index;

    if (event.data.tool) {
      const newArray = [];
      const length = points.length;
      const reverse = points.reverse();
      for (let i = 0; i < length; i++) {
        const point = reverse[i];
        if (point[0] !== event.data.tool) {
          newArray.push(point);
        }
      }
      globalObjects.points = newArray.reverse();
      DrawHelper.redraw();
      syncPoints(true);
      return;
    }

    if (index === 'all') {
      globalObjects.points = [];
      DrawHelper.redraw();
      syncPoints(true);
      return;
    }

    if (index.numberOfLastShapes) {
      try {
        points.length -= index.numberOfLastShapes;
      } catch (e) {
        globalObjects.points = [];
      }

      DrawHelper.redraw();
      syncPoints(true);
      return;
    }

    if (index === -1) {
      if (
        points.length &&
        (
          points[points.length - 1][0] === 'pencil' ||
          points[points.length - 1][0] === 'marker'
        )
      ) {
        // const newArray = [];
        const length = points.length;

        /* modification start*/
        // var index;
        for (let i = 0; i < length; i++) {
          const point = points[i];
          if (point[3] === 'start') index = i;
        }
        const copy = [];
        for (let i = 0; i < index; i++) {
          copy.push(points[i]);
        }
        points = copy;
        /* modification ends*/

        DrawHelper.redraw();
        syncPoints(true);
        return;
      }

      points.length = points.length - 1;
      DrawHelper.redraw();
      syncPoints(true);
      return;
    }

    if (points[index]) {
      const newPoints = [];
      for (let i = 0; i < points.length; i++) {
        if (i !== index) {
          newPoints.push(points[i]);
        }
      }
      points = newPoints;
      DrawHelper.redraw();
      syncPoints(true);
    }
    return;
  }

  if (event.data.syncPoints) {
    syncPoints(true);
    return;
  }

  if (event.data.clearCanvas) {
    points = [];
    DrawHelper.redraw();
    return;
  }

  if (!event.data.canvasDesignerSyncData) return;

  // drawing is shared here (array of points)
  const d = event.data.canvasDesignerSyncData;

  if (d.startIndex !== 0) {
    for (let i = 0; i < d.points.length; i++) {
      points[i + d.startIndex] = d.points[i];
    }
  } else {
    globalObjects.points = d.points;
  }

  lastPointIndex = points.length;

  // redraw the <canvas> surfaces
  DrawHelper.redraw();
}, false);

/**
 *
 * @param {*} isSyncAll
 */
function syncPoints(isSyncAll) {
  const {points} = globalObjects;

  if (isSyncAll) {
    lastPointIndex = 0;
  }

  if (lastPointIndex == points.length) return;

  const pointsToShare = [];
  for (let i = lastPointIndex; i < points.length; i++) {
    pointsToShare[i - lastPointIndex] = points[i];
  }

  if (pointsToShare.length) {
    syncData({
      points: pointsToShare || [],
      startIndex: lastPointIndex,
    });
  }

  if (!pointsToShare.length && points.length) return;

  lastPointIndex = points.length;
}

/**
 *
 * @param {*} data
 */
function syncData(data) {
  window.parent.postMessage({
    canvasDesignerSyncData: data,
    uid: uid,
  }, '*');
}

export {
  syncPoints,
};
