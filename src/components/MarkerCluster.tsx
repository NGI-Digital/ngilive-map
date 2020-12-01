import { useEffect, useState } from 'react';
import { useLeaflet } from 'react-leaflet';
import { Map, Util } from 'leaflet';
import L from 'leaflet';
import { sensor } from 'types/sensor';
import { sensorTypeConfig } from 'data/defualtSensorConfig';
import { sensorConfig } from 'types/sensorConfig';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import '../MarkerCluster.css';
import '../MarkerCluster.Default.css';
//import React from 'react';
import React, { Component, MouseEvent } from 'react';
import ReactDOM from 'react-dom';
import { Line } from 'react-chartjs-2';
//import merge from 'lodash.chunk';
import { getColorFromHexRgbOrName } from '@grafana/data';
import getTimeSerialFromGrafanaStream from '../utilities/sensorTimeSeries';
//import { Button } from '@grafana/ui';
import { getDateTimeFromTimestamp } from '../utilities/utils';

type MarkerClusterType = {
  sensors: sensor[];
  data: any;
};

type SensorValues = {
  timestamps: [];
  values: [];
};

const MarkerCluster: React.FC<MarkerClusterType> = ({ sensors, data }) => {
  const leaflet = useLeaflet();
  const [markerGroup, setMarkerGroup] = useState<any>();

  // const MyButton2: React.Component<SensorValues, {}, any> = ({timestamps: [], values: []}) => {
  //   render() {
  //     return <button onClick={this.handleClick}>{this.props.children}</button>;
  //   }
  // }

  // class MyButton extends Component<SensorValues> {
  //   handleClick(event: MouseEvent) {
  //     event.preventDefault();
  //     //exportToCsv('test.csv', [1, 2, 3], [10, 11, 12]);
  //     alert(this.props.timestamps.length); // alerts BUTTON
  //   }
  //   render() {
  //     return <button onClick={this.handleClick}>{this.props.children}</button>;
  //   }
  // }

  const buttonStyle = {
    color: 'black',
    backgroundColor: 'lightgrey',
    fontSize: 'small',
    padding: '0px 3px',
  };
  const grafPopupStyle = {
    width: '500px',
    height: '300px',
  };

  const grafStye = {
    width: '300px',
    height: '200px',
  };

  function exportToCsv(event: React.MouseEvent, s: sensor) {
    const filename = s.name + '.csv';
    var csvFile = '';
    if (s.timeSerial) {
      const values = s.timeSerial.values;
      const timestamps = s.timeSerial.timestamps;
      for (var i = 0; i < values.length; i++) {
        csvFile += getDateTimeFromTimestamp(timestamps[i]) + ';' + values[i].toFixed(3) + '\n';
      }

      var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
      if (navigator.msSaveBlob) {
        // IE 10+
        navigator.msSaveBlob(blob, filename);
      } else {
        var link = document.createElement('a');
        if (link.download !== undefined) {
          // feature detection
          // Browsers that support HTML5 download attribute
          var url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    }
  }

  function createMarkerPopup(s: sensor, showDepth: boolean, sensorSetting: sensorConfig, data: any) {
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

    // Adding data to marker opbjet to be able to plot it
    if (s.timeSerial == null) {
      s.timeSerial = getTimeSerialFromGrafanaStream(data, s.name);
    }

    data2.labels =
      s.timeSerial === null || s.timeSerial === undefined ? ([] as number[]) : (s.timeSerial.timestamps as number[]);
    data2.datasets[0].data =
      s.timeSerial === null || s.timeSerial === undefined ? ([] as number[]) : s.timeSerial.values;
    data2.datasets[0].label =
      s.timeSerial === null || s.timeSerial === undefined ? '' : s.instrumentType + '[' + s.unit + ']';

    //var svars = new SensorValues();
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
        {/* <MyButton>Hei</MyButton> */}
        <table>
          <tr>
            <td>Last value:</td>
            <td>{s.lastValue}</td>
            <td style={{ textAlign: 'center', verticalAlign: 'middle', width: '150px' }} rowSpan={4}>
              <button style={buttonStyle} onClick={(e): void => exportToCsv(e, s)}>
                Last ned data
              </button>
            </td>
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

  function createEmptyPopup() {
    const div = L.DomUtil.create('div', '');
    const jsx = <div></div>;
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

          //const popupStr = createMarkerPopup(c, settings.showDepth, settings);
          const marker = L.circleMarker(c.coord as [number, number], { color: settings.color, radius: settings.size });

          marker.bindPopup(() => {
            //console.log('marker', marker);
            return createMarkerPopup(c, true, settings as sensorConfig, data);
            //return 'HEI';
          });
          // .on('popupclose', () => {
          //   //console.log('on close');
          //   marker.setPopupContent(createEmptyPopup());
          // });

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
