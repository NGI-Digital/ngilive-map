import { PanelPlugin } from '@grafana/data';
import { Map } from './Map';
import { MapEditor, MapEditorFunctionProps, defaults } from './MapEditor';
import 'leaflet.css';

export const plugin = new PanelPlugin<MapEditorFunctionProps>(Map).setDefaults(defaults).setEditor(MapEditor);
