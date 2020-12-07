import proj4 from 'proj4';
import { Sensor } from '../types/sensor';
import { webcam } from '../types/webcam';

const projectAndRemapLocObject = (lokObject: Sensor | webcam): Sensor | webcam => {
  // Clone the current object to prevent messing with Grafans data object
  let newLokObject = { ...lokObject };

  const coordSystem = lokObject.coordSystem;
  const east = lokObject.coord[0];
  const north = lokObject.coord[1];

  if (isNaN(+coordSystem)) {
    const isNtm = coordSystem.toLowerCase().indexOf('ntm') !== -1;
    const zoneNumber = coordSystem.substring(3);
    const fromCoordSys = isNtm ? `EPSG:51${zoneNumber.length < 2 ? 0 : ''}${zoneNumber}` : `EPSG:258${zoneNumber}`;
    // leaflet operates witn (north,east)
    //const coord = proj4(zoneNumber, 'EPSG:4326', [Math.min(east, north), Math.max(east, north)]);
    const coord = proj4(fromCoordSys, 'EPSG:4326', [Math.min(east, north), Math.max(east, north)]);

    newLokObject.coord = [coord[1], coord[0]];
    return newLokObject;
  } else {
    const coord = proj4('EPSG:' + coordSystem, 'EPSG:4326', [Math.min(east, north), Math.max(east, north)]);

    newLokObject.coord = [coord[1], coord[0]];
    return newLokObject;
  }
};

export default projectAndRemapLocObject;
