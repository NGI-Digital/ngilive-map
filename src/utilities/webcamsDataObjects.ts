import { DataFrame, PanelData } from '@grafana/data';
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

const extractWebcamsFromGrafanaStream = (data: PanelData): webcam[] => {
  const ws = data.series.find(s => s.refId === 'C') as DataFrame;
  const len = ws.fields[0].values.length;
  const returnArray: webcam[] = [];

  //field indexes for main query (A)
  const colonPos: FieldsPosHash = {};
  const colons: string[] = ['name', 'east', 'north', 'coordinate_system', 'webcamurl'];
  colons.forEach((element: string) => {
    colonPos[element] = getFieldIndex(element, ws.fields);
  });

  //console.log('positions', colonPos);
  //console.log("colonPos['name']", colonPos['name']);

  for (let i = 0; i < len; i++) {
    if (ws.fields[1].values.get(i) === 0 || ws.fields[2].values.get(i) === 0) {
      continue;
    }
    const wc: webcam = {
      name: ws.fields[colonPos['name']].values.get(i),
      coord: [ws.fields[colonPos['east']].values.get(i), ws.fields[colonPos['north']].values.get(i)],
      coordSystem: ws.fields[colonPos['coordinate_system']].values.get(i),
      webcamurl: ws.fields[colonPos['webcamurl']].values.get(i),
    };

    returnArray.push(wc);
  }
  return returnArray;
};

export default extractWebcamsFromGrafanaStream;
