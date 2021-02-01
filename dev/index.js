
import CanvasDesigner from './canvas-designer-widget';
const designer = new CanvasDesigner();

// you can place widget.html anywhere
designer.widgetHtmlURL = 'widget.html';
designer.widgetJsURL = 'widget.min.js';

designer.addSyncListener(function(data) {
  connection.send(data);
});

designer.setSelected('pencil');

designer.setTools({
  pencil: true,
  text: true,
  image: true,
  pdf: true,
  eraser: true,
  line: true,
  arrow: true,
  dragSingle: true,
  dragMultiple: true,
  arc: true,
  rectangle: true,
  quadratic: true,
  bezier: true,
  marker: true,
  zoom: false,
  lineWidth: true,
  colorsPicker: true,
  extraOptions: true,
  code: true,
  undo: true,
});

designer.appendTo(document.getElementById('widget-container'));

Array.prototype.slice.call(document.getElementById('action-controls').querySelectorAll('input[type=checkbox]')).forEach(function(checkbox) {
  checkbox.onchange = function() {
    designer.destroy();

    designer.addSyncListener(function(data) {
      connection.send(data);
    });

    const tools = {};
    Array.prototype.slice.call(document.getElementById('action-controls').querySelectorAll('input[type=checkbox]')).forEach(function(checkbox2) {
      if (checkbox2.checked) {
        tools[checkbox2.id] = true;
      }
    });
    designer.setTools(tools);
    designer.appendTo(document.getElementById('widget-container'));
  };
});

const undoOptions = document.getElementById('undo-options');

document.getElementById('btn-display-undo-popup').onclick = function() {
  document.getElementById('light').style.display = 'block';
  document.getElementById('fade').style.display = 'block';
};

const txtNumberOfShapesToUndo = document.getElementById('number-of-shapes-to-undo');
txtNumberOfShapesToUndo.onkeyup = function() {
  localStorage.setItem('number-of-shapes-to-undo', txtNumberOfShapesToUndo.value);
};

if (localStorage.getItem('number-of-shapes-to-undo')) {
  txtNumberOfShapesToUndo.value = localStorage.getItem('number-of-shapes-to-undo');
  txtNumberOfShapesToUndo.onkeyup();
}

undoOptions.onchange = function() {
  txtNumberOfShapesToUndo.parentNode.style.display = 'none';

  if (undoOptions.value === 'Specific Range') {
    //
  } else if (undoOptions.value === 'Last Multiple') {
    txtNumberOfShapesToUndo.parentNode.style.display = 'block';
  }

  localStorage.setItem('undo-options', undoOptions.value);
};

undoOptions.onclick = undoOptions.onchange;

if (localStorage.getItem('undo-options')) {
  undoOptions.value = localStorage.getItem('undo-options');
  undoOptions.onchange();
}

document.getElementById('btn-undo').onclick = function() {
  if (undoOptions.value === 'All Shapes') {
    designer.undo('all');
  } else if (undoOptions.value === 'Specific Range') {
    designer.undo({
      specificRange: {
        start: -1,
        end: -1,
      },
    });
  } else if (undoOptions.value === 'Last Shape') {
    designer.undo(-1);
  } else if (undoOptions.value === 'Last Multiple') {
    let numberOfLastShapes = txtNumberOfShapesToUndo.value;
    numberOfLastShapes = parseInt(numberOfLastShapes || 0) || 0;
    designer.undo({
      numberOfLastShapes: numberOfLastShapes,
    });
  }

  closeUndoPopup();
};

function closeUndoPopup() {
  document.getElementById('light').style.display = 'none';
  document.getElementById('fade').style.display = 'none';

  undoOptions.onchange();
}
document.getElementById('btn-close-undo-popup').onclick = closeUndoPopup;

function closeDataURLPopup() {
  document.getElementById('dataURL-popup').style.display = 'none';
  document.getElementById('fade').style.display = 'none';

  dataURLFormat.onchange();
}
document.getElementById('btn-close-dataURL-popup').onclick = closeDataURLPopup;

document.getElementById('export-as-image').onclick = function() {
  linkToImage.innerHTML = linkToImage.href = linkToImage.style = '';

  document.getElementById('dataURL-popup').style.display = 'block';
  document.getElementById('fade').style.display = 'block';

  getDataURL();
};

function getDataURL(callback) {
  callback = callback || function() {};
  const format = dataURLFormat.value;
  designer.toDataURL(format || 'image/png', function(dataURL) {
    linkToImage.style = 'margin-left: 10px;display: block;text-align: center;margin-bottom: -50px;';
    linkToImage.href = dataURL;
    linkToImage.innerHTML = 'Click to Download Image';
    linkToImage.download = 'image.' + (format || 'image/png').split('/')[1];

    callback(dataURL, format);
  });
}

var dataURLFormat = document.getElementById('data-url-format');
var linkToImage = document.getElementById('link-to-image');

dataURLFormat.onchange = function() {
  localStorage.setItem('data-url-format', dataURLFormat.value);
  getDataURL();
};
dataURLFormat.onclick = dataURLFormat.onchange;

if (localStorage.getItem('data-url-format')) {
  dataURLFormat.value = localStorage.getItem('data-url-format');
  dataURLFormat.onchange();
}

document.getElementById('btn-getDataURL').onclick = function() {
  getDataURL(function(dataURL, format) {
    window.open(dataURL);
  });

  // closeDataURLPopup();
};

document.getElementById('btn-close-comments-popup').onclick = function() {
  document.getElementById('comments-popup').style.display = 'none';
  document.getElementById('fade').style.display = 'none';

  dataURLFormat.onchange();
};

function showCommentsPopup(e) {
  document.getElementById('comments-popup').style.display = 'block';
  document.getElementById('fade').style.display = 'block';
}
document.getElementById('btn-comments').onclick = showCommentsPopup;
if (location.hash.length && location.hash.indexOf('comment') !== -1) {
  showCommentsPopup();
}

var connection = new RTCMultiConnection();

connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
connection.socketMessageEvent = 'canvas-designer';

connection.enableFileSharing = false;
connection.session = {
  audio: true,
  video: true,
  data: true,
};
connection.sdpConstraints.mandatory = {
  OfferToReceiveAudio: true,
  OfferToReceiveVideo: true,
};
connection.dontCaptureUserMedia = true;
if (location.hash.replace('#', '').length) {
  const roomid = location.hash.replace('#', '');
  connection.join(roomid);
}

connection.onUserStatusChanged = function(event) {
  const infoBar = document.getElementById('hide-on-datachannel-opened');
  if (event.status == 'online') {
    infoBar.innerHTML = event.userid + ' is <b>online</b>.';
  }

  if (event.status == 'offline') {
    infoBar.innerHTML = event.userid + ' is <b>offline</b>.';
  }

  numberOfConnectedUsers.innerHTML = connection.getAllParticipants().length;
};

var numberOfConnectedUsers = document.getElementById('number-of-connected-users');
connection.onopen = function(event) {
  const infoBar = document.getElementById('hide-on-datachannel-opened');
  infoBar.innerHTML = '<b>' + event.userid + '</b> is ready to collaborate with you.';

  if (designer.pointsLength <= 0) {
    // make sure that remote user gets all drawings synced.
    setTimeout(function() {
      connection.send('plz-sync-points');
    }, 1000);
  }

  numberOfConnectedUsers.innerHTML = connection.getAllParticipants().length;

  if (connection.isInitiator) {
    setTimeout(function() {
      designer.renderStream();
    }, 1000);
  }
};

connection.onclose = connection.onerror = connection.onleave = function() {
  numberOfConnectedUsers.innerHTML = connection.getAllParticipants().length;
};

connection.onmessage = function(event) {
  if (event.data === 'plz-sync-points') {
    designer.sync();
    return;
  }

  designer.syncData(event.data);
};

function onOpenRoom() {
  // capture canvas-2d stream
  // and share in realtime using RTCPeerConnection.addStream
  // requires: dev/webrtc-handler.js
  designer.captureStream(function(stream) {
    connection.attachStreams = [stream];
    connection.onstream({
      stream: stream,
    });
  });
}

const video = document.querySelector('video');

connection.onstream = function(event) {
  if (connection.isInitiator && event.mediaElement) return;

  video.style.display = '';
  video.srcObject = event.stream;

  document.getElementById('select-tools').style.display = 'none';
};

connection.onstreamended = function() {
  video.src = null;
  video.style.display = 'none';
};
