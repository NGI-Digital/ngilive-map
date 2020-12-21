import React from 'react';
import ReactDOMServer from 'react-dom/server';
import L, { PointTuple } from 'leaflet';
import { Marker } from 'react-leaflet';
import { MapMarkerGroup } from 'types/mapMarkerGroup';

const marker = (text: string, isOpen: boolean, alarm: boolean) => {
  // TODO: Figure out why we have to do this hack
  // ReactDOMServer always throw error on first run
  try {
    ReactDOMServer.renderToString(<p></p>);
  } catch (e) {}

  const icon = <span key={'test'}>{text}</span>;
  return L.divIcon({
    html: ReactDOMServer.renderToString(
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '50%',
          backgroundColor: 'green',
          textAlign: 'center',
          height: '100%',
          width: '100%',
          border: alarm ? '3px solid #f7550a' : '3px solid darkgreen',
          opacity: isOpen ? 0.3 : 0.9,
        }}
      >
        {icon}
      </div>
    ),
    iconAnchor: [17, 17],
    popupAnchor: [10, -44],
    iconSize: [34, 34] as PointTuple,
    className: 'groupmarker',
  });
};

interface OwnProps {
  group: MapMarkerGroup;
  toggleOpen: any;
  isOpen: boolean;
}

type Props = OwnProps;

const GroupMarker: React.FC<Props> = props => {
  const { group, toggleOpen, isOpen } = props;
  const alarm = false;
  return (
    <Marker
      position={group.center}
      icon={marker(group.markers.length.toString(), isOpen, alarm)}
      eventHandlers={{
        click: () => {
          toggleOpen();
        },
      }}
    ></Marker>
  );
};

export { GroupMarker };
