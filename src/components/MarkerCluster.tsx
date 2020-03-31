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
import { Line } from 'react-chartjs-2';
//import merge from 'lodash.chunk';
import { getColorFromHexRgbOrName } from '@grafana/data';
//import {draw, generate} from 'patternomaly'
//import { sensorTimeSerial } from 'types/sensorTimeSierial';

type MarkerClusterType = {
  sensors: sensor[];
};

const MarkerCluster: React.FC<MarkerClusterType> = ({ sensors }) => {
  const leaflet = useLeaflet();
  const [markerGroup, setMarkerGroup] = useState();

  const grafPopupStyle = {
    width: '500px',
    height: '300px',
  };

  const grafStye = {
    width: '300px',
    height: '200px',
  };

  function createMarkerPopup(s: sensor, showDepth: boolean, sensorSetting: sensorConfig) {
    var data2 = {
      labels: [] as number[],
      datasets: [
        {
          label: '',
          data: [] as number[],
          backgroundColor: getColorFromHexRgbOrName('blue'),
          fill: false,
          pointBackgroundColor: getColorFromHexRgbOrName(sensorSetting.color),
          pointBorderColor: getColorFromHexRgbOrName(sensorSetting.color),
          pointRadius: 2,
        },
      ],
    };

    var options = {
      title: {
        display: false,
        text: 'Custom Chart Title',
        fontColor: getColorFromHexRgbOrName('pink'),
      },
      canvas: {
        width: 100,
        height: 75,
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [
          {
            type: 'time',
            distribution: 'linear',
            time: {
              tooltipFormat: 'YYYY-MM-DD HH:mm',
              displayFormats: {
                day: 'YYYY-D/MM',
                second: 'HH:mm:ss',
                minute: 'HH:mm',
                hour: 'D/MM HH',
              },
            },
          },
        ],
      },
    };

    data2.labels = s.timeSerial === null || s.timeSerial === undefined ? ([] as number[]) : (s.timeSerial.timestamps as number[]);
    data2.datasets[0].data = s.timeSerial === null || s.timeSerial == undefined ? ([] as number[]) : s.timeSerial.values;
    data2.datasets[0].label = s.timeSerial === null || s.timeSerial == undefined ? '' : s.instrumentType + '[' + s.unit + ']';

    const jsx = (
      <div style={grafPopupStyle}>
        <b>{s.name}</b>
        <br />
        {s.instrumentType} [{s.unit}]
        {showDepth && (
          <>
            <br />
            <span>Depth: {s.depth}</span>
          </>
        )}
        <br />
        <br />
        <table>
          <tr>
            <td>Last value:</td>
            <td>{s.lastValue}</td>
            {/* <td rowSpan={4}>
              <div style={grafStye}>
                <Line data={data2} options={options}></Line>
              </div>
            </td> */}
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
        <br />
        {sensorSetting.showPlot && (
          <div style={grafStye}>
            <Line data={data2} options={options}></Line>
          </div>
        )}
      </div>
    );

    const div = L.DomUtil.create('div', '');
    ReactDOM.render(jsx, div);
    return div;
  }

  useEffect(() => {
    const mcg = L.markerClusterGroup({
      zoomToBoundsOnClick: false,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
    });
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

          const popupStr = createMarkerPopup(c, settings.showDepth, settings);
          const marker = L.circleMarker(c.coord as [number, number], { color: settings.color, radius: settings.size });
          marker.bindPopup(popupStr);
          //marker.bindTooltip(popupStr);
          markerGroup.addLayer(marker);
        });

        (leaflet.map as Map).addLayer(markerGroup);

        //console.log('Markergroup added: ', markerGroup);
      }
    }
  }, [sensors, markerGroup]);

  return null;
};

export default MarkerCluster;
