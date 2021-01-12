import React, { useState } from 'react';
import { StandardEditorProps } from '@grafana/data';
import { TextArea } from '@grafana/ui';

interface Props extends StandardEditorProps<string, any, any> {}

export const PanelOptionCode: React.FC<Props> = ({ value, item, onChange, context }) => {
  if (typeof value !== 'string') {
    value = JSON.stringify(value, null, 2);
  }

  const [layers, setLayers] = useState<string>(value);
  return (
    <TextArea
      css=""
      value={layers}
      rows={30}
      onBlur={() => {
        try {
          const obj = JSON.parse(layers);
          onChange(obj);
        } catch (e) {}
      }}
      onChange={e => {
        setLayers(e.currentTarget.value);
      }}
    />
  );
};
