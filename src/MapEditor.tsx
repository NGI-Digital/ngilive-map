import React, { PureComponent } from 'react';
import { PanelEditorProps } from '@grafana/data';
import MapEditorFunction from 'MapEditorFunction';
import { mapLayer } from 'types/mapLayer';

export type MapEditorFunctionProps = {
  layers: mapLayer[];
  useMockData: boolean;
  useMockLayers: boolean;
};

export const defaults: MapEditorFunctionProps = {
  layers: [],
  useMockData: true,
  useMockLayers: true,
};

export class MapEditor extends PureComponent<PanelEditorProps<MapEditorFunctionProps>> {
  render() {
    return <MapEditorFunction {...this.props}></MapEditorFunction>;
  }
}
