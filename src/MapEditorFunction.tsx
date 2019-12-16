import React, { useEffect, useState } from 'react';
import { FormField, FormLabel, Button, Select, Switch, PanelOptionsGrid, PanelOptionsGroup } from '@grafana/ui';
import { PanelEditorProps } from '@grafana/data';
import { MapEditorFunctionProps } from 'MapEditor';
import { mapLayer } from 'types/mapLayer';

const MapEditorFunction: React.FC<PanelEditorProps<MapEditorFunctionProps>> = ({ onOptionsChange, options }) => {
  const [layers, setLayers] = useState<mapLayer[]>(options.layers);

  useEffect(() => {
    onOptionsChange({ ...options, layers: layers });
  }, [layers]);

  const addRow = () => {
    setLayers([...layers, { name: '', serviceUrl: '', type: '', isVisible: false, isBaseMap: false, opacity: 0, WMSLayers: '', tileSize: 1024 }]);
  };

  const removeRow = (index: number) => {
    layers.splice(index, 1), setLayers([...layers]);
  };

  const onChange = (event: any, index: number, fieldName?: string) => {
    const { name, type } = event.target;
    let { value } = event.target;
    if (type === 'checkbox') {
      value = event.target.checked;
    }
    const field: string = fieldName === undefined ? name : fieldName;
    layers[index][field] = value;
    setLayers([...layers]);
  };
  return (
    <>
      <div className="editor-row">
        <div className="section gf-form-group">
          <h2 className="section-heading">Kartlag</h2>
          <PanelOptionsGrid>
            <PanelOptionsGroup title="Debug config">
              <Switch
                label="Use mock data"
                checked={options.useMockData}
                onChange={(event: any) => onOptionsChange({ ...options, useMockData: event.target.checked })}
              />
              <Switch
                label="Use mock layers"
                checked={options.useMockLayers}
                onChange={(event: any) => onOptionsChange({ ...options, useMockLayers: event.target.checked })}
              />
            </PanelOptionsGroup>
          </PanelOptionsGrid>

          <Button onClick={addRow}>Add new layer</Button>
          <br></br>

          {layers.map((l, index) => {
            const checkedAttr = { checked: true };
            return (
              <>
                <PanelOptionsGrid>
                  <PanelOptionsGroup title="Map layers">
                    <div className="gf-form">
                      <FormField
                        label="Layer name"
                        name="name"
                        labelWidth={10}
                        inputWidth={10}
                        type="text"
                        onChange={event => onChange(event, index)}
                        value={l.name || ''}
                      />
                      <Button variant="danger" onClick={() => removeRow(index)}>
                        Remove layer
                      </Button>
                    </div>
                    <div className="gf-form">
                      <FormField
                        label="Service URL"
                        name="serviceUrl"
                        labelWidth={11}
                        inputWidth={30}
                        type="text"
                        onChange={event => onChange(event, index)}
                        value={l.serviceUrl || ''}
                      />
                      <FormLabel width={4}>Type</FormLabel>
                      <div className="gf-form-select-wrapper max-width-9">
                        <select className="input-small gf-form-input" name="type" value={l.type} onChange={event => onChange(event, index)}>
                          <option value="esriTiledMapLayer">esriTiledMapLayer</option>
                          <option value="esriDynamicMapLayer">esriDynamicMapLayer</option>
                          <option value="WMSLayer">WMSLayer</option>
                          <option value="WMStiledLayer">WMStiledLayer</option>
                          <option value="tiledLayer">tiledLayer</option>
                        </select>
                      </div>

                      <Switch label="Synlig" checked={l.isVisible} onChange={event => onChange(event, index, 'isVisible')} />
                      <Switch label="Bakgrunn" checked={l.isBaseMap} onChange={event => onChange(event, index, 'isBaseMap')} />

                      <FormLabel width={6}>Opacity</FormLabel>
                      <input name="opacity" type="number" value={l.opacity} onChange={event => onChange(event, index)}></input>
                      <FormLabel width={8}>WMSlayers</FormLabel>
                      <input name="WMSLayers" type="text" value={l.WMSLayers} onChange={event => onChange(event, index)}></input>
                    </div>
                  </PanelOptionsGroup>
                </PanelOptionsGrid>
              </>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MapEditorFunction;
