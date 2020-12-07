// Defines type sensor that is used before and after projetion
import { sensorTimeSerial } from './sensorTimeSierial';

export type Sensor = {
  name: string;
  id: number;
  coord: number[];
  coordSystem: string;
  unit: string;
  instrumentType: string;
  depth?: number;
  min?: number;
  max?: number;
  mean?: number;
  lastValue?: number;
  timeSerial?: sensorTimeSerial;
};
