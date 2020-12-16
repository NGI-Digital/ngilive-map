import proj4 from 'proj4';
import { Sensor } from '../types/sensor';
import { Webcam } from '../types/webcam';

const defineProjectionZones = () => {
  const zoneDefinitions = [];
  for (let i = 5; i <= 30; i++) {
    zoneDefinitions.push([
      `EPSG:51${i < 10 ? '0' : ''}${i}`,
      `+proj=tmerc +lat_0=58 +lon_0=${i}.5 +k=1 +x_0=100000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs`,
    ]);
  }

  for (let i = 30; i <= 35; i++) {
    zoneDefinitions.push([`EPSG:258${i}`, `+proj=utm +zone=${i} +ellps=GRS80 +units=m +no_defs`]);
  }
  return zoneDefinitions;
};

const projectAndRemapLocObject = (lokObject: Sensor | Webcam): Sensor | Webcam => {
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
    const coord = proj4(fromCoordSys, 'EPSG:4326', [Math.min(east, north), Math.max(east, north)]);

    newLokObject.coord = [coord[1], coord[0]];
    return newLokObject;
  } else {
    const coord = proj4('EPSG:' + coordSystem, 'EPSG:4326', [Math.min(east, north), Math.max(east, north)]);

    newLokObject.coord = [coord[1], coord[0]];
    return newLokObject;
  }
};

export { projectAndRemapLocObject, defineProjectionZones };
