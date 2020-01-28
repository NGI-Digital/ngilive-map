import { sensor } from 'types/sensor';
import { MocSensor } from 'data/mockDataSmall';

const strutcureMocDataObjects = (mocData: MocSensor[]): sensor[] => {
  const len = mocData.length;
  const tmpOutp: sensor[] = [];
  for (let i = 0; i < len; i++) {
    const s: sensor = {
      name: mocData[i].INSTRUMENT_NAME,
      id: mocData[i].INSTRUMENT_ID,
      coord: [mocData[i].XPOS, mocData[i].YPOS],
      coordSystem: mocData[i].COORDINATE_SYSTEM,
      unit: mocData[i].SAMPLE_TYPE,
      instrumentType: mocData[i].TYPE,
      max: mocData[i].MAX,
      min: mocData[i].MIN,
      mean: mocData[i].MEAN,
    };
    tmpOutp.push(s);
  }
  return tmpOutp;
};

export default strutcureMocDataObjects;
