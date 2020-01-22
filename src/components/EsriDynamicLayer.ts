import { useEffect } from 'react';
import { useLeaflet } from 'react-leaflet';
import * as esri from 'esri-leaflet';
import { Map } from 'leaflet';

const EsriDynamicLayer = (props: any) => {
  const leaflet = useLeaflet();

  useEffect(() => {
    const layer = esri.dynamicMapLayer({
      url: props.url,
      maxZoom: 20,
    });
    layer.addTo(leaflet.layerContainer as Map);
  }, [props]);

  return null;
};

export default EsriDynamicLayer;
