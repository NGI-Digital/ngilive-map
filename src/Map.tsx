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
import { getSensorQueryErrors } from 'utilities/queryValidator';
import { extractSensors } from 'utilities/dataFrameExtractor';

const Map: React.FC<PanelProps> = ({ options, data, height, width }) => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [sensorQueryErrors, setSensorQueryErrors] = useState<string[]>([]);

  useEffect(() => {
    proj4.defs(defineProjectionZones());
  }, []);

  useEffect(() => {
    if (options.useMockData) {
      const mapped = mockSensors
        .map(element => projectAndRemapLocObject(element) as Sensor)
        .filter(s => s.coord[0] > 1 && s.coord[1] > 1);
      setSensors(mapped);
    } else if (options.useLegacyQuery) {
      // TODO: Remove when all queries are converted
      const unConvSensors = extractSensorsFromGrafanaStream(data);
      const mapped = unConvSensors
        .map(element => projectAndRemapLocObject(element) as Sensor)
        .filter(s => s.coord[0] > 1 && s.coord[1] > 1);
      setSensors(mapped);
    } else {
      const sensorDataFrame = data.series.find(s => s.refId === 'A') as DataFrame;
      setSensorQueryErrors(getSensorQueryErrors(sensorDataFrame));
      if (sensorQueryErrors.length > 0) {
        return;
      }
      setSensors(extractSensors(sensorDataFrame));
    }
  }, [data, options.useMockData, options.useLegacyQuery]);

  if (sensorQueryErrors.length > 0) {
    return (
      <>
        <p>Missing required fields in query A:</p>
        {sensorQueryErrors.map(m => (
          <p>{m}</p>
        ))}
      </>
    );
  }

  return (
    <>
      <MapContainer
        dragging={!L.Browser.mobile}
        touchZoom={true}
        zoom={8}
        maxZoom={22}
        style={{ height: height, width: width }}
      >
        <MapPanel options={options} sensors={sensors} data={data}></MapPanel>
      </MapContainer>
    </>
  );
};
export { Map };
