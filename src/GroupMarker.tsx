import { MapMarkerGroup } from 'MapPanel';
import React, { useState } from 'react';
import { CircleMarker } from 'react-leaflet';
import { Tooltip } from 'react-leaflet';

type GroupMarkerProps = {
  group: MapMarkerGroup;
  toggleOpen: any
};

export const GroupMarker: React.FC<GroupMarkerProps> = ({ group, toggleOpen }) => {

    const [open, setOpen] = useState(false)

  return (
    <CircleMarker
      color={'green'}
      radius={20}
      eventHandlers={{
        click: () => {
        //   const state = [...mapMarkerGroups];
        //   state[i].toggleOpen = !mapMarkerGroups[i].toggleOpen;
        //   setMapMarkerGroups(!open);
        toggleOpen()
        },
      }}
      center={group.center}
      // opacity={markerGroup.toggleOpen ? 0.2 : 1}
      // className={markerGroup.toggleOpen ? "markergroup-active" : ""}
      fillOpacity={0.4}
    >
      <Tooltip permanent={true} className="transparent" direction="center">
        <b>{group.markers.length}</b>
      </Tooltip>
    </CircleMarker>
  );
};
