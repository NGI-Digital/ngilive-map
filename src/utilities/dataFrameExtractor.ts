import { DataFrame } from '@grafana/data';
import { Sensor } from 'types/sensor';
import projectAndRemapLocObject from './locObjectProjecteorAndMapper';

const extractSensors = (sensors_dataframe: DataFrame): Sensor[] => {
  let sensorsFound: Sensor[] = [];

  for (let index = 0; index < sensors_dataframe.length; index++) {
    let sensor = {} as Sensor;
    sensor.name = sensors_dataframe.fields.find(f => f.name === 'sensor_name')?.values.get(index);
    sensor.coord = [];
    sensor.coord[0] = sensors_dataframe.fields.find(f => f.name === 'pos_east')?.values.get(index);
    sensor.coord[1] = sensors_dataframe.fields.find(f => f.name === 'pos_north')?.values.get(index);
    sensor.coordSystem = sensors_dataframe.fields.find(f => f.name === 'coordinate_system')?.values.get(index);
    sensor.type = sensors_dataframe.fields.find(f => f.name === 'type')?.values.get(index);
    sensor.unit = sensors_dataframe.fields.find(f => f.name === 'unit')?.values.get(index);
    sensor.depth = sensors_dataframe.fields.find(f => f.name === 'depth')?.values.get(index);
    sensorsFound.push(sensor);
  }
  return sensorsFound.map(s => projectAndRemapLocObject(s) as Sensor).filter(s => s.coord[0] > 1 && s.coord[1] > 1);
};

export { extractSensors };
