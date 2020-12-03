import { createContext, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import * as esri from 'esri-leaflet';
import { Map } from 'leaflet';

const EsriTiledMapLayer = (props: any) => {
  const map = useMap();

  useEffect(() => {
    const layer = esri.tiledMapLayer({
      url: props.url,
      maxZoom: 18,
    });

    layer.addTo(map);
  }, [map, props.url]);

  return null;
};

export default EsriTiledMapLayer;
