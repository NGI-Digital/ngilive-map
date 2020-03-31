import { sensor } from 'types/sensor';
import getTimeSerial from './sensorTimeSeries';
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

function getLastValueForInstrumentID(instrumentID: string, dataArray: any, instrumentIdFieldIndex: number, lastValueFieldIndex: number) {
  const numRecords = dataArray.fields[0].values.buffer.length;
  let rowNr = 0;

  for (let i = 0; i < numRecords; i++) {
    if (instrumentID === dataArray.fields[instrumentIdFieldIndex].values.buffer[i]) {
      rowNr = i;
      break;
    }
  }

  //console.log("rowNr", rowNr);
  let retValue: number;
  retValue = dataArray.fields[lastValueFieldIndex].values.buffer[rowNr];
  return retValue;
}

const extractSensorsFromGrafanaStream = (data: any): sensor[] => {
  //console.log('dataobject:', data);
  const s = data.series[0];
  // Require a query B with two field instrument_id and last_value
  const lastValues = data.series[1];
  const len = s.fields[0].values.buffer.length;
  const returnArray: sensor[] = [];

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
    colonPos[element] = getFieldIndex(element, s.fields);
  });

  //console.log('positions', colonPos);
  //console.log("colonPos['instrument_name']", colonPos['instrument_name']);

  // field indexes for query B with last_value for instrument
  const instrumentIdFieldIndexQRYB = getFieldIndex('instrument_id', lastValues.fields);
  const lastValueFieldIndexQRYB = getFieldIndex('last_value', lastValues.fields);

  for (let i = 0; i < len; i++) {
    if (s.fields[1].values.buffer[i] === 0 || s.fields[2].values.buffer[i] === 0) {
      continue;
    }

    const us: sensor = {
      name: s.fields[colonPos['instrument_name']].values.buffer[i],
      id: s.fields[colonPos['instrument_id']].values.buffer[i],
      coord: [s.fields[colonPos['xpos']].values.buffer[i], s.fields[colonPos['ypos']].values.buffer[i]],
      coordSystem: s.fields[colonPos['coordinate_system']].values.buffer[i],
      depth: s.fields[colonPos['depth']].values.buffer[i],
      unit: s.fields[colonPos['unit']].values.buffer[i],
      min: s.fields[colonPos['min']].values.buffer[i],
      max: s.fields[colonPos['max']].values.buffer[i],
      mean: s.fields[colonPos['avg']].values.buffer[i],
      instrumentType: s.fields[colonPos['instrument_type']].values.buffer[i],
      timeSerial: getTimeSerial(data, s.fields[colonPos['instrument_name']].values.buffer[i]),
    };
    const lastValue: number = getLastValueForInstrumentID(
      s.fields[colonPos['instrument_id']].values.buffer[i],
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
