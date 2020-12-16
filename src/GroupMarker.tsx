import React, { useEffect, useState } from 'react';
import { CircleMarker } from 'react-leaflet';
import { Tooltip } from 'react-leaflet';
import { MapMarkerGroup } from 'types/mapMarkerGroup';

type GroupMarkerProps = {
  group: MapMarkerGroup;
  toggleOpen: any;
  isOpen: boolean;
};

export const GroupMarker: React.FC<GroupMarkerProps> = ({ group, toggleOpen, isOpen }) => {
  return (
    <>
      {!isOpen && (
        <CircleMarker
          color={'green'}
          radius={20}
          eventHandlers={{
            click: () => {
              toggleOpen();
            },
          }}
          center={group.center}
          fillOpacity={0.7}
        >
          <Tooltip permanent={true} className="transparent" direction="center">
            <b>{group.markers.length}</b>
          </Tooltip>
        </CircleMarker>
      )}
      {isOpen && (
        <CircleMarker
          color={'green'}
          radius={20}
          eventHandlers={{
            click: () => {
              toggleOpen();
            },
          }}
          center={group.center}
          fillOpacity={0.2}
          opacity={0.2}
        ></CircleMarker>
      )}
    </>
  );
};
