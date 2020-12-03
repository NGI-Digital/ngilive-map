import React from 'react';
import { MapContainer } from 'react-leaflet';
import { PanelProps } from '@grafana/data';
import 'leaflet/dist/leaflet.css';
import { MapPanel } from 'MapPanel';

const Map: React.FC<PanelProps> = ({ options, data, height, width }) => {
  return (
    <MapContainer zoom={8} maxZoom={18} style={{ height: height, width: width }}>
      <MapPanel options={options} data={data}></MapPanel>
    </MapContainer>
  );
};
export { Map };
