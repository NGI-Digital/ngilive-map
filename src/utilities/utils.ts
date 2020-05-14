import { sensor } from '../types/sensor';
import { envelope } from '../types/envelope';
import { formatLabels } from '@grafana/data';
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

const getDateTimeFromTimestamp = (timestamp: number): string => {
  var d = new Date(timestamp);

  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getUTCDay() + 1;
  //console.log('y', y, 'm', m, 'd', day);
  // Hours part from the timestamp
  const hours = d.getHours();
  // Minutes part from the timestamp
  const minutes = '0' + d.getMinutes();
  // Seconds part from the timestamp
  const seconds = '0' + d.getSeconds();

  // Will display time in 10:30:23 format
  const formattedTime = y + '.' + m + '.' + day + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  //const formattedTime = d.toString();
  return formattedTime;
};

export { getSensorsExtent, getDateTimeFromTimestamp };
