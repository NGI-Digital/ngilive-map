import { LatLngExpression } from 'leaflet';
import { MapMarker } from './mapMarker';

export type MapMarkerGroup = {
  markers: MapMarker[];
  center: LatLngExpression;
  isOpen: boolean | undefined;
};
