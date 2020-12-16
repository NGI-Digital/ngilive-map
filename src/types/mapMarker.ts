import { LatLngExpression } from 'leaflet';
import { Sensor } from './sensor';
import { sensorConfig } from './sensorConfig';

export type MapMarker = {
  position: LatLngExpression;
  name: string;
  type: string;
  sensor: Sensor;
  config: sensorConfig;
};
