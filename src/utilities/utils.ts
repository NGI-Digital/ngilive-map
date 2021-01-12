import { Sensor } from '../types/sensor';
import { BoundsLiteral } from 'leaflet';
//import proj4 from 'proj4';

const getSensorBounds = (sensors: Sensor[]): BoundsLiteral => {
  let minX = 9999999999;
  let maxX = -9999999999;
  let minY = 999999999;
  let maxY = -9999999999;

  sensors.forEach((sensor: Sensor) => {
    minX = minX > sensor.coord[0] ? sensor.coord[0] : minX;
    maxX = maxX < sensor.coord[0] ? sensor.coord[0] : maxX;
    minY = minY > sensor.coord[1] ? sensor.coord[1] : minY;
    maxY = maxY < sensor.coord[1] ? sensor.coord[1] : maxY;
  });

  const bounds: BoundsLiteral = [
    [minX, minY],
    [maxX, maxY],
  ];

  return bounds;
};

const getDateTimeFromTimestamp = (timestamp: number): string => {
  var d = new Date(timestamp);

  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getUTCDay() + 1;
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

export { getDateTimeFromTimestamp, getSensorBounds };
