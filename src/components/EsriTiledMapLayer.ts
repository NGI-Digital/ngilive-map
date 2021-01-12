import { useEffect } from 'react';
import { useLeafletContext } from '@react-leaflet/core';
import * as esri from 'esri-leaflet';

const EsriTiledMapLayer = (props: any) => {
  const context = useLeafletContext();

  useEffect(() => {
    const layer = esri.tiledMapLayer({
      url: props.url,
      maxZoom: 18,
    });
    //@ts-ignore
    layer.addTo(context.layerContainer as Map);
  }, [context.layerContainer, props.url]);

  return null;
};

export default EsriTiledMapLayer;
