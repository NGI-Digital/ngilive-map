import React from 'react';
import ReactDOMServer from 'react-dom/server';
import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { MapMarker } from 'types/mapMarker';

const marker = (type: string[]) => {
  // TODO: Figure out why we have to do this hack
  // ReactDOMServer always throw error on first run
  try {
    ReactDOMServer.renderToString(<p></p>);
  } catch (e) {}

  const icons = type.map(m => <span key={'test'}>test</span>);
  return L.divIcon({
    html: ReactDOMServer.renderToString(
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          borderRadius: '5px',
          backgroundColor: 'red',
        }}
      >
        {icons}
      </div>
    ),
    iconAnchor: [11, 11],
    popupAnchor: [10, -44],
    iconSize: [22 * icons.length, 22],
  });
};

interface OwnProps {
  mapMarker: MapMarker;
}

type Props = OwnProps;

const LocationMarker: React.FC<Props> = props => {
  const { mapMarker } = props;
  return (
    <Marker position={mapMarker.position} icon={marker([mapMarker.type])}>
      <Popup>{mapMarker.name}</Popup>
    </Marker>
  );
};

export { LocationMarker };
