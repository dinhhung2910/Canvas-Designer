import {
  tempContext,
  is,
} from './common';
import DrawHelper from './draw-helper';
import globalObjects from './global-objects';
import globalOptions from './global-options';

const TextHandler = {
  text: '',
  selectedFontFamily: 'Arial',
  selectedFontSize: '15',
  lastFillStyle: '',
  onShapeSelected: function() {
    tempContext.canvas.style.cursor = 'text';
    this.x = this.y = this.pageX = this.pageY = 0;
    this.text = '';
  },
  onShapeUnSelected: function() {
    this.text = '';
    this.showOrHideTextTools('hide');
    tempContext.canvas.style.cursor = 'default';

    if (typeof this.blinkCursorInterval !== 'undefined') {
      clearInterval(this.blinkCursorInterval);
    }
  },
  getFillColor: function(color) {
    color = (color || globalOptions.fillStyle).toLowerCase();

    if (
      color == 'rgba(255, 255, 255, 0)' ||
      color == 'transparent' ||
      color === 'white'
    ) {
      return 'black';
    }

    return color;
  },
  writeText: function(keyPressed, isBackKeyPressed) {
    if (!is.isText) return;

    if (isBackKeyPressed) {
      this.text =
        this.text.substr(0, this.text.length - 1);
      this.fillText(this.text);
      return;
    }

    this.text += keyPressed;
    this.fillText(this.text);
  },
  fillText: function(text) {
    if (!is.isText) return;

    tempContext.clearRect(
      0, 0,
      tempContext.canvas.width, tempContext.canvas.height,
    );

    const options = this.getOptions();
    DrawHelper.handleOptions(tempContext, options);
    tempContext.fillStyle = this.getFillColor(options[2]);
    tempContext.font = this.selectedFontSize + 'px "' +
      this.selectedFontFamily + '"';

    tempContext.fillText(text, this.x, this.y);
  },
  blinkCursorInterval: null,
  index: 0,
  blinkCursor: function() {
    this.index++;
    if (this.index % 2 == 0) {
      this.fillText(this.text + '|');
    } else {
      this.fillText(this.text);
    }
  },
  getOptions: function() {
    const options = {
      font: this.selectedFontSize + 'px "' +
        this.selectedFontFamily + '"',
      fillStyle: this.getFillColor(),
      strokeStyle: '#6c96c8',
      globalCompositeOperation: 'source-over',
      globalAlpha: 1,
      lineJoin: 'round',
      lineCap: 'round',
      lineWidth: 2,
    };
    globalOptions.font = options.font;
    return options;
  },
  appendPoints: function() {
    const options = this.getOptions();
    globalObjects.points.push([
      'text',
      ['"' + this.text + '"', this.x, this.y],
      DrawHelper.getOptions(options),
    ]);
  },
  mousedown: function(e) {
    if (!is.isText) return;

    if (this.text.length) {
      this.appendPoints();
    }

    this.x = this.y = 0;
    this.text = '';

    this.pageX = e.pageX;
    this.pageY = e.pageY;

    this.x = e.pageX - tempContext.canvas.offsetLeft - 5;
    this.y = e.pageY - tempContext.canvas.offsetTop + 10;

    if (typeof this.blinkCursorInterval !== 'undefined') {
      clearInterval(this.blinkCursorInterval);
    }

    this.blinkCursor();
    this.blinkCursorInterval = setInterval(this.blinkCursor.bind(this), 700);

    this.showTextTools();
    this.focusVirtualTextbox();
  },
  mouseup: function(e) {},
  mousemove: function(e) {},
  showOrHideTextTools: function(show) {
    if (show === 'hide') {
      if (this.lastFillStyle.length) {
        globalOptions.fillStyle = this.lastFillStyle;
        this.lastFillStyle = '';
      }
    } else if (!this.lastFillStyle.length) {
      this.lastFillStyle = globalOptions.fillStyle;
      globalOptions.fillStyle = 'black';
    }

    this.fontFamilyBox.style.display = show == 'show' ? 'block' : 'none';
    this.fontSizeBox.style.display = show == 'show' ? 'block' : 'none';

    this.fontSizeBox.style.left = this.x + 'px';
    this.fontFamilyBox.style.left =
      (this.fontSizeBox.clientWidth + this.x) + 'px';

    this.fontSizeBox.style.top = this.y + 'px';
    this.fontFamilyBox.style.top = this.y + 'px';
  },
  showTextTools: function() {
    if (!this.fontFamilyBox || !this.fontSizeBox) return;

    this.unselectAllFontFamilies();
    this.unselectAllFontSizes();

    this.showOrHideTextTools('show');

    this.eachFontFamily(function(child) {
      /**
       *
       * @param {*} e
       * @this f
       */
      function f(e) {
        e.preventDefault();

        this.showOrHideTextTools('hide');
        this.selectedFontFamily = e.target.innerHTML;
        this.className = 'font-family-selected';
      };
      child.onclick = f.bind(this);
      child.style.fontFamily = child.innerHTML;
    });

    this.eachFontSize(function(child) {
      child.onclick = (e) => {
        e.preventDefault();

        this.showOrHideTextTools('hide');

        this.selectedFontSize = e.target.innerHTML;
        this.className = 'font-family-selected';
      };
      // child.style.fontSize = child.innerHTML + 'px';
    });
  },

  /**
     * In order to support mobile devices,
     * or support some special language
     * It will create an hidden textbox
     * User will type into this textbox
     */
  focusVirtualTextbox: function() {
    let textbox = document.getElementById('virtual-textbox');

    if (!textbox) {
      textbox = document.createElement('input');
      textbox.id = 'virtual-textbox';
      textbox.setAttribute('type', 'text');
      textbox.style.opacity = '0';
      textbox.style.position = 'absolute';
      textbox.style.backgroundColor = 'red';
      textbox.style.bottom = '0';
      textbox.style.left = '0';
      // textbox.style.display = 'none';

      textbox.addEventListener('keyup', function(e) {
        this.text = e.target.value;
        this.fillText(e.target.value);
      }.bind(this));
    }

    textbox.value = '';
    document.body.append(textbox);
    setTimeout(() => {
      textbox.focus();
    }, 300);
  },
  eachFontFamily: function(callback) {
    const childs = this.fontFamilyBox.querySelectorAll('li');
    for (let i = 0; i < childs.length; i++) {
      callback.call(this, childs[i]);
    }
  },
  unselectAllFontFamilies: function() {
    this.eachFontFamily((child) => {
      child.className = '';
      if (child.innerHTML === this.selectedFontFamily) {
        child.className = 'font-family-selected';
      }
    });
  },
  eachFontSize: function(callback) {
    const childs = this.fontSizeBox.querySelectorAll('li');
    for (let i = 0; i < childs.length; i++) {
      callback.call(this, childs[i]);
    }
  },
  unselectAllFontSizes: function() {
    this.eachFontSize((child) => {
      child.className = '';
      if (child.innerHTML === this.selectedFontSize) {
        child.className = 'font-size-selected';
      }
    });
  },
  onReturnKeyPressed: function() {
    if (!this.text || !this.text.length) return;
    const fontSize = parseInt(this.selectedFontSize) || 15;
    this.mousedown({
      pageX: this.pageX,
      pageY: this.pageY + fontSize + 5,
    });
    drawHelper.redraw();
  },
  fontFamilyBox: document.querySelector('.fontSelectUl'),
  fontSizeBox: document.querySelector('.fontSizeUl'),
};

export default TextHandler;
