import {options} from './constants';

const globalOptions = {
  pencilStrokeStyle: localStorage.getItem(options.PENCIL_STROKE_STYLE) || '',
  pencilLineWidth: localStorage.getItem(options.PENCIL_LINE_WIDTH) || '',
  markerStrokeStyle: '',
  lineCap: 'round',
  lineJoin: 'round',
  fillStyle: 'rgba(0,0,0,0)',
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  font: '15px "Arial"',
};

const saveSingleOption = (option, value) => {
  switch (option) {
  case 'pencilStrokeStyle':
    localStorage.setItem(options.PENCIL_STROKE_STYLE, value);
    break;
  case 'pencilLineWidth':
    localStorage.setItem(options.PENCIL_LINE_WIDTH, value);
    break;
  }
  globalOptions[option] = value;
};

export const saveOptions = (options) => {
  Object.keys(options).forEach((en) => {
    saveSingleOption(en, options[en]);
  });
};

window['globalOptions'] = globalOptions;

export default globalOptions;

