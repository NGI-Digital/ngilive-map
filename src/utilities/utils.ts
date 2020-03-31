import { sensor } from '../types/sensor';
import { envelope } from '../types/envelope';
//import proj4 from 'proj4';

const getSensorsExtent = (sensorArray: sensor[]): envelope => {
  const tmpMapEx: envelope = {
    minX: 9999999999,
    maxX: -9999999999,
    minY: 999999999,
    maxY: -9999999999,
  };
  sensorArray.forEach((sensor: sensor) => {
    tmpMapEx.minX = tmpMapEx.minX > sensor.coord[0] ? sensor.coord[0] : tmpMapEx.minX;
    tmpMapEx.maxX = tmpMapEx.maxX < sensor.coord[0] ? sensor.coord[0] : tmpMapEx.maxX;
    tmpMapEx.minY = tmpMapEx.minY > sensor.coord[1] ? sensor.coord[1] : tmpMapEx.minY;
    tmpMapEx.maxY = tmpMapEx.maxY < sensor.coord[1] ? sensor.coord[1] : tmpMapEx.maxY;
  });

  // console.log('envelope', tmpMapEx);
  // const minCoord = proj4('EPSG:3857', 'EPSG:4326', [tmpMapEx.minY, tmpMapEx.minX]);
  // const maxCoord = proj4('EPSG:3857', 'EPSG:4326', [tmpMapEx.maxY, tmpMapEx.maxX]);
  // console.log('min:max', minCoord, maxCoord);

  // const mapEx: envelope = {
  //   minX: minCoord[1],
  //   maxX: maxCoord[1],
  //   minY: minCoord[0],
  //   maxY: maxCoord[0],
  // };

  return tmpMapEx;
};

export { getSensorsExtent };
