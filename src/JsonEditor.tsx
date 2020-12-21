import React, { useState } from 'react';
import { StandardEditorProps } from '@grafana/data';
import { TextArea } from '@grafana/ui';

interface Props extends StandardEditorProps<string, any, any> {}

export const PanelOptionCode: React.FC<Props> = ({ value, item, onChange, context }) => {
  if (typeof value !== 'string') {
    value = JSON.stringify(value, null, 2);
  }

  const [layers, setLayers] = useState<string>(value);
  console.log({ item });
  console.log({ context });
  return (
    <TextArea
      css=""
      value={layers}
      rows={30}
      onBlur={() => {
        try {
          const obj = JSON.parse(layers);
          onChange(obj);
          console.log('JSON SET!');
        } catch (e) {
          console.error('Invalid JSON', e);
        }
      }}
      onChange={e => {
        console.log(e.currentTarget.value);
        setLayers(e.currentTarget.value);
      }}
    />
  );
};
