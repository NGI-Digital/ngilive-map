import { PanelPlugin } from '@grafana/data';
import { Map } from './Map';
import 'leaflet.css';
import { MapLayer } from 'types/mapLayer';
import { PanelOptionCode } from 'JsonEditor';

export type MapEditorFunctionProps = {
  layers: MapLayer[];
  useMockData: boolean;
  useMockLayers: boolean;
  enableWebCams: boolean;
};

export const plugin = new PanelPlugin<MapEditorFunctionProps>(Map).setPanelOptions(builder => {
  return builder
    .addBooleanSwitch({
      name: 'Use mock layers',
      path: 'useMockLayers',
      category: ['NGI Map'],
      defaultValue: true,
    })
    .addBooleanSwitch({
      name: 'Use mock data',
      path: 'useMockData',
      category: ['NGI Map'],
      defaultValue: true,
    })
    .addBooleanSwitch({
      name: 'Use webcams',
      path: 'useWebcams',
      category: ['NGI Map'],
      defaultValue: false,
    })
    .addBooleanSwitch({
      name: 'Enable sensor names',
      path: 'useSensorNames',
      category: ['NGI Map'],
      defaultValue: false,
    })
    .addBooleanSwitch({
      name: 'Legacy query support',
      path: 'useLegacyQuery',
      category: ['NGI Map'],
      defaultValue: true,
    })
    .addCustomEditor({
      id: 'layers',
      path: 'layers',
      name: 'Layers',
      description: 'Layer',
      editor: PanelOptionCode,
      category: ['NGI Map'],
      defaultValue: [],
    });
});
