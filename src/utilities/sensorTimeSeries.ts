import { PanelData } from '@grafana/data';
import { sensorTimeSerial } from '../types/sensorTimeSierial';

const getTimeSerialFromGrafanaStream = (data: PanelData, sensorName: string, options: any): sensorTimeSerial => {
  const timeSerial: sensorTimeSerial = {
    values: [],
    timestamps: [],
  };

  const seriesQuery = options.useLegacyQuery === true ? 'C' : 'B';

  const series = data.series.filter(s => s.refId === seriesQuery && s.name === sensorName);

  series.forEach(s => {
    timeSerial.values.push(...(s.fields.find(f => f.name === 'Value')?.values.toArray() as number[]));
    timeSerial.timestamps.push(...(s.fields.find(f => f.name === 'Time')?.values.toArray() as number[]));
  });

  return timeSerial;
};

export default getTimeSerialFromGrafanaStream;
