import React, { useEffect, useState } from 'react';
import { MapContainer } from 'react-leaflet';
import { DataFrame, PanelProps } from '@grafana/data';
import 'leaflet/dist/leaflet.css';
import { MapPanel } from 'MapPanel';
import L from 'leaflet';
import { mockSensors } from 'data/mockSensors';
import extractSensorsFromGrafanaStream from 'utilities/sensorDataObjects';
import projectAndRemapLocObject from 'utilities/locObjectProjecteorAndMapper';
import { Sensor } from 'types/sensor';
import proj4 from 'proj4';
import defineProjectionZones from 'utilities/defineProjectionZones';

const Map: React.FC<PanelProps> = ({ options, data, height, width }) => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [missingFieldsQueryA, setMissingFieldsQueryA] = useState<string[]>([]);

  useEffect(() => {
    console.log({ data });
    proj4.defs(defineProjectionZones());

    if (options.useMockData) {
      const mapped = mockSensors
        .map(element => projectAndRemapLocObject(element) as Sensor)
        .filter(s => s.coord[0] > 1 && s.coord[1] > 1);
      setSensors(mapped);
    } else if (options.useLegacyQuery) {
      const unConvSensors = extractSensorsFromGrafanaStream(data);
      const mapped = unConvSensors
        .map(element => projectAndRemapLocObject(element) as Sensor)
        .filter(s => s.coord[0] > 1 && s.coord[1] > 1);
      setSensors(mapped);
    } else {
      const sensors_dataframe = data.series.find(s => s.refId === 'A') as DataFrame;

      let sensorsFound: Sensor[] = [];

      const requiredFields = ['sensor_name', 'pos_east', 'pos_north', 'coordinate_system', 'type'];

      let tmpMissingFieldsQueryA: string[] = [];
      requiredFields.forEach(req_field => {
        const field = sensors_dataframe.fields.find(f => f.name === req_field);
        if (!field) {
          tmpMissingFieldsQueryA.push(req_field);
        }
      });
      setMissingFieldsQueryA(tmpMissingFieldsQueryA);

      if (tmpMissingFieldsQueryA.length > 0) {
        return;
      }

      for (let index = 0; index < sensors_dataframe.length; index++) {
        let sensor = {} as Sensor;
        sensor.name = sensors_dataframe.fields.find(f => f.name === 'sensor_name')?.values.get(index);
        sensor.coord = [];
        sensor.coord[0] = sensors_dataframe.fields.find(f => f.name === 'pos_east')?.values.get(index);
        sensor.coord[1] = sensors_dataframe.fields.find(f => f.name === 'pos_north')?.values.get(index);
        sensor.coordSystem = sensors_dataframe.fields.find(f => f.name === 'coordinate_system')?.values.get(index);
        sensor.instrumentType = sensors_dataframe.fields.find(f => f.name === 'type')?.values.get(index);
        sensor.unit = sensors_dataframe.fields.find(f => f.name === 'unit')?.values.get(index);
        sensor.depth = sensors_dataframe.fields.find(f => f.name === 'depth')?.values.get(index);
        sensorsFound.push(sensor);
      }
      setSensors(
        sensorsFound.map(s => projectAndRemapLocObject(s) as Sensor).filter(s => s.coord[0] > 1 && s.coord[1] > 1)
      );
    }
  }, [data, options.useMockData, options.useLegacyQuery]);

  if (missingFieldsQueryA.length > 0) {
    return (
      <>
        <p>Missing required fields in query A:</p>
        {missingFieldsQueryA.map(m => (
          <p>{m}</p>
        ))}
      </>
    );
  }

  return (
    <MapContainer
      dragging={!L.Browser.mobile}
      touchZoom={true}
      zoom={8}
      maxZoom={22}
      style={{ height: height, width: width }}
    >
      <MapPanel options={options} sensors={sensors} data={data}></MapPanel>
    </MapContainer>
  );
};
export { Map };
