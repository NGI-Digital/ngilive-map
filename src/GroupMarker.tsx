import { MapMarkerGroup } from 'MapPanel';
import React, { useState } from 'react';
import { CircleMarker } from 'react-leaflet';
import { Tooltip } from 'react-leaflet';

type GroupMarkerProps = {
  group: MapMarkerGroup;
  toggleOpen: any;
};

export const GroupMarker: React.FC<GroupMarkerProps> = ({ group, toggleOpen }) => {
  return (
    <CircleMarker
      color={'green'}
      radius={20}
      eventHandlers={{
        click: () => {
          toggleOpen();
        },
      }}
      center={group.center}
      fillOpacity={0.4}
    >
      <Tooltip permanent={true} className="transparent" direction="center">
        <b>{group.markers.length}</b>
      </Tooltip>
    </CircleMarker>
  );
};
