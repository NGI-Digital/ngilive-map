import { LatLngTuple } from 'leaflet';
import { MapMarker } from './mapMarker';

export type MapMarkerGroup = {
  markers: MapMarker[];
  center: LatLngTuple;
  isOpen: boolean | undefined;
};
