import React from 'react';
import { MapContainer } from 'react-leaflet';
import { PanelProps } from '@grafana/data';
import 'leaflet/dist/leaflet.css';
import { MapPanel } from 'MapPanel';
import L from 'leaflet';

const Map: React.FC<PanelProps> = ({ options, data, height, width }) => {
  return (
    <MapContainer
      dragging={!L.Browser.mobile}
      touchZoom={true}
      zoom={8}
      maxZoom={22}
      style={{ height: height, width: width }}
    >
      <MapPanel options={options} data={data}></MapPanel>
    </MapContainer>
  );
};
export { Map };
