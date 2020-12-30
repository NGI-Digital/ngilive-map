import React, { useEffect, useState } from 'react';
import {
  TileLayer,
  Popup,
  Marker,
  LayersControl,
  WMSTileLayer,
  useMap,
  useMapEvents,
  ScaleControl,
} from 'react-leaflet';
import { MapLayer } from 'types/mapLayer';
import { mockLayers } from 'data/mockLayers';
import EsriTiledMapLayer from 'components/EsriTiledMapLayer';
import EsriDynamicLayer from 'components/EsriDynamicLayer';
import { Sensor } from 'types/sensor';
import { sensorTypeConfig } from 'data/defualtSensorConfig';
import LegendControl from 'components/LegendControl';
import WMSLegendControl from 'components/WMSLegendControl';
import 'leaflet/dist/leaflet.css';
import { iconCamera } from 'utilities/defineIcons';
import { PanelData } from '@grafana/data';
import { Webcam } from 'types/webcam';
import { MapMarkers } from 'MapMarkers';
import { getSensorBounds } from 'utilities/utils';

type MapPanelProps = {
  options: any;
  data: PanelData;
  sensors: Sensor[];
  webcams: Webcam[];
};

const MapPanel: React.FC<MapPanelProps> = ({ options, data, sensors, webcams }) => {
  const map = useMap();

  const [layers, setLayers] = useState<MapLayer[]>([]);
  const [currentZoomLevel, setCurrentZoom] = useState<number>(map.getZoom());
  const [showSensorNames, setShowSensorNames] = useState(false);
  const showSensorNamesLayerText = 'sensornavn';

  useEffect(() => {
    if (sensors.length > 0) {
      setCurrentZoom(map.getZoom());
      map.fitBounds(getSensorBounds(sensors));
    }
  }, [sensors]);

  useEffect(() => {
    setLayers(options.useMockLayers ? mockLayers : options.layers);
  }, [options]);

  useMapEvents({
    // Keep layers state in sync with layers used in layerscontrol
    overlayadd(e) {
      if (e.name !== showSensorNamesLayerText) {
        const currentLayer = layers.findIndex(l => l.name === e.name);
        layers[currentLayer].isVisible = true;
        setLayers([...layers]);
      } else {
        console.log('show sensor names');
        setShowSensorNames(true);
      }
    },
    overlayremove(e) {
      if (e.name !== showSensorNamesLayerText) {
        const currentLayer = layers.findIndex(l => l.name === e.name);
        layers[currentLayer].isVisible = false;
        setLayers([...layers]);
      } else {
        setShowSensorNames(false);
      }
    },
    // click() {
    //   map.locate()
    // },
    locationfound(e) {
      map.flyTo(e.latlng, map.getZoom());
    },
    zoom: () => {
      setCurrentZoom(map.getZoom());
    },
  });

  const layerElement = (layer: any) => (
    <>
      {layer.type === 'WMSLayer' && (
        <WMSTileLayer
          maxZoom={22}
          maxNativeZoom={18}
          url={layer.serviceUrl}
          layers={layer.WMSLayers}
          opacity={layer.opacity != null ? layer.opacity : '1.0'}
          version={layer.WMSVersion != null ? layer.WMSVersion : '1.3.0'}
          transparent={true}
          format={'image/png'}
          tileSize={layer.tileSize != null ? layer.tileSize : 1024}
        />
      )}
      {layer.type === 'WMStiledLayer' && (
        <WMSTileLayer
          maxZoom={22}
          maxNativeZoom={18}
          url={layer.serviceUrl}
          layers={layer.WMSLayers}
          opacity={layer.opacity != null ? layer.opacity : '1.0'}
          version={layer.WMSVersion != null ? layer.WMSVersion : '1.3.0'}
          transparent={true}
          format={'image/png'}
          tileSize={layer.tileSize != null ? layer.tileSize : 1024}
        />
      )}
      {layer.type === 'tiledLayer' && <TileLayer maxZoom={22} maxNativeZoom={18} url={layer.serviceUrl} />}
      {layer.type === 'esriTiledMapLayer' && (
        <EsriTiledMapLayer maxZoom={22} maxNativeZoom={18} url={layer.serviceUrl} />
      )}
      {layer.type === 'esriDynamicMapLayer' && (
        <EsriDynamicLayer maxZoom={22} maxNativeZoom={18} url={layer.serviceUrl} />
      )}
    </>
  );
  return (
    <>
      <ScaleControl position="bottomright" imperial={false} maxWidth={100}></ScaleControl>
      <MapMarkers
        currentZoom={currentZoomLevel}
        showSensorNames={showSensorNames}
        sensors={sensors}
        data={data}
        options={options}
      ></MapMarkers>
      <LayersControl position="bottomright">
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
        {/* Dummy layer for sensor name switch */}
        {options.useSensorNames && (
          <LayersControl.Overlay name={showSensorNamesLayerText}>
            <TileLayer url="" />
          </LayersControl.Overlay>
        )}
      </LayersControl>
      <LegendControl
        symbols={sensorTypeConfig.filter(ts => sensors.find(s => (s.type ? s.type : 'default') === ts.type))}
      ></LegendControl>
      <WMSLegendControl mapLayers={layers} position="bottomleft"></WMSLegendControl>
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
    </>
  );
};
export { MapPanel };
