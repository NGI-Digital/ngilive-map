import proj4 from 'proj4';
import { sensor } from '../types/sensor';

const projectAndRemapSensor = (sensor: sensor): sensor => {
  const coordSystem = sensor.coordSystem;
  const east = sensor.coord[0];
  const north = sensor.coord[1];

  const isNtm = coordSystem.toLowerCase().indexOf('ntm') !== -1;
  const zoneNumber = coordSystem.substring(3);
  const fromCoordSys = isNtm ? `EPSG:51${zoneNumber.length < 2 ? 0 : ''}${zoneNumber}` : `EPSG:258${zoneNumber}`;

  const coord = proj4(fromCoordSys, 'EPSG:4326', [Math.min(east, north), Math.max(east, north)]);

  sensor.coord = [coord[1], coord[0]];
  sensor.coordSystem = 'wgs84';
  return sensor;
};

export default projectAndRemapSensor;
