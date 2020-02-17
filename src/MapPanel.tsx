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
import { Map as LeafletMap, Control } from 'leaflet';
import { envelope } from 'types/envelope';
import { getSensorsExtent } from 'utilities/utils';
import { sensorTypeConfig } from 'data/defualtSensorConfig';
//import { sensorConfig } from 'types/sensorConfig';
import { PanelProps } from '@grafana/data';
import LegendControl from 'components/LegendControl';
import MarkerCluster from 'components/MarkerCluster';
import 'leaflet/dist/leaflet.css';
import { webcam } from 'types/webcam';
import extractWebcamsFromGrafanaStream from 'utilities/webcamsDataObjects';
import { iconCamera } from 'utilities/defineIcons';

const MapPanel: React.FC<PanelProps> = ({ options, data, height, width }) => {
  const mapElement = useRef<any>();
  const mainMap = useRef<any>();
  const position: [number, number] = [60, 10.5];

  const [webcams, setWebcams] = useState<webcam[]>([]);
  const [sensors, setSensors] = useState<sensor[]>([]);
  const [layers, setLayers] = useState<mapLayer[]>([]);

  useEffect(() => {
    //console.log('Define projecteions and setting layers');
    proj4.defs(defineProjectionZones());
    const configLayerList = options.layers;
    setLayers(options.useMockLayers ? mockLayers : configLayerList);
    //console.log('Define projecteions and setting layers');
  }, []);

  useEffect(() => {
    //console.log('Got data');
    const unConvSensors = options.useMockData ? mockSensors : extractSensorsFromGrafanaStream(data);
    //console.log('Extracted sensors');
    const mapSensors: sensor[] = unConvSensors.map(element => projectAndRemapLocObject(element) as sensor);
    //console.log('Projecteded and remapped sensors');
    const sensorsExtent: envelope = getSensorsExtent(mapSensors);
    //console.log('Calculated sensor extent');
    setSensors(mapSensors);

    // get webcams
    if (options.enableWebCams) {
      const unConvWebcams = options.useMockData ? mockWebcams : extractWebcamsFromGrafanaStream(data);
      //console.log('mockWebcams', mockWebcams);
      //console.log('Extracted webcams');
      const mapWebcams: webcam[] = unConvWebcams.map(element => projectAndRemapLocObject(element) as webcam);
      //console.log('Projecteded and remapped webcams');
      //console.log('webcams:', mapWebcams);
      setWebcams(mapWebcams);
    }

    //console.log("data: ", data);
    //console.log('typeSymbolColors', sensorTypeConfig);
    if (mapSensors.length > 0) {
      const m = mainMap.current.leafletElement as LeafletMap;
      m.fitBounds([
        [sensorsExtent.minX, sensorsExtent.minY],
        [sensorsExtent.maxX, sensorsExtent.maxY],
      ]);
    }
  }, [data]);

  function layersElement(layer: any) {
    switch (layer.type) {
      case 'WMSLayer':
        return (
          <WMSTileLayer
            url={layer.serviceUrl}
            layers={layer.WMSLayers}
            transparent={true}
            format={'image/png'}
            tileSize={layer.tileSize != null ? layer.tileSize : 1024}
          />
        );
      case 'WMStiledLayer':
        return (
          <WMSTileLayer
            url={layer.serviceUrl}
            layers={layer.WMSLayers}
            transparent={true}
            format={'image/png'}
            tileSize={layer.tileSize != null ? layer.tileSize : 1024}
          />
        );
      case 'tiledLayer':
        return <TileLayer url={layer.serviceUrl} />;
      case 'esriTiledMapLayer':
        return <EsriTiledMapLayer url={layer.serviceUrl} />;
      case 'esriDynamicMapLayer':
        return <EsriDynamicLayer url={layer.serviceUrl} />;
      default:
        return null;
    }
  }

  function LayersElements(props: any) {
    const layerElements = props.layers.map((layer: any) => {
      if (layer.isBaseMap) {
        return (
          <LayersControl.BaseLayer name={layer.name} checked={layer.isVisible}>
            {layersElement(layer)}
          </LayersControl.BaseLayer>
        );
      } else {
        return (
          <LayersControl.Overlay name={layer.name} checked={layer.isVisible}>
            {layersElement(layer)}
          </LayersControl.Overlay>
        );
      }
    });
    return (
      <LayersControl ref={mapElement} position="bottomright">
        {layerElements}
      </LayersControl>
    );
  }

  return (
    <Map ref={mainMap} center={position} zoom={8} maxZoom={18} style={{ height: height, width: width }}>
      <LayersElements layers={layers}></LayersElements>
      <LegendControl symbols={sensorTypeConfig.filter(ts => sensors.find(s => s.instrumentType === ts.type))}></LegendControl>
      <MarkerCluster sensors={sensors}></MarkerCluster>
      {webcams.map(c => {
        return (
          <Marker icon={iconCamera} position={c.coord as [number, number]}>
            <Popup>
              <a href={c.webcamurl} target="_blank">
                <img src={c.webcamurl} width={200} />
              </a>
            </Popup>
          </Marker>
          // <Marker  color="#00ff00" radius={6} center={c.coord as [number, number]}>
          //   <Popup>
          //     <a href={c.webcamurl} target="_blank">
          //       <img src={c.webcamurl} width={200} />
          //     </a>
          //   </Popup>
          // </Marker >
        );
      })}
    </Map>
  );
};
export { MapPanel };
