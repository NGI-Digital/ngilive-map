import { useEffect } from 'react';
import { useLeafletContext } from '@react-leaflet/core';
import * as esri from 'esri-leaflet';
import { Map } from 'leaflet';

const EsriDynamicLayer = (props: any) => {
  const context = useLeafletContext();

  useEffect(() => {
    const layer = esri.dynamicMapLayer({
      url: props.url,
      maxZoom: 22,
      attribution: '',
    });

    layer.addTo(context.layerContainer as Map);
  }, [context.layerContainer, props.url]);

  return null;
};

export default EsriDynamicLayer;
