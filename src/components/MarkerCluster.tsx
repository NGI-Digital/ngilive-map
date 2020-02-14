import { useEffect, useState } from 'react';
import { useLeaflet } from 'react-leaflet';
import { Map } from 'leaflet';
import L from 'leaflet';
import { sensor } from 'types/sensor';
import { sensorTypeConfig } from 'data/defualtSensorConfig';
import { sensorConfig } from 'types/sensorConfig';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import '../MarkerCluster.css';
import '../MarkerCluster.Default.css';
import React from 'react';
import ReactDOM from 'react-dom';

type MarkerClusterType = {
  sensors: sensor[];
};

const MarkerCluster: React.FC<MarkerClusterType> = ({ sensors }) => {
  const leaflet = useLeaflet();
  const [markerGroup, setMarkerGroup] = useState();

  function createMarkerPopup(s: sensor, showDepth: boolean) {
    const jsx = (
      <div>
        <b>{s.name}</b>
        <br />
        {s.instrumentType} [{s.unit}]{showDepth ? '<br/>Depth: ' + s.depth : ''}
        <br />
        <br />
        <table>
          <tr>
            <td>Last value:</td>
            <td>{s.lastValue}</td>
          </tr>
          <tr>
            <td>Max:</td>
            <td>{s.max}</td>
          </tr>
          <tr>
            <td>Min:</td>
            <td>{s.min}</td>
          </tr>
          <tr>
            <td>Mean:</td>
            <td>{s.mean}</td>
          </tr>
        </table>
      </div>
    );

    const div = L.DomUtil.create('div', '');
    ReactDOM.render(jsx, div);
    return div;
  }

  useEffect(() => {
    const mcg = L.markerClusterGroup({ spiderfyOnMaxZoom: true, zoomToBoundsOnClick: false, showCoverageOnHover: false });
    setMarkerGroup(mcg);
  }, []);

  useEffect(() => {
    if (markerGroup) {
      {
        markerGroup.clearLayers();
        sensors.map(c => {
          let settings = sensorTypeConfig.find(t => t.type === c.instrumentType);
          if (!settings) {
            settings = sensorTypeConfig.find(t => t.type === 'default') as sensorConfig;
          }

          const popupStr = createMarkerPopup(c, settings.showDepth);
          const marker = L.circleMarker(c.coord as [number, number], { color: settings.color, radius: settings.size });
          marker.bindPopup(popupStr);
          //marker.bindTooltip(popupStr);
          markerGroup.addLayer(marker);
        });

        (leaflet.map as Map).addLayer(markerGroup);

        console.log('Markergroup added: ', markerGroup);
      }
    }
  }, [sensors, markerGroup]);

  return null;
};

export default MarkerCluster;
