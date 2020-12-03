import React, { useEffect, useState } from 'react';
import {
  TileLayer,
  Popup,
  Marker,
  LayersControl,
  WMSTileLayer,
  useMap,
  CircleMarker,
  Tooltip,
  Polyline,
} from 'react-leaflet';
import proj4 from 'proj4';
import projectAndRemapLocObject from 'utilities/locObjectProjecteorAndMapper';
import defineProjectionZones from 'utilities/defineProjectionZones';
import { mapLayer } from 'types/mapLayer';
import { mockLayers } from 'data/mockLayers';
import EsriTiledMapLayer from 'components/EsriTiledMapLayer';
import EsriDynamicLayer from 'components/EsriDynamicLayer';
import extractSensorsFromGrafanaStream from 'utilities/sensorDataObjects';
import { sensor } from 'types/sensor';
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

type MapPanelProps = {
  options: any;
  data: any;
};

type MapMarker = {
  position: LatLngExpression;
  name: string;
  type: string;
};

type MapMarkerGroup = {
  markers: MapMarker[];
  center: LatLngExpression;
  toggleOpen: boolean | undefined;
};

const MapPanel: React.FC<MapPanelProps> = ({ options, data }) => {
  const showSensorNames = false;
  const map = useMap();
  const [mapMarkerGroups, setMapMarkerGroups] = useState<MapMarkerGroup[]>([]);
  const [webcams, setWebcams] = useState<webcam[]>([]);
  const [sensors, setSensors] = useState<sensor[]>([]);
  const [layers, setLayers] = useState<mapLayer[]>([]);
  const [currentZoom] = useState<number>(map.getZoom());

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
    const mapSensors: sensor[] = unConvSensors.map(element => projectAndRemapLocObject(element) as sensor);
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
        const sensorToPush = { name: s.name, position: pos, type: s.instrumentType } as MapMarker;
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
    }
  }, [data, map, options.enableWebCams, options.useMockData]);

  const getSpreadMarkers = (markerGroup: MapMarkerGroup): MapMarker[] => {
    const center = map.latLngToLayerPoint(markerGroup.center);
    const numberOfSensors = markerGroup.markers.length;
    const zoom = map.getZoom();

    const factor = -21;

    const addOnZoom = [
      0,
      50,
      50,
      100,
      125,
      150,
      175,
      200,
      225,
      250,
      275,
      300,
      325,
      350,
      375,
      400, // 15
      425,
      450,
      475,
      500,
      525,
      550,
      575,
    ];

    const add = addOnZoom[zoom];


    const circumference = factor * zoom + add + numberOfSensors * 7;
    let legLength = (circumference / Math.PI) * 2;

    const angleStep = (Math.PI * 2) / (numberOfSensors > 2 ? numberOfSensors : 5);
    legLength = Math.max(legLength, 5);
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

  const layerElement = (layer: any) => (
    <>
      {layer.type === 'WMSLayer' && (
        <WMSTileLayer
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
          url={layer.serviceUrl}
          layers={layer.WMSLayers}
          opacity={layer.opacity != null ? layer.opacity : '1.0'}
          version={layer.WMSVersion != null ? layer.WMSVersion : '1.3.0'}
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
    <>
      {mapMarkerGroups.map((markerGroup, i) => (
        <>
          <>
            <CircleMarker
              color={markerGroup.markers.length === 1 ? getSensorConfig(markerGroup.markers[0].type).color : 'green'}
              radius={markerGroup.markers.length === 1 ? 10 : 20}
              // eventHandlers={markerEventHandler}
              eventHandlers={
                markerGroup.markers.length === 1
                  ? {}
                  : {
                      click: () => {
                        // TODO: Move each markergroup to seperate component?
                        const state = [...mapMarkerGroups];
                        console.log('onclick');
                        console.log(mapMarkerGroups[i]);
                        state[i].toggleOpen = !mapMarkerGroups[i].toggleOpen;
                        setMapMarkerGroups(state);
                      },
                    }
              }
              center={markerGroup.center}
              // opacity={markerGroup.toggleOpen ? 0.2 : 1}
              // className={markerGroup.toggleOpen ? "markergroup-active" : ""}
              fillOpacity={markerGroup.markers.length === 1 ? 0.2 : 0.4}
            >
              {markerGroup.markers.length !== 1 && (
                <Tooltip permanent={true} className="transparent" direction="center">
                  <b>{markerGroup.markers.length}</b>
                </Tooltip>
              )}
              {markerGroup.markers.length === 1 && <Popup>{markerGroup.center.toString()}</Popup>}
              {showSensorNames && markerGroup.markers.length === 1 && (
                <Tooltip permanent={true} direction="bottom">
                  <b>{markerGroup.markers[0].name}</b>
                </Tooltip>
              )}
              {/* <Popup>{markerGroup.center.toString()}</Popup> */}
            </CircleMarker>
          </>

          {(markerGroup.toggleOpen ||
            (markerGroup.toggleOpen !== false && currentZoom > 17 && markerGroup.markers.length > 1)) && (
            <>
              {getSpreadMarkers(markerGroup).map(subMarker => (
                <>
                  <CircleMarker color={getSensorConfig(subMarker.type).color} center={subMarker.position}>
                    {showSensorNames && (
                      <Tooltip permanent={true} direction="bottom">
                        <b>{subMarker.name}</b>
                      </Tooltip>
                    )}
                    <Popup>{markerGroup.center.toString()}</Popup>
                  </CircleMarker>
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
      {/* <ScaleControl position="bottomright" imperial={false} maxWidth={100}></ScaleControl> */}
    </>
  );
};
export { MapPanel };

// return (
//   <>
//   {/* <MapContainer center={position} zoom={8} maxZoom={18} style={{ height: height, width: width }}> */}
//     <ScaleControl position="bottomright" imperial={false} maxWidth={100}></ScaleControl>
//     {/* <LayersControl ref={mapElement} position="bottomright">
//       {layers
//         .filter(l => l.isBaseMap)
//         .map(layer => (
//           <LayersControl.BaseLayer name={layer.name} checked={layer.isVisible}>
//             {layerElement(layer)}
//           </LayersControl.BaseLayer>
//         ))}
//       {layers
//         .filter(l => !l.isBaseMap)
//         .map(layer => (
//           <LayersControl.Overlay name={layer.name} checked={layer.isVisible}>
//             {layerElement(layer)}
//           </LayersControl.Overlay>
//         ))}
//     </LayersControl>
//     <LegendControl
//       symbols={sensorTypeConfig.filter(ts =>
//         sensors.find(s => (s.instrumentType ? s.instrumentType : 'default') === ts.type)
//       )}
//     ></LegendControl>
//     <WMSLegendControl mapLayers={layers}></WMSLegendControl>  */}
//    <MarkerCluster sensors={sensors} data={data}></MarkerCluster>
//     {webcams.map(c => {
//       return (
//         <Marker icon={iconCamera} position={c.coord as [number, number]}>
//           <Popup>
//             <a href={c.webcamurl} target="_blank">
//               <img src={c.webcamurl} width={200} />
//             </a>
//           </Popup>
//         </Marker>
//       );
//     })}
//   {/* </MapContainer> */}
//   </>
// );
// };
