import {find} from '../common';

/**
 *
 * @param {*} id
 * @return {*}
 */
export function getContext(id) {
  const context = find(id).getContext('2d');
  context.lineWidth = 2;
  context.strokeStyle = '#6c96c8';
  return context;
}

/**
 *
 * @param {Event} event
 * @param {String} id
 * @return {Boolean}
 */
export function isEventContainDOM(event, id) {
  let contain = false;
  if (event.path) {
    event.path.forEach((elm) => {
      if (elm.id == id) {
        contain = true;
      }
    });
  }
  return contain;
}

