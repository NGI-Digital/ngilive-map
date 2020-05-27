import React, { useRef, useEffect, useState } from 'react';
import { Map, TileLayer, Popup, Marker, LayersControl, WMSTileLayer } from 'react-leaflet';
import proj4 from 'proj4';
import projectAndRemapLocObject from 'utilities/locObjectProjecteorAndMapper';
import defineProjectionZones from 'utilities/defineProjectionZones';
import { mapLayer } from 'types/mapLayer';
import { mockLayers } from 'data/mockLayers';
import EsriTiledMapLayer from 'components/EsriTiledMapLayer';
import EsriDynamicLayer from 'components/EsriDynamicLayer';
// import LegendControl from 'components/LegendControl';
import extractSensorsFromGrafanaStream from 'utilities/sensorDataObjects';
import { sensor } from 'types/sensor';
import { mockSensors } from 'data/mockSensors';
import { mockWebcams } from 'data/mockWebcams';
//import strutcureMocDataObjects from 'utilities/mocDataObjectsConverter';
import { Map as LeafletMap } from 'leaflet';
import { envelope } from 'types/envelope';
import { getSensorsExtent } from 'utilities/utils';
import { sensorTypeConfig } from 'data/defualtSensorConfig';
//import { sensorConfig } from 'types/sensorConfig';
import { PanelProps } from '@grafana/data';
import LegendControl from 'components/LegendControl';
import WMSLegendControl from 'components/WMSLegendControl';
import MarkerCluster from 'components/MarkerCluster';
import 'leaflet/dist/leaflet.css';
import { webcam } from 'types/webcam';
import extractWebcamsFromGrafanaStream from 'utilities/webcamsDataObjects';
import { iconCamera } from 'utilities/defineIcons';
//import { setGrafanaVariable } from 'utilities/setGrafanaVariable.ts_x';

const MapPanel: React.FC<PanelProps> = ({ options, data, height, width }) => {
  const mapElement = useRef<any>();
  const mainMap = useRef<any>();
  const position: [number, number] = [60, 10.5];

  const [webcams, setWebcams] = useState<webcam[]>([]);
  const [sensors, setSensors] = useState<sensor[]>([]);
  const [layers, setLayers] = useState<mapLayer[]>([]);

  useEffect(() => {
    proj4.defs(defineProjectionZones());
    const configLayerList = options.layers;
    setLayers(options.useMockLayers ? mockLayers : configLayerList);

    // Example on usage of setGrafanaVariable
    // Could be called on a click event as well
    // setGrafanaVariable("test", "2")
  }, []);

  useEffect(() => {
    //console.log(options);
    const unConvSensors = options.useMockData ? mockSensors : extractSensorsFromGrafanaStream(data);
    const mapSensors: sensor[] = unConvSensors.map(element => projectAndRemapLocObject(element) as sensor);
    const sensorsExtent: envelope = getSensorsExtent(mapSensors);
    setSensors(mapSensors);

    // get webcams
    if (options.enableWebCams) {
      const unConvWebcams = options.useMockData ? mockWebcams : extractWebcamsFromGrafanaStream(data);
      const mapWebcams: webcam[] = unConvWebcams.map(element => projectAndRemapLocObject(element) as webcam);
      setWebcams(mapWebcams);
    }

    if (mapSensors.length > 0) {
      const m = mainMap.current.leafletElement as LeafletMap;
      m.fitBounds([
        [sensorsExtent.minX, sensorsExtent.minY],
        [sensorsExtent.maxX, sensorsExtent.maxY],
      ]);
    }
  }, [data]);
  const layerElement = (layer: any) => (
    <>
      {layer.type === 'WMSLayer' && (
        <WMSTileLayer
          url={layer.serviceUrl}
          layers={layer.WMSLayers}
          opacity={layer.opacity}
          transparent={true}
          format={'image/png'}
          tileSize={layer.tileSize != null ? layer.tileSize : 1024}
        />
      )}
      {layer.type === 'WMStiledLayer' && (
        <WMSTileLayer
          url={layer.serviceUrl}
          layers={layer.WMSLayers}
          opacity={layer.opacity}
          transparent={true}
          format={'image/png'}
          tileSize={layer.tileSize != null ? layer.tileSize : 1024}
        />
      )}
      {layer.type === 'tiledLayer' && <TileLayer url={layer.serviceUrl} />}
      {layer.type === 'esriTiledMapLayer' && <EsriTiledMapLayer url={layer.serviceUrl} />}
      {layer.type === 'esriDynamicMapLayer' && <EsriDynamicLayer url={layer.serviceUrl} />}
    </>
  );

  return (
    <Map ref={mainMap} center={position} zoom={8} maxZoom={18} style={{ height: height, width: width }}>
      <LayersControl ref={mapElement} position="bottomright">
        {layers
          .filter(l => l.isBaseMap)
          .map(layer => (
            <LayersControl.BaseLayer name={layer.name} checked={layer.isVisible}>
              {layerElement(layer)}
            </LayersControl.BaseLayer>
          ))}
        {layers
          .filter(l => !l.isBaseMap)
          .map(layer => (
            <LayersControl.Overlay name={layer.name} checked={layer.isVisible}>
              {layerElement(layer)}
            </LayersControl.Overlay>
          ))}
      </LayersControl>
      <LegendControl
        symbols={sensorTypeConfig.filter(ts => sensors.find(s => (s.instrumentType ? s.instrumentType : 'default') === ts.type))}
      ></LegendControl>
      <WMSLegendControl mapLayers={layers}></WMSLegendControl>
      <MarkerCluster sensors={sensors} data={data}></MarkerCluster>
      {webcams.map(c => {
        return (
          <Marker icon={iconCamera} position={c.coord as [number, number]}>
            <Popup>
              <a href={c.webcamurl} target="_blank">
                <img src={c.webcamurl} width={200} />
              </a>
            </Popup>
          </Marker>
        );
      })}
    </Map>
  );
};
export { MapPanel };
