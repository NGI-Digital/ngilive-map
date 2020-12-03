import React, { useEffect, useState } from 'react';
import { Field, Label, Button, Select, Switch, PanelOptionsGrid, PanelOptionsGroup, Input } from '@grafana/ui';
import { PanelEditorProps } from '@grafana/data';
import { MapEditorFunctionProps } from 'MapEditor';
import { mapLayer } from 'types/mapLayer';

const MapEditorFunction: React.FC<PanelEditorProps<MapEditorFunctionProps>> = ({ onOptionsChange, options }) => {
  const [layers, setLayers] = useState<mapLayer[]>(options.layers);

  useEffect(() => {
    onOptionsChange({ ...options, layers: layers });
  }, [layers, onOptionsChange, options]);

  const addRow = () => {
    //console.log('options', options);
    setLayers([
      ...layers,
      {
        name: '',
        serviceUrl: '',
        type: '',
        isVisible: false,
        isBaseMap: false,
        opacity: 0,
        WMSLayers: '',
        tileSize: 1024,
      },
    ]);
  };

  const removeRow = (index: number) => {
    // layers.splice(index, 1), setLayers([...layers]);
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
                css=""
                label="Use mock data"
                checked={options.useMockData}
                onChange={(event: any) => onOptionsChange({ ...options, useMockData: event.target.checked })}
              />
              <Switch
                css=""
                label="Use mock layers"
                checked={options.useMockLayers}
                onChange={(event: any) => onOptionsChange({ ...options, useMockLayers: event.target.checked })}
              />
            </PanelOptionsGroup>
            <PanelOptionsGroup title="Webcam enable">
              <Switch
                css=""
                label="Enable webcam layer"
                checked={options.enableWebCams}
                onChange={(event: any) => onOptionsChange({ ...options, enableWebCams: event.target.checked })}
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
                      <Field label="Layer name">
                        <Input
                          css=""
                          name="name"
                          type="text"
                          onChange={event => onChange(event, index)}
                          value={l.name || ''}
                        />
                      </Field>
                      <Button variant="destructive" onClick={() => removeRow(index)}>
                        Remove layer
                      </Button>
                    </div>
                    <div className="gf-form">
                      <Field label="Service URL">
                        <Input
                          css=""
                          name="serviceUrl"
                          type="text"
                          onChange={event => onChange(event, index)}
                          value={l.serviceUrl || ''}
                        />
                      </Field>
                      <Label>Type</Label>
                      <div className="gf-form-select-wrapper max-width-15">
                        <select
                          className="input-small gf-form-input"
                          name="type"
                          value={l.type}
                          onChange={event => onChange(event, index)}
                        >
                          <option value="esriTiledMapLayer">esriTiledMapLayer</option>
                          <option value="esriDynamicMapLayer">esriDynamicMapLayer</option>
                          <option value="WMSLayer">WMSLayer</option>
                          <option value="WMStiledLayer">WMStiledLayer</option>
                          <option value="tiledLayer">tiledLayer</option>
                        </select>
                      </div>

                      <Switch
                        css=""
                        label="Synlig"
                        checked={l.isVisible}
                        onChange={event => onChange(event, index, 'isVisible')}
                      />
                      <Switch
                        css=""
                        label="Bakgrunn"
                        checked={l.isBaseMap}
                        onChange={event => onChange(event, index, 'isBaseMap')}
                      />

                      {/* <FormLabel width={6}>Opacity</FormLabel>
                      <input name="opacity" type="number" value={l.opacity} onChange={event => onChange(event, index)}></input> */}

                      <Field label="Opacity ">
                        <Input
                          css=""
                          name="opacity"
                          type="number"
                          onChange={event => onChange(event, index)}
                          value={l.opacity || ''}
                        />
                      </Field>
                    </div>
                    <div className="gf-form">
                      {/* <FormLabel width={8}>WMSlayers</FormLabel>
                      <input name="WMSLayers" type="text" value={l.WMSLayers} onChange={event => onChange(event, index)}></input> */}
                      <Field label="WMSLayers ">
                        <Input
                          css=""
                          name="WMSLayers"
                          type="text"
                          onChange={event => onChange(event, index)}
                          value={l.WMSLayers || ''}
                        />
                      </Field>

                      <Field label="WMSlegend URL ">
                        <Input
                          css=""
                          name="WMSLegendURL"
                          type="text"
                          onChange={event => onChange(event, index)}
                          value={l.WMSLegendURL || ''}
                        />
                      </Field>
                      <Field label="WMSlegendheight <NNpx>">
                        <Input
                          css=""
                          name="WMSLegendScale"
                          type="text"
                          onChange={event => onChange(event, index)}
                          value={l.WMSLegendScale || ''}
                        />
                      </Field>

                      <Field label="WMS version">
                        <Input
                          css=""
                          name="WMSVersion"
                          type="text"
                          onChange={event => onChange(event, index)}
                          value={l.WMSVersion || ''}
                        />
                      </Field>
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
