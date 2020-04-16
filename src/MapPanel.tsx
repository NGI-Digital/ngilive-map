import React, { useRef, useEffect, useState, useMemo, memo } from 'react';
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
  // var layersLoaded = false;
  // var layersElementsConst: [any];

  const [webcams, setWebcams] = useState<webcam[]>([]);
  const [sensors, setSensors] = useState<sensor[]>([]);
  const [layers, setLayers] = useState<mapLayer[]>([]);

  useEffect(() => {
    console.log('Define projections and setting layers');
    proj4.defs(defineProjectionZones());
    const configLayerList = options.layers;
    //const cfgLayerList = Object.assign({}, true, configLayerList);

    console.log('layers:', configLayerList);
    setLayers(options.useMockLayers ? mockLayers : configLayerList);
    console.log('layers:', layers);
    //console.log('Define projecteions and setting layers');

    console.log('START');
  }, []);

  useEffect(() => {
    console.log('New layers');
  }, [layers]);

  useEffect(() => {
    //console.log('Got data');

    //console.log('layers:', layers);
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

  // function LayersElements(props: any) {
  //   console.log('LayersElement');
  //   const layerElements = props.layers.map((layer: any) => {
  //     //console.log('layer', layer);
  //     if (layer.isBaseMap) {
  //       return (
  //         <LayersControl.BaseLayer name={layer.name} checked={layer.isVisible}>
  //           {layersElement(layer)}
  //         </LayersControl.BaseLayer>
  //       );
  //     } else {
  //       return (
  //         <LayersControl.Overlay name={layer.name} checked={layer.isVisible}>
  //           {layersElement(layer)}
  //         </LayersControl.Overlay>
  //       );
  //     }
  //   });
  //   return (
  //     <LayersControl ref={mapElement} position="bottomright">
  //       {layerElements}
  //     </LayersControl>
  //   );
  // }

  const LayersElements = memo((props: any) => {
    // if (!layersLoaded) {
    //console.log('LayersElement,layers', layers);
    console.log('LayersElement', props);
    // layersLoaded = true;
    const layerElements = props.layers.map((layer: mapLayer) => {
      //console.log('layer', layer);
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
    // layersElementsConst = layerElements;
    console.log('Not inne i else');
    return (
      <LayersControl ref={mapElement} position="bottomright">
        {layerElements}
      </LayersControl>
    );
    // } else {
    //   console.log('inne i else');
    //   return (
    //     <LayersControl ref={mapElement} position="bottomright">
    //       {layersElementsConst}
    //     </LayersControl>
    //   );
    // }
  });

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
        );
      })}
    </Map>
  );
};
export { MapPanel };
