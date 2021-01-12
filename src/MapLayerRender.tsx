import React from 'react';
import { TileLayer, WMSTileLayer } from 'react-leaflet';
import EsriTiledMapLayer from 'components/EsriTiledMapLayer';
import EsriDynamicLayer from 'components/EsriDynamicLayer';
import 'leaflet/dist/leaflet.css';
import { MapLayer } from 'types/mapLayer';

type MapLayerRenderProps = {
  layer: MapLayer;
};

const MapLayerRender: React.FC<MapLayerRenderProps> = ({ layer }) => {
  return (
    <>
      {layer.type === 'WMSLayer' && (
        <WMSTileLayer
          maxZoom={22}
          maxNativeZoom={18}
          url={layer.serviceUrl}
          layers={layer.WMSLayers}
          opacity={layer.opacity != null ? layer.opacity : 1.0}
          version={layer.WMSVersion != null ? layer.WMSVersion : '1.3.0'}
          transparent={true}
          format={'image/png'}
          tileSize={layer.tileSize != null ? layer.tileSize : 1024}
        />
      )}
      {layer.type === 'WMStiledLayer' && (
        <WMSTileLayer
          maxZoom={22}
          maxNativeZoom={18}
          url={layer.serviceUrl}
          layers={layer.WMSLayers}
          opacity={layer.opacity != null ? layer.opacity : 1.0}
          version={layer.WMSVersion != null ? layer.WMSVersion : '1.3.0'}
          transparent={true}
          format={'image/png'}
          tileSize={layer.tileSize != null ? layer.tileSize : 1024}
        />
      )}
      {layer.type === 'tiledLayer' && <TileLayer maxZoom={22} maxNativeZoom={18} url={layer.serviceUrl} />}
      {layer.type === 'esriTiledMapLayer' && (
        <EsriTiledMapLayer maxZoom={22} maxNativeZoom={18} url={layer.serviceUrl} />
      )}
      {layer.type === 'esriDynamicMapLayer' && (
        <>
          <EsriDynamicLayer maxZoom={22} maxNativeZoom={18} url={layer.serviceUrl} />
        </>
      )}
    </>
  );
};
export { MapLayerRender };
