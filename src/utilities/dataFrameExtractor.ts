import { DataFrame } from '@grafana/data';
import { Sensor } from 'types/sensor';
import { projectAndRemapLocObject } from './projection';
import { Webcam } from 'types/webcam';

export interface FieldsPosHash {
  [fieldName: string]: number;
}

function getFieldIndex(fieldName: string, fieldsArray: any) {
  const numOfColumns = fieldsArray.length;
  for (let i = 0; i < numOfColumns; i++) {
    if (fieldsArray[i].name === fieldName) {
      return i;
    }
  }
  return -1;
}

const extractWebcams = (ws: DataFrame): Webcam[] => {
  const len = ws.fields[0].values.length;
  const returnArray: Webcam[] = [];

  //field indexes for main query (A)
  const colonPos: FieldsPosHash = {};
  const colons: string[] = ['name', 'east', 'north', 'coordinate_system', 'webcamurl'];
  colons.forEach((element: string) => {
    colonPos[element] = getFieldIndex(element, ws.fields);
  });

  for (let i = 0; i < len; i++) {
    if (ws.fields[1].values.get(i) === 0 || ws.fields[2].values.get(i) === 0) {
      continue;
    }
    const wc: Webcam = {
      name: ws.fields[colonPos['name']].values.get(i),
      coord: [ws.fields[colonPos['east']].values.get(i), ws.fields[colonPos['north']].values.get(i)],
      coordSystem: ws.fields[colonPos['coordinate_system']].values.get(i),
      webcamurl: ws.fields[colonPos['webcamurl']].values.get(i),
    };

    returnArray.push(wc);
  }
  return returnArray;
};

export default extractWebcams;

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

export { extractSensors, extractWebcams };
