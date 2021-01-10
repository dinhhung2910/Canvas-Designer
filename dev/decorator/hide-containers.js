import {find} from '../common';

/**
 *
 */
function hideContainers() {
  const additionalContainer = find('additional-container');
  const colorsContainer = find('colors-container');
  const markerContainer = find('marker-container');
  const markerColorContainer = find('marker-fill-colors');
  const pencilContainer = find('pencil-container');
  const pencilColorContainer = find('pencil-fill-colors');
  const lineWidthContainer = find('line-width-container');

  additionalContainer.style.display =
        colorsContainer.style.display =
        markerColorContainer.style.display =
        markerContainer.style.display =
        pencilColorContainer.style.display =
        pencilContainer.style.display =
        lineWidthContainer.style.display = 'none';
}

export default hideContainers;
