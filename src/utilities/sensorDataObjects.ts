import { DataFrame, PanelData } from '@grafana/data';
import { Sensor } from 'types/sensor';

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

function getLastValueForInstrumentID(
  instrumentID: string,
  dataArray: any,
  instrumentIdFieldIndex: number,
  lastValueFieldIndex: number
) {
  const numRecords = dataArray.fields[0].values.buffer.length;
  let rowNr = 0;

  for (let i = 0; i < numRecords; i++) {
    if (instrumentID === dataArray.fields[instrumentIdFieldIndex].values.buffer[i]) {
      rowNr = i;
      break;
    }
  }

  let retValue: number;
  retValue = dataArray.fields[lastValueFieldIndex].values.buffer[rowNr];
  return retValue;
}

const extractSensorsFromGrafanaStream = (data: PanelData): Sensor[] => {
  // const s = data.series[0];
  const samples = data.series.find(s => s.refId === 'A') as DataFrame;
  // Require a query B with two field instrument_id and last_value
  const lastValues = data.series.find(s => s.refId === 'B') as DataFrame;
  const len = samples.fields[0].values.length; // buffer.length;
  const returnArray: Sensor[] = [];

  //field indexes for main query (A)
  const colonPos: FieldsPosHash = {};
  const colons: string[] = [
    'instrument_name',
    'instrument_id',
    'xpos',
    'ypos',
    'coordinate_system',
    'unit',
    'min',
    'max',
    'avg',
    'instrument_type',
    'area',
    'depth',
  ];
  colons.forEach((element: string) => {
    colonPos[element] = getFieldIndex(element, samples.fields);
  });

  // field indexes for query B with last_value for instrument
  const instrumentIdFieldIndexQRYB = getFieldIndex('instrument_id', lastValues.fields);
  const lastValueFieldIndexQRYB = getFieldIndex('last_value', lastValues.fields);

  for (let i = 0; i < len; i++) {
    if (samples.fields[1].values.get(i) === 0 || samples.fields[2].values.get(i) === 0) {
      continue;
    }

    const us: Sensor = {
      name: samples.fields[colonPos['instrument_name']].values.get(i),
      id: samples.fields[colonPos['instrument_id']].values.get(i),
      coord: [samples.fields[colonPos['xpos']].values.get(i), samples.fields[colonPos['ypos']].values.get(i)],
      coordSystem: samples.fields[colonPos['coordinate_system']].values.get(i),
      depth: samples.fields[colonPos['depth']].values.get(i),
      unit: samples.fields[colonPos['unit']].values.get(i),
      min: samples.fields[colonPos['min']].values.get(i),
      max: samples.fields[colonPos['max']].values.get(i),
      mean: samples.fields[colonPos['avg']].values.get(i),
      type: samples.fields[colonPos['instrument_type']].values.get(i),
    };
    const lastValue: number = getLastValueForInstrumentID(
      samples.fields[colonPos['instrument_id']].values.get(i),
      lastValues,
      instrumentIdFieldIndexQRYB,
      lastValueFieldIndexQRYB
    );
    us.lastValue = lastValue;
    returnArray.push(us);
  }
  return returnArray;
};

export default extractSensorsFromGrafanaStream;
