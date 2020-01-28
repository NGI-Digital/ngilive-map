import { sensor } from 'types/sensor';
import { FilterFieldsByNameTransformerOptions } from '@grafana/data';

export interface IHash {
  [fieldName: string]: number;
}

function getFieldIndex(fieldName: string, fieldsArray: any) {
  //console.log("fieldsArray", fieldsArray);
  const numOfColumns = fieldsArray.length;
  for (let i = 0; i < numOfColumns; i++) {
      if (fieldsArray[i].name === fieldName) {
        return i;
      }
  }
  return -1;
}

function getLastValueForInstrumentID(instrumentID: string, dataArray: any) {
  const numRecords = dataArray.fields[0].values.buffer.length;
  let rowNr: number = 0;

  //console.log("instrument_id",instrumentID);
  //console.log("lastValues:", dataArray);

  for (let i = 0; i < numRecords; i++) {
    if (instrumentID === dataArray.fields[0].values.buffer[i]) {
      rowNr = i;
      break;
    };
  }

  //console.log("rowNr", rowNr);
  let retValue: number;
  retValue = dataArray.fields[1].values.buffer[rowNr];
  return retValue;

}

const extractSensorsFromGrafanaStream = (data: any): sensor[] => {
  console.log("dataobject:" , data);
  const s = data.series[0];
  const lastValues = data.series[1];
  const len = s.fields[0].values.buffer.length;
  const tmpOutp: sensor[] = [];

  let colonPos: IHash = {};
  

  let colons: string[] = ['instrument_name','instrument_id','xpos','ypos','coordinate_system','unit','min','max','avg','instrument_type','area'];
  colons.forEach( (element: string) =>{
    colonPos[element] = getFieldIndex(element,s.fields);
  });

  
  console.log("positions", colonPos);
  console.log("colonPos['instrument_name']", colonPos['instrument_name']);



  for (let i = 0; i < len; i++) {
    if (s.fields[1].values.buffer[i] === 0 || s.fields[2].values.buffer[i] === 0) {
      continue;
    }
    const us: sensor = {
      name: s.fields[colonPos['instrument_name']].values.buffer[i], 
      id: s.fields[colonPos['instrument_id']].values.buffer[i],
      coord: [s.fields[colonPos['xpos']].values.buffer[i], s.fields[colonPos['ypos']].values.buffer[i]],
      coordSystem: s.fields[colonPos['coordinate_system']].values.buffer[i],
      unit: s.fields[colonPos['unit']].values.buffer[i],
      min: s.fields[colonPos['min']].values.buffer[i],
      max: s.fields[colonPos['max']].values.buffer[i],
      mean: s.fields[colonPos['avg']].values.buffer[i],
      instrumentType: s.fields[colonPos['instrument_type']].values.buffer[i],
    };
    const lastValue: number = getLastValueForInstrumentID(s.fields[colonPos['instrument_id']].values.buffer[i],lastValues);
    us.lastValue = lastValue;
    tmpOutp.push(us);
  }
  return tmpOutp;
};

export default extractSensorsFromGrafanaStream;
