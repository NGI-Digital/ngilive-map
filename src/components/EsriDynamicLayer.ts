import { useEffect } from 'react';
import { useMap, } from 'react-leaflet';
import * as esri from 'esri-leaflet';


const EsriDynamicLayer = (props: any) => {
  const map = useMap();

  useEffect(() => {


    const layer = esri.dynamicMapLayer({
      url: props.url,
      maxZoom: 22,
      attribution: '',
    });

    
    layer.addTo(map);

    
  }, [map, props.url]);

  return null;
};

export default EsriDynamicLayer;
