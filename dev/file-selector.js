const FileSelector = function() {
  const selector = this;

  selector.selectSingleFile = selectFile;
  selector.selectMultipleFiles = function(callback) {
    selectFile(callback, true);
  };

  /**
   *
   * @param {*} callback
   * @param {*} multiple
   * @param {*} accept
   */
  function selectFile(callback, multiple, accept) {
    const file = document.createElement('input');
    file.type = 'file';

    if (multiple) {
      file.multiple = true;
    }

    file.accept = accept || 'image/*';

    file.onchange = function() {
      if (multiple) {
        if (!file.files.length) {
          console.error('No file selected.');
          return;
        }
        callback(file.files);
        return;
      }

      if (!file.files[0]) {
        console.error('No file selected.');
        return;
      }

      callback(file.files[0]);

      file.parentNode.removeChild(file);
    };
    file.style.display = 'none';
    (document.body || document.documentElement).appendChild(file);
    fireClickEvent(file);
  }

  /**
   *
   * @param {*} element
   */
  function fireClickEvent(element) {
    const evt = new window.MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      button: 0,
      buttons: 0,
      mozInputSource: 1,
    });

    element.dispatchEvent(evt);
  }
};

export default FileSelector;
