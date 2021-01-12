import React, { useEffect, useState } from 'react';
import { useMap, Polyline } from 'react-leaflet';
import { Sensor } from 'types/sensor';
import { LatLngTuple, PointExpression } from 'leaflet';
import { sensorTypeConfig } from 'data/defualtSensorConfig';
import { sensorConfig } from 'types/sensorConfig';
import { SensorMarker } from 'SensorMarker';
import { GroupMarker } from 'GroupMarker';
import { PanelData } from '@grafana/data';
import { MapMarkerGroup } from 'types/mapMarkerGroup';
import { MapMarker } from 'types/mapMarker';

type MapMarkersProps = {
  options: any;
  data: PanelData;
  sensors: Sensor[];
  showSensorNames: boolean;
  currentZoom: number;
};

const MapMarkers: React.FC<MapMarkersProps> = ({ options, data, sensors, showSensorNames, currentZoom }) => {
  const map = useMap();

  const [mapMarkerGroups, setMapMarkerGroups] = useState<MapMarkerGroup[]>([]);
  const expandAtZoomLevel = 17;

  useEffect(() => {
    const mGroups = [] as MapMarkerGroup[];
    sensors.forEach(s => {
      const pos = s.coord as LatLngTuple;
      const existingClusterOnSameLocation = mGroups.find(m => m.center[0] === pos[0] && m.center[1] === pos[1]);

      const sensorToPush = {
        name: s.name,
        position: pos,
        type: s.type,
        sensor: s,
        config: getSensorConfig(s.type),
      } as MapMarker;
      if (existingClusterOnSameLocation) {
        existingClusterOnSameLocation.markers.push(sensorToPush);
      } else {
        mGroups.push({
          center: pos,
          markers: [sensorToPush],
          isOpen: undefined,
        });
      }
    });

    setMapMarkerGroups(mGroups);
  }, [data, map, options.enableWebCams, sensors, options.useMockData]);

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
    const zoom = currentZoom;

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

  return (
    <>
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
    </>
  );
};

export { MapMarkers };
