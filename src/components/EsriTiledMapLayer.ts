import { useEffect } from 'react';
import { useLeaflet } from 'react-leaflet';
import * as esri from 'esri-leaflet'
import { Map } from 'leaflet';
 
const EsriTiledMapLayer = (props: any) => {
    const leaflet  = useLeaflet();
 
    useEffect(() => {
        let layer = esri.tiledMapLayer({
            url: props.url,
            maxZoom: 18
          })
      
            layer.addTo(leaflet.layerContainer as Map);
        
    }, [props])
 
    return null;
}
 
export default EsriTiledMapLayer;
