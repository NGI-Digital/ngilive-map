import { getColorFromHexRgbOrName } from '@grafana/data';
import { sensorTypeConfig } from 'data/defualtSensorConfig';
import { MapMarker } from 'MapPanel';
import React from 'react';
import { CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { sensorConfig } from 'types/sensorConfig';
import { Line } from 'react-chartjs-2';
import { getDateTimeFromTimestamp } from 'utilities/utils';
import { Sensor } from 'types/sensor';

type SensorMarkerProps = {
  marker: MapMarker;
  showSensorNames: boolean;
};

const grafPopupStyle = {
  width: '500px',
  height: '300px',
};

const grafStye = {
  width: '300px',
  height: '200px',
};

const buttonStyle = {
  color: 'black',
  backgroundColor: 'lightgrey',
  fontSize: 'small',
  padding: '0px 3px',
};

const getSensorConfig = (type: string): sensorConfig => {
  const currentConfig = sensorTypeConfig.find(s => s.type === type);
  if (currentConfig) {
    return currentConfig;
  }

  return sensorTypeConfig.find(s => s.type === 'default')!;
};

function exportToCsv(event: React.MouseEvent, s: Sensor) {
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

export const SensorMarker: React.FC<SensorMarkerProps> = ({ marker, showSensorNames }) => {
  const config = getSensorConfig(marker.type);

  var data2 = {
    labels: [] as number[],
    datasets: [
      {
        label: '',
        data: [] as number[],
        backgroundColor: getColorFromHexRgbOrName('blue'),
        fill: false,
        pointBackgroundColor: getColorFromHexRgbOrName(config.color),
        pointBorderColor: getColorFromHexRgbOrName(config.color),
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

  return (
    <>
      <CircleMarker color={config.color} center={marker.position}>
        {showSensorNames && (
          <Tooltip permanent={true} direction="bottom">
            <b>{marker.name}</b>
          </Tooltip>
        )}
        <Popup>
          {' '}
          <div style={grafPopupStyle}>
            <b>{marker.name}</b>
            <br />
            {marker.type} [{marker.sensor.unit}]
            {config.showDepth && (
              <>
                <br />
                <span>Depth: {marker.sensor.depth}</span>
              </>
            )}
            <br />
            <br />
            <table>
              <tr>
                <td>Last value:</td>
                <td>{marker.sensor.lastValue}</td>
                <td style={{ textAlign: 'center', verticalAlign: 'middle', width: '150px' }} rowSpan={4}>
                  <button style={buttonStyle} onClick={(e): void => exportToCsv(e, marker.sensor)}>
                    Last ned data
                  </button>
                </td>
              </tr>
              <tr>
                <td>Max:</td>
                <td>{marker.sensor.max}</td>
              </tr>
              <tr>
                <td>Min:</td>
                <td>{marker.sensor.min}</td>
              </tr>
              <tr>
                <td>Mean:</td>
                <td>{marker.sensor.mean}</td>
              </tr>
            </table>
            <br />
            {config.showPlot && (
              <div style={grafStye}>
                <Line data={data2} options={options}></Line>
              </div>
            )}
          </div>
        </Popup>
      </CircleMarker>
      {showSensorNames && (
        <Tooltip permanent={true} direction="bottom">
          <b>{marker.name}</b>
        </Tooltip>
      )}
    </>
  );
};
