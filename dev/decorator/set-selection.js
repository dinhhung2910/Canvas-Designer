import {
  is,
  endLastPath,
} from '../common';
import hideContainers from './hide-containers';

/**
 *
 * @param {*} element
 * @param {*} prop
 */
function setSelection(element, prop) {
  endLastPath();
  hideContainers();

  is.set(prop);

  const selected = document.getElementsByClassName('selected-shape')[0];
  if (selected) {
    selected.className = selected.className.replace(/selected-shape/g, '');
  }

  if (!element.className) {
    element.className = '';
  }

  element.className += ' selected-shape';
}

export default setSelection;
