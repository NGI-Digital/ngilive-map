import { PanelPlugin } from '@grafana/data';
import { MapPanel } from './MapPanel';
import { MapEditor, MapEditorFunctionProps, defaults } from './MapEditor';
import 'leaflet.css';

export const plugin = new PanelPlugin<MapEditorFunctionProps>(MapPanel).setDefaults(defaults).setEditor(MapEditor);
