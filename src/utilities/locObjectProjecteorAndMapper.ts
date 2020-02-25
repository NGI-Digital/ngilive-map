import proj4 from 'proj4';
import { sensor } from '../types/sensor';
import { webcam } from '../types/webcam';

const projectAndRemapLocObject = (lokObject: sensor | webcam): sensor | webcam => {
  const coordSystem = lokObject.coordSystem;
  const east = lokObject.coord[0];
  const north = lokObject.coord[1];

  const isNtm = coordSystem.toLowerCase().indexOf('ntm') !== -1;
  const zoneNumber = coordSystem.substring(3);
  const fromCoordSys = isNtm ? `EPSG:51${zoneNumber.length < 2 ? 0 : ''}${zoneNumber}` : `EPSG:258${zoneNumber}`;

  //const coord = proj4(fromCoordSys, 'EPSG:3857', [Math.min(east, north), Math.max(east, north)]);
  //console.log('coord', [Math.min(east, north), Math.max(east, north)], fromCoordSys);

  // leaflet operates witn (north,east)
  const coord = proj4(fromCoordSys, 'EPSG:4326', [Math.min(east, north), Math.max(east, north)]);

  lokObject.coord = [coord[1], coord[0]];
  //console.log('lokObject', lokObject);
  //lokObject.coordSystem = 'wgs84';
  return lokObject;
};

export default projectAndRemapLocObject;
