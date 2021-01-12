import { getColorFromHexRgbOrName } from '@grafana/data';
import { sensorTypeConfig } from 'data/defualtSensorConfig';
import React, { useEffect, useState } from 'react';
import { CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { sensorConfig } from 'types/sensorConfig';
import { Line } from 'react-chartjs-2';
import { getDateTimeFromTimestamp } from 'utilities/utils';
import { Sensor } from 'types/sensor';
import getTimeSerialFromGrafanaStream from 'utilities/sensorTimeSeries';
import { MapMarker } from 'types/mapMarker';

type SensorMarkerProps = {
  marker: MapMarker;
  showSensorNames: boolean;
  data: any;
  options: any;
};

const grafPopupStyle = {
  maxWidth: '500px',
  maxHeight: '300px',
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

const average = (array: number[]) => array.reduce((a, b) => a + b) / array.length;

const getSensorConfig = (type: string): sensorConfig => {
  const currentConfig = sensorTypeConfig.find(s => s.type === type);
  if (currentConfig) {
    return currentConfig;
  }

  return sensorTypeConfig.find(s => s.type === 'default')!;
};

function exportToCsv(s: Sensor) {
  const filename = s.name + '.csv';
  var csvFile = '';
  if (s.timeSerial) {
    const values = s.timeSerial.values;
    const timestamps = s.timeSerial.timestamps;
    for (var i = 0; i < values.length; i++) {
      csvFile += getDateTimeFromTimestamp(timestamps[i]) + ';' + values[i] + '\n';
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

export const SensorMarker: React.FC<SensorMarkerProps> = ({ marker, showSensorNames, data, options }) => {
  const config = getSensorConfig(marker.type);
  const [currentMarker, setCurrentMarker] = useState<MapMarker>(marker);
  const [datapoints, setDataPoints] = useState<number[]>([]);
  const [datapointLabels, setDatapointLabels] = useState<number[]>([]);

  var timeseries_data = {
    labels: datapointLabels,
    datasets: [
      {
        label: '',
        data: datapoints,
        backgroundColor: getColorFromHexRgbOrName('blue'),
        fill: false,
        pointBackgroundColor: getColorFromHexRgbOrName(config.color),
        pointBorderColor: getColorFromHexRgbOrName(config.color),
        pointRadius: 2,
      },
    ],
  };

  var graphOptions = {
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
              day: 'YYYY-MM-DD',
              month: 'YYYY-MM-DD',
              // second: 'HH:mm:ss',
              // minute: 'HH:mm',
              hour: 'MM-DD HH:mm',
            },
          },
        },
      ],
    },
  };

  const getPopupValues = (marker: MapMarker) => {
    if (data) {
      if (!options.useLegacyQuery) {
        const timeserial = getTimeSerialFromGrafanaStream(data, marker.sensor.name, options);
        marker.sensor.timeSerial = timeserial;
        if (timeserial?.values.length > 0) {
          marker.sensor.max = +Math.max(...timeserial.values).toFixed(3);
          marker.sensor.min = +Math.min(...timeserial.values).toFixed(3);
          marker.sensor.mean = +average(timeserial.values).toFixed(3);
          marker.sensor.lastValue =
            timeserial.values[timeserial.timestamps.indexOf(timeserial.timestamps.sort((a, b) => b - a)[0])];
        }
      }
      const extractedDataPoints = marker.sensor.timeSerial?.values ?? [];
      const extractedDataPointLabels = marker.sensor.timeSerial?.timestamps as number[];
      setDataPoints(extractedDataPoints);
      setDatapointLabels(extractedDataPointLabels);
      setCurrentMarker({ ...marker });
    }
  };

  useEffect(() => {}, [marker, data, timeseries_data, options]);

  return (
    <>
      <CircleMarker
        eventHandlers={{
          click: () => {
            getPopupValues(marker);
          },
        }}
        color={config.color}
        center={marker.position}
      >
        {showSensorNames && (
          <Tooltip permanent={true} direction="bottom">
            <b>{marker.name}</b>
          </Tooltip>
        )}
        <Popup>
          {' '}
          <div style={grafPopupStyle}>
            <b>{currentMarker.name}</b>
            <br />
            {currentMarker.type} [{currentMarker.sensor.unit}]
            {config.showDepth && (
              <>
                <br />
                <span>Depth: {currentMarker.sensor.depth}</span>
              </>
            )}
            <br />
            <br />
            <table>
              <tr>
                <td>Last value:</td>
                <td>{currentMarker.sensor.lastValue}</td>
                <td style={{ textAlign: 'center', verticalAlign: 'middle', width: '150px' }} rowSpan={4}>
                  <button style={buttonStyle} onClick={(e): void => exportToCsv(currentMarker.sensor)}>
                    Last ned data
                  </button>
                </td>
              </tr>
              <tr>
                <td>Max:</td>
                <td>{currentMarker.sensor.max}</td>
              </tr>
              <tr>
                <td>Min:</td>
                <td>{currentMarker.sensor.min}</td>
              </tr>
              <tr>
                <td>Mean:</td>
                <td>{currentMarker.sensor.mean}</td>
              </tr>
            </table>
            <br />
            {config.showPlot && (
              <div style={grafStye}>
                <Line data={timeseries_data} options={graphOptions}></Line>
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
