import { mapLayer } from 'types/mapLayer';

export const mockLayers: mapLayer[] = [
  {
    name: 'Flybilder',
    type: 'tiledLayer',
    serviceUrl:
      'https://services.geodataonline.no/arcgis/rest/services/Geocache_WMAS_WGS84/GeocacheBilder/MapServer/tile/{z}/{y}/{x}',
    isVisible: false,
    isBaseMap: true,
  },
  {
    name: 'Topgrafi',
    type: 'tiledLayer',
    serviceUrl:
      'https://services.geodataonline.no/arcgis/rest/services/Geocache_WMAS_WGS84/GeocacheBasis/MapServer/tile/{z}/{y}/{x}',
    isVisible: true,
    isBaseMap: true,
  },
  // {
  //   name: 'Topgrafi test',
  //   type: 'esriTiledMapLayer',
  //   serviceUrl: 'https://services.geodataonline.no/arcgis/rest/services/Geocache_WMAS_WGS84/GeocacheBasis/MapServer',
  //   isVisible: true,
  //   isBaseMap: true,
  // },
  // {
  //   name: 'Topgrafi landskap',
  //   type: 'tiledLayer',
  //   serviceUrl: 'https://services.geodataonline.no/arcgis/rest/services/Geocache_WMAS_WGS84/GeocacheLandskap/MapServer/tile/{z}/{y}/{x}',
  //   isVisible: false,
  //   isBaseMap: true,
  // },
  {
    name: 'Eiendommer',
    type: 'WMSLayer',
    serviceUrl: 'https://openwms.statkart.no/skwms1/wms.matrikkel?SERVICE=WMS',
    isVisible: false,
    isBaseMap: false,
    WMSLayers: 'matrikkel_WMS',
    tileSize: 1024,
  },
  {
    name: 'Bergrunn N250',
    type: 'WMSLayer',
    serviceUrl: 'http://geo.ngu.no/mapserver/BerggrunnWMS?SERVICE=WMS',
    isVisible: false,
    isBaseMap: false,
    opacity: 0.5,
    WMSLayers: 'BerggrunnWMS,Bergart_flate_N250,Bergart_grense_N250,Berggrunn_raster_N250,Lineamenter_N250',
    tileSize: 1024,
  },
];
