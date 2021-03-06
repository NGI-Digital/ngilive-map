import { useEffect } from 'react';
import { useLeaflet } from 'react-leaflet';
import * as esri from 'esri-leaflet';
import { Map } from 'leaflet';

const EsriTiledMapLayer = (props: any) => {
  const leaflet = useLeaflet();

  useEffect(() => {
    const layer = esri.tiledMapLayer({
      url: props.url,
      maxZoom: 18,
    });

    layer.addTo(leaflet.layerContainer as Map);
  }, []);

  return null;
};

export default EsriTiledMapLayer;
