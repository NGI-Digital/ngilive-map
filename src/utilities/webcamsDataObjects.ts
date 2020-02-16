import { webcam } from 'types/webcam';
//import { FilterFieldsByNameTransformerOptions } from '@grafana/data';

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

const extractWebcamsFromGrafanaStream = (data: any): webcam[] => {
  console.log('dataobject:', data);
  const ws = data.series[2];
  // Require a query B with two field instrument_id and last_value
  const len = ws.fields[0].values.buffer.length;
  const returnArray: webcam[] = [];

  //field indexes for main query (A)
  const colonPos: FieldsPosHash = {};
  const colons: string[] = ['name', 'east', 'north', 'coordinate_system', 'webcamurl'];
  colons.forEach((element: string) => {
    colonPos[element] = getFieldIndex(element, ws.fields);
  });

  console.log('positions', colonPos);
  console.log("colonPos['name']", colonPos['name']);

  for (let i = 0; i < len; i++) {
    if (ws.fields[1].values.buffer[i] === 0 || ws.fields[2].values.buffer[i] === 0) {
      continue;
    }
    const wc: webcam = {
      name: ws.fields[colonPos['name']].values.buffer[i],
      coord: [ws.fields[colonPos['east']].values.buffer[i], ws.fields[colonPos['north']].values.buffer[i]],
      coordSystem: ws.fields[colonPos['coordinate_system']].values.buffer[i],
      webcamurl: ws.fields[colonPos['webcamurl']].values.buffer[i],
    };

    returnArray.push(wc);
  }
  return returnArray;
};

export default extractWebcamsFromGrafanaStream;
