import React, { useEffect, useState } from 'react';
import {
  TileLayer,
  Popup,
  Marker,
  LayersControl,
  WMSTileLayer,
  useMap,
  Polyline,
  useMapEvents,
  ScaleControl,
} from 'react-leaflet';
import { MapLayer } from 'types/mapLayer';
import { mockLayers } from 'data/mockLayers';
import EsriTiledMapLayer from 'components/EsriTiledMapLayer';
import EsriDynamicLayer from 'components/EsriDynamicLayer';
import { Sensor } from 'types/sensor';
import { BoundsLiteral, LatLngExpression, PointExpression } from 'leaflet';
import { getSensorBounds } from 'utilities/utils';
import { sensorTypeConfig } from 'data/defualtSensorConfig';
import LegendControl from 'components/LegendControl';
import WMSLegendControl from 'components/WMSLegendControl';
import 'leaflet/dist/leaflet.css';
import { iconCamera } from 'utilities/defineIcons';
import { sensorConfig } from 'types/sensorConfig';
import { SensorMarker } from 'SensorMarker';
import { GroupMarker } from 'GroupMarker';
import MapHtmlOverlay from 'MapHtmlOverlay';
import { PanelData } from '@grafana/data';
import { MapMarkerGroup } from 'types/mapMarkerGroup';
import { MapMarker } from 'types/mapMarker';
import { Webcam } from 'types/webcam';

type MapPanelProps = {
  options: any;
  data: PanelData;
  sensors: Sensor[];
  webcams: Webcam[];
};

const MapPanel: React.FC<MapPanelProps> = ({ options, data, sensors, webcams }) => {
  const map = useMap();

  const [mapMarkerGroups, setMapMarkerGroups] = useState<MapMarkerGroup[]>([]);
  const [layers, setLayers] = useState<MapLayer[]>([]);
  const [currentZoom, setCurrentZoom] = useState<number>(map.getZoom());
  const [showSensorNames, setShowSensorNames] = useState(false);
  const [bounds] = useState<BoundsLiteral>(getSensorBounds(sensors));
  const expandAtZoomLevel = 17;

  useEffect(() => {
    setLayers(options.useMockLayers ? mockLayers : options.layers);
  }, [options]);

  useEffect(() => {
    const mGroups = [] as MapMarkerGroup[];
    sensors.forEach(s => {
      const pos = s.coord as LatLngExpression;
      const existingGroup = mGroups.find(m => m.center[0] === pos[0] && m.center[1] === pos[1]);
      const sensorToPush = {
        name: s.name,
        position: pos,
        type: s.type,
        sensor: s,
        config: getSensorConfig(s.type),
      } as MapMarker;
      if (existingGroup) {
        existingGroup.markers.push(sensorToPush);
      } else {
        mGroups.push({
          center: pos,
          markers: [sensorToPush],
          isOpen: undefined,
        });
      }
    });
    setMapMarkerGroups(mGroups);

    if (sensors.length > 0) {
      setCurrentZoom(map.getZoom());
      map.fitBounds(bounds);
    }
  }, [data, map, options.enableWebCams, sensors, options.useMockData, bounds]);

  const toggleOpen = (index: number) => {
    const state = [...mapMarkerGroups];

    const isOpen = mapMarkerGroups[index].isOpen;

    // You probably mean to close the element
    if (currentZoom > expandAtZoomLevel && isOpen === undefined) {
      state[index].isOpen = false;
    } else {
      state[index].isOpen = !mapMarkerGroups[index].isOpen;
    }
    setMapMarkerGroups(state);
  };

  const getSpreadMarkers = (markerGroup: MapMarkerGroup): MapMarker[] => {
    const center = map.latLngToLayerPoint(markerGroup.center);
    const numberOfSensors = markerGroup.markers.length;
    const zoom = map.getZoom();

    const factor = -21;
    const addFactor = 22 * zoom;
    const circumference = factor * zoom + addFactor + numberOfSensors * 11;
    const legLength = (circumference / Math.PI) * 2;

    const angleStep = (Math.PI * 2) / (numberOfSensors > 2 ? numberOfSensors : 5);
    let iteration = 0;

    return markerGroup.markers
      .map(m => {
        iteration += 1;
        const angle = iteration * angleStep;
        const center_east = center.x;
        const center_north = center.y;
        const pos_east = center_east + legLength * Math.cos(angle);
        const pos_north = center_north + legLength * Math.sin(angle);

        return {
          name: m.name,
          position: map.layerPointToLatLng([pos_east, pos_north] as PointExpression),
          type: m.type ?? '',
          sensor: m.sensor,
          config: m.config,
        };
      })
      .sort((a, b) => a.type.localeCompare(b.type));
  };

  const getSensorConfig = (type: string): sensorConfig => {
    const currentConfig = sensorTypeConfig.find(s => s.type === type);
    if (currentConfig) {
      return currentConfig;
    }

    return sensorTypeConfig.find(s => s.type === 'default')!;
  };

  useMapEvents({
    // Keep layers state in sync with layers used in layerscontrol
    overlayadd(e) {
      if (e.name !== 'Sensor names') {
        const currentLayer = layers.findIndex(l => l.name === e.name);
        layers[currentLayer].isVisible = true;
        setLayers([...layers]);
      } else {
        setShowSensorNames(true);
      }
    },
    overlayremove(e) {
      if (e.name !== 'Sensor names') {
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
      {/* {options.useSensorNames && (
        <MapHtmlOverlay showSensorNames={showSensorNames} setShowSensorNames={setShowSensorNames}></MapHtmlOverlay>
      )} */}
      {mapMarkerGroups.map((markerGroup, i) => (
        <>
          <>
            {markerGroup.markers.length === 1 && (
              <SensorMarker
                options={options}
                data={data}
                marker={markerGroup.markers[0]}
                showSensorNames={showSensorNames}
              ></SensorMarker>
            )}
            {markerGroup.markers.length > 1 && (
              <GroupMarker
                group={markerGroup}
                isOpen={
                  markerGroup.isOpen ||
                  (markerGroup.isOpen !== false && currentZoom > expandAtZoomLevel && markerGroup.markers.length > 1)
                }
                toggleOpen={() => toggleOpen(i)}
              ></GroupMarker>
            )}
          </>

          {(markerGroup.isOpen ||
            (markerGroup.isOpen !== false && currentZoom > expandAtZoomLevel && markerGroup.markers.length > 1)) && (
            <>
              {getSpreadMarkers(markerGroup).map(subMarker => (
                <>
                  <SensorMarker
                    options={options}
                    marker={subMarker}
                    data={data}
                    showSensorNames={showSensorNames}
                  ></SensorMarker>
                  <Polyline
                    interactive={false}
                    weight={1}
                    noClip={true}
                    color="black"
                    positions={[subMarker.position, markerGroup.center]}
                  ></Polyline>
                </>
              ))}
            </>
          )}
        </>
      ))}
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
          <LayersControl.Overlay name="Sensor names">
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
