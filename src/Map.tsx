import React, { useEffect, useState } from 'react';
import { MapContainer } from 'react-leaflet';
import { DataFrame, PanelProps } from '@grafana/data';
import 'leaflet/dist/leaflet.css';
import { MapPanel } from 'MapPanel';
import L from 'leaflet';
import { mockSensors } from 'data/mockSensors';
import extractSensorsFromGrafanaStream from 'utilities/sensorDataObjects';
import { Sensor } from 'types/sensor';
import proj4 from 'proj4';
import { getSensorQueryErrors } from 'utilities/queryValidator';
import extractWebcams, { extractSensors } from 'utilities/dataFrameExtractor';
import { defineProjectionZones, projectAndRemapLocObject } from 'utilities/projection';
import { mockWebcams } from 'data/mockWebcams';
import { Webcam } from 'types/webcam';

const Map: React.FC<PanelProps> = ({ options, data, height, width }) => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [sensorQueryErrors, setSensorQueryErrors] = useState<string[]>([]);
  const [webcams, setWebcams] = useState<Webcam[]>([]);

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
      const errors = getSensorQueryErrors(sensorDataFrame);
      setSensorQueryErrors(errors);
      if (errors.length > 0) {
        return;
      }
      setSensors(extractSensors(sensorDataFrame));
    }

    if (options.enableWebCams) {
      const webcamDataFrame = data.series.find(s => s.refId === 'C') as DataFrame;
      const unConvWebcams = options.useMockData ? mockWebcams : extractWebcams(webcamDataFrame);
      const mapWebcams: Webcam[] = unConvWebcams.map(element => projectAndRemapLocObject(element) as Webcam);
      setWebcams(mapWebcams);
    }
  }, [data, options.useMockData, options.useLegacyQuery, options.enableWebCams]);

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
        <MapPanel options={options} sensors={sensors} webcams={webcams} data={data}></MapPanel>
      </MapContainer>
    </>
  );
};
export { Map };
