import { DataFrame, PanelData } from '@grafana/data';
import { sensorTimeSerial } from '../types/sensorTimeSierial';

const getTimeSerialFromGrafanaStream = (data: PanelData, sensorName: string): sensorTimeSerial => {
  const timeSerial: sensorTimeSerial = {
    values: [],
    timestamps: []
  }

  const series = data.series.filter(s => s.refId === 'C' && s.name === sensorName)
  
  series.forEach(s => {
    timeSerial.values.push(...s.fields.find(f => f.name === 'Value')?.values.toArray() as number[])
    timeSerial.timestamps.push(...s.fields.find(f => f.name === 'Time')?.values.toArray() as number[])
  })

  return timeSerial
};

export default getTimeSerialFromGrafanaStream;
