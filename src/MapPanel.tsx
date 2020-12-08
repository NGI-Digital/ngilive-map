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
import proj4 from 'proj4';
import projectAndRemapLocObject from 'utilities/locObjectProjecteorAndMapper';
import defineProjectionZones from 'utilities/defineProjectionZones';
import { mapLayer } from 'types/mapLayer';
import { mockLayers } from 'data/mockLayers';
import EsriTiledMapLayer from 'components/EsriTiledMapLayer';
import EsriDynamicLayer from 'components/EsriDynamicLayer';
import extractSensorsFromGrafanaStream from 'utilities/sensorDataObjects';
import { Sensor } from 'types/sensor';
import { mockSensors } from 'data/mockSensors';
import { mockWebcams } from 'data/mockWebcams';
import { LatLngExpression, PointExpression } from 'leaflet';
import { envelope } from 'types/envelope';
import { getSensorsExtent } from 'utilities/utils';
import { sensorTypeConfig } from 'data/defualtSensorConfig';
import LegendControl from 'components/LegendControl';
import WMSLegendControl from 'components/WMSLegendControl';
import 'leaflet/dist/leaflet.css';
import { webcam } from 'types/webcam';
import extractWebcamsFromGrafanaStream from 'utilities/webcamsDataObjects';
import { iconCamera } from 'utilities/defineIcons';
import { sensorConfig } from 'types/sensorConfig';
import { SensorMarker } from 'SensorMarker';
import { GroupMarker } from 'GroupMarker';
import MapHtmlOverlay from 'MapHtmlOverlay';
import { PanelData } from '@grafana/data';

type MapPanelProps = {
  options: any;
  data: PanelData;
};

export type MapMarker = {
  position: LatLngExpression;
  name: string;
  type: string;
  sensor: Sensor;
  config: sensorConfig;
};

export type MapMarkerGroup = {
  markers: MapMarker[];
  center: LatLngExpression;
  toggleOpen: boolean | undefined;
};

const MapPanel: React.FC<MapPanelProps> = ({ options, data }) => {
  const map = useMap();
  const [mapMarkerGroups, setMapMarkerGroups] = useState<MapMarkerGroup[]>([]);
  const [webcams, setWebcams] = useState<webcam[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [layers, setLayers] = useState<mapLayer[]>([]);
  const [currentZoom, setCurrentZoom] = useState<number>(map.getZoom());
  const [showSensorNames, setShowSensorNames] = useState(false);

  useEffect(() => {
    proj4.defs(defineProjectionZones());
    const configLayerList = options.layers;
    setLayers(options.useMockLayers ? mockLayers : configLayerList);

    // Example on usage of setGrafanaVariable
    // Could be called on a click event as well
    // setGrafanaVariable("test", "2")
  }, [setLayers, options]);

  useEffect(() => {
    console.log('updated');
    //console.log(options);
    const unConvSensors = options.useMockData ? mockSensors : extractSensorsFromGrafanaStream(data);
    console.log({ unConvSensors });
    const mapSensors: Sensor[] = unConvSensors
      .map(element => projectAndRemapLocObject(element) as Sensor)
      .filter(s => s.coord[0] > 1 && s.coord[1] > 1);
    const sensorsExtent: envelope = getSensorsExtent(mapSensors);
    setSensors(mapSensors);

    // get webcams
    if (options.enableWebCams) {
      const unConvWebcams = options.useMockData ? mockWebcams : extractWebcamsFromGrafanaStream(data);
      const mapWebcams: webcam[] = unConvWebcams.map(element => projectAndRemapLocObject(element) as webcam);
      setWebcams(mapWebcams);
    }

    if (mapSensors) {
      const mGroups = [] as MapMarkerGroup[];
      mapSensors.forEach(s => {
        const pos = s.coord as LatLngExpression;
        const existingGroup = mGroups.find(m => m.center[0] === pos[0] && m.center[1] === pos[1]);
        const sensorToPush = {
          name: s.name,
          position: pos,
          type: s.instrumentType,
          sensor: s,
          config: getSensorConfig(s.instrumentType),
        } as MapMarker;
        if (existingGroup) {
          existingGroup.markers.push(sensorToPush);
        } else {
          mGroups.push({
            center: pos,
            markers: [sensorToPush],
            toggleOpen: undefined,
          });
        }
      });
      setMapMarkerGroups(mGroups);
    }

    if (mapSensors.length > 0) {
      map.fitBounds([
        [sensorsExtent.minX, sensorsExtent.minY],
        [sensorsExtent.maxX, sensorsExtent.maxY],
      ]);
      // Close all open groups to prevent insane everything open map - detect bounds change?
    }
  }, [data, map, options.enableWebCams, options.useMockData]);

  const toggleOpen = (index: number) => {
    const state = [...mapMarkerGroups];
    state[index].toggleOpen = !mapMarkerGroups[index].toggleOpen;
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

    return markerGroup.markers.map(m => {
      iteration += 1;
      const angle = iteration * angleStep;
      const center_east = center.x;
      const center_north = center.y;
      const pos_east = center_east + legLength * Math.cos(angle);
      const pos_north = center_north + legLength * Math.sin(angle);

      return {
        name: m.name,
        position: map.layerPointToLatLng([pos_east, pos_north] as PointExpression),
        type: m.type,
        sensor: m.sensor,
        config: m.config,
      };
    });
  };

  const getSensorConfig = (type: string): sensorConfig => {
    const currentConfig = sensorTypeConfig.find(s => s.type === type);
    if (currentConfig) {
      return currentConfig;
    }

    return sensorTypeConfig.find(s => s.type === 'default')!;
  };

  useMapEvents({
    zoom: () => {
      setCurrentZoom(map.getZoom());
      console.log('Zoom ', map.getZoom());
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
      {mapMarkerGroups.map((markerGroup, i) => (
        <>
          <>
            {markerGroup.markers.length === 1 && (
              <SensorMarker
                data={data}
                marker={markerGroup.markers[0]}
                showSensorNames={showSensorNames}
              ></SensorMarker>
            )}
            {markerGroup.markers.length > 1 && (
              <GroupMarker group={markerGroup} toggleOpen={() => toggleOpen(i)}></GroupMarker>
            )}
          </>

          {(markerGroup.toggleOpen ||
            (markerGroup.toggleOpen !== false && currentZoom > 17 && markerGroup.markers.length > 1)) && (
            <>
              {getSpreadMarkers(markerGroup).map(subMarker => (
                <>
                  <SensorMarker marker={subMarker} data={data} showSensorNames={showSensorNames}></SensorMarker>
                  <Polyline
                    interactive={false}
                    weight={1}
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
      </LayersControl>
      <LegendControl
        symbols={sensorTypeConfig.filter(ts =>
          sensors.find(s => (s.instrumentType ? s.instrumentType : 'default') === ts.type)
        )}
      ></LegendControl>
      <WMSLegendControl mapLayers={layers}></WMSLegendControl>
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
      <ScaleControl position="bottomright" imperial={false} maxWidth={100}></ScaleControl>
      {options.useSensorNames && (
        <MapHtmlOverlay showSensorNames={showSensorNames} setShowSensorNames={setShowSensorNames}></MapHtmlOverlay>
      )}
    </>
  );
};
export { MapPanel };
