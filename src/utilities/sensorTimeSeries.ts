import { sensorTimeSerial } from '../types/sensorTimeSierial';

const getTimeSerialFromGrafanaStream = (data: any, sensorName: string): sensorTimeSerial => {
  const returnData: sensorTimeSerial = {
    values: [],
    timestamps: [],
  };

  const series = data.series;
  for (let serial of series) {
    if (typeof serial.name !== 'undefined') {
      if (serial.name === sensorName) {
        const vals = serial.fields[0].values.buffer;
        const timestamps = serial.fields[1].values.buffer;
        returnData.values = vals;
        returnData.timestamps = timestamps;
      }
    }
  }

  return returnData;
};

export default getTimeSerialFromGrafanaStream;
