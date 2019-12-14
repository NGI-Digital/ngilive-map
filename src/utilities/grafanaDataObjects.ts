import { sensor } from 'types/sensor';

const extractSensorsFromGrafanaStream = (data: any): sensor[] => {
  const s = data.series[0]
  const len = s.fields[0].values.buffer.length;
  const tmpOutp: sensor[] = [];

  for (let i = 0; i < len; i++) {
    if (s.fields[1].values.buffer[i] === 0 || s.fields[2].values.buffer[i] === 0) {
      continue;
    }
    let us: sensor = {
      "id": s.fields[0].values.buffer[i],
      "coord": [s.fields[1].values.buffer[i], s.fields[2].values.buffer[i]],
      "coordSystem": s.fields[3].values.buffer[i],
      "sampleType": s.fields[4].values.buffer[i],
      "min": s.fields[5].values.buffer[i],
      "max": s.fields[6].values.buffer[i],
      "mean": s.fields[7].values.buffer[i],
      "instrumentType": s.fields[8].values.buffer[i]
    }
    tmpOutp.push(us);
  }
  return tmpOutp;
}

export default extractSensorsFromGrafanaStream;