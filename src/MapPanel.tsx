import React, { useRef, useEffect, useState } from 'react';
import { Map, TileLayer, Popup, CircleMarker, LayersControl, WMSTileLayer } from 'react-leaflet';
import proj4 from 'proj4';
import projectAndRemapSensor from 'utilities/sensorsProjecteorAndMapper';
import defineProjectionZones from 'utilities/defineProjectionZones';
import { mapLayer } from 'types/mapLayer';
import { mockLayers } from 'data/mockLayers';
import EsriTiledMapLayer from 'components/EsriTiledMapLayer';
import EsriDynamicLayer from 'components/EsriDynamicLayer';
import extractSensorsFromGrafanaStream from 'utilities/grafanaDataObjects';
import { sensor } from 'types/sensor';
import { mockSensorsSmall } from 'data/mockDataSmall';
import strutcureMocDataObjects from 'utilities/mocDataObjectsConverter';
import { Map as LeafletMap } from 'leaflet';
import { envelope } from 'types/envelope';
import { getSensorsExtent } from 'utilities/utils';
import { typeSymbolColors } from 'data/defualtSensorColors';
import { sensorSymbol } from 'types/sensorSymbol';
import { PanelProps } from '@grafana/data';

const MapPanel: React.FC<PanelProps> = ({ options, data, height, width }) => {
  const mapElement = useRef<any>();
  const mainMap = useRef<any>();
  const position: [number, number] = [60, 10.5];

  const [sensors, setSensors] = useState<sensor[]>([]);
  const [layers, setLayers] = useState<mapLayer[]>([]);

  useEffect(() => {
    proj4.defs(defineProjectionZones());
    const configLayerList = options.layers;
    setLayers(options.useMockLayers ? mockLayers : configLayerList);
  }, []);

  useEffect(() => {
    const unConvSensors = options.useMockData ? strutcureMocDataObjects(mockSensorsSmall) : extractSensorsFromGrafanaStream(data);
    const mapSensors: sensor[] = unConvSensors.map(element => projectAndRemapSensor(element));
    const sensorsExtent: envelope = getSensorsExtent(mapSensors);
    setSensors(mapSensors);
    const m = mainMap.current.leafletElement as LeafletMap;
    m.fitBounds([
      [sensorsExtent.minX, sensorsExtent.minY],
      [sensorsExtent.maxX, sensorsExtent.maxY],
    ]);
  }, [data]);

  function layersElement(layer: any) {
    switch (layer.type) {
      case 'WMSLayer':
        return (
          <WMSTileLayer
            url={layer.serviceUrl}
            layers={layer.WMSLayers}
            transparent={true}
            format={'image/png'}
            tileSize={layer.tileSize != null ? layer.tileSize : 1024}
          />
        );
      case 'WMStiledLayer':
        return (
          <WMSTileLayer
            url={layer.serviceUrl}
            layers={layer.WMSLayers}
            transparent={true}
            format={'image/png'}
            tileSize={layer.tileSize != null ? layer.tileSize : 1024}
          />
        );
      case 'tiledLayer':
        return <TileLayer url={layer.serviceUrl} />;
      case 'esriTiledMapLayer':
        return <EsriTiledMapLayer url={layer.serviceUrl} />;
      case 'esriDynamicMapLayer':
        return <EsriDynamicLayer url={layer.serviceUrl} />;
      default:
        return null;
    }
  }

  function LayersElements(props: any) {
    const layerElements = props.layers.map((layer: any) => {
      if (layer.isBaseMap) {
        return (
          <LayersControl.BaseLayer name={layer.name} checked={layer.isVisible}>
            {layersElement(layer)}
          </LayersControl.BaseLayer>
        );
      } else {
        return (
          <LayersControl.Overlay name={layer.name} checked={layer.isVisible}>
            {layersElement(layer)}
          </LayersControl.Overlay>
        );
      }
    });
    return (
      <LayersControl ref={mapElement} position="bottomright">
        {layerElements}
      </LayersControl>
    );
  }

  return (
    <Map ref={mainMap} center={position} zoom={8} maxZoom={18} style={{ height: height, width: width }}>
      <LayersElements layers={layers}></LayersElements>

      {sensors.map(c => {
        let settings = typeSymbolColors.find(t => t.type === c.instrumentType);
        if (!settings) {
          settings = typeSymbolColors.find(t => t.type === 'default') as sensorSymbol;
        }
        return (
          <CircleMarker color={settings.color} radius={settings.size} center={c.coord as [number, number]}>
            <Popup>
              <b>Instrument type: {c.instrumentType}</b>
              <br />
              <b>Sampe type: {c.sampleType}</b>
              <br />
              <b>InstrumentID: {c.id}</b>
              <br />
              <table>
                <tr>
                  <td>Max:</td>
                  <td>{c.min}</td>
                </tr>
                <tr>
                  <td>Min:</td>
                  <td>{c.max}</td>
                </tr>
                <tr>
                  <td>Mean:</td>
                  <td>{c.mean}</td>
                </tr>
              </table>
            </Popup>
          </CircleMarker>
        );
      })}
    </Map>
  );
};
export { MapPanel };
