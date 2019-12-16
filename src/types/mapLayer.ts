export type layerType = 'esriTiledMapLayer' | 'esriDynamicMapLayer' | 'WMSLayer' | 'WMStiledLayer' | 'tiledLayer' | '';

export type mapLayer = {
  name: string;
  serviceUrl: string;
  type: layerType;
  isVisible: boolean;
  isBaseMap: boolean;
  opacity?: number; //0-1
  WMSLayers?: string;
  tileSize?: number;
};
