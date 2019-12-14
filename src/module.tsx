import { PanelPlugin } from '@grafana/data';
import { MapPanel } from './MapPanel';
import { MapEditor, MapEditorFunctionProps, defaults } from './MapEditor';
import 'leaflet.css';
import 'app.css';

export const plugin = new PanelPlugin<MapEditorFunctionProps>(MapPanel).setDefaults(defaults).setEditor(MapEditor);
