import React, { useRef, useEffect, useState } from 'react';
import { Map, TileLayer, Popup, CircleMarker, LayersControl, WMSTileLayer } from 'react-leaflet';
import proj4 from 'proj4';
import projectAndRemapSensor from 'utilities/sensorsProjecteorAndMapper';
import defineProjectionZones from 'utilities/defineProjectionZones';
import { mapLayer } from 'types/mapLayer';
import { mockLayers } from 'data/mockLayers';
import EsriTiledMapLayer from 'components/EsriTiledMapLayer';
import EsriDynamicLayer from 'components/EsriDynamicLayer';
// import LegendControl from 'components/LegendControl';
import extractSensorsFromGrafanaStream from 'utilities/grafanaDataObjects';
import { sensor } from 'types/sensor';
import { mockSensorsSmall } from 'data/mockDataSmall';
import strutcureMocDataObjects from 'utilities/mocDataObjectsConverter';
import { Map as LeafletMap, Control } from 'leaflet';
import { envelope } from 'types/envelope';
import { getSensorsExtent } from 'utilities/utils';
import { typeSymbolColors } from 'data/defualtSensorColors';
import { sensorSymbol } from 'types/sensorSymbol';
import { PanelProps } from '@grafana/data';
import LegendControl from 'components/LegendControl';
import MarkerCluster from 'components/MarkerCluster';
import 'leaflet/dist/leaflet.css';
//import 'leaflet.css';

const MapPanel: React.FC<PanelProps> = ({ options, data, height, width }) => {
  const mapElement = useRef<any>();
  const mainMap = useRef<any>();
  const position: [number, number] = [60, 10.5];

  const [sensors, setSensors] = useState<sensor[]>([]);
  const [layers, setLayers] = useState<mapLayer[]>([]);

  useEffect(() => {
    console.log("Define projecteions and setting layers");
    proj4.defs(defineProjectionZones());
    const configLayerList = options.layers;
    setLayers(options.useMockLayers ? mockLayers : configLayerList);
    console.log("Define projecteions and setting layers");
  }, []);

  useEffect(() => {
    console.log("Got data");
    const unConvSensors = options.useMockData ? strutcureMocDataObjects(mockSensorsSmall) : extractSensorsFromGrafanaStream(data);
    console.log("Extracted sensors");
    const mapSensors: sensor[] = unConvSensors.map(element => projectAndRemapSensor(element));
    console.log("Projecteded and remapped sensors");
    const sensorsExtent: envelope = getSensorsExtent(mapSensors);
    console.log("Calculated sensor extent");
    setSensors(mapSensors);
    //console.log("data: ", data);
    console.log("typeSymbolColors", typeSymbolColors);
    if (mapSensors.length > 0) {
      const m = mainMap.current.leafletElement as LeafletMap;
      m.fitBounds([
        [sensorsExtent.minX, sensorsExtent.minY],
        [sensorsExtent.maxX, sensorsExtent.maxY],
      ]);
    }

    
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

  // const createClusterCustomIcon = (cluster) => {
  //   const count = cluster.getChildCount();
  //   let size = 'LargeXL';
  
  //   if (count < 10) {
  //     size = 'Small';
  //   }
  //   else if (count >= 10 && count < 100) {
  //     size = 'Medium';
  //   }
  //   else if (count >= 100 && count < 500) {
  //     size = 'Large';
  //   }
  //   const options = {
  //     cluster: `markerCluster${size}`,
  //   };
  
  //   return L.divIcon({
  //     html:
  //       `<div>
  //         <span class="markerClusterLabel">${count}</span>
  //       </div>`,
  //     className: `${options.cluster}`,
  //   });
  // };

  // function TOC(props: any) {
  //   return (
      
      
  //       <LegendControl  className="supportLegend">
  //         <ul className="legend">
  //               <li className="legendItem1">Strong Support</li>
  //               <li className="legendItem2">Weak Support</li>
  //               <li className="legendItem3">Weak Oppose</li>
  //               <li className="legendItem4">Strong Oppose</li>
  //             </ul>
  //     </LegendControl>
  //   );
  // }

  return (
    <Map ref={mainMap} center={position} zoom={8} maxZoom={18} style={{ height: height, width: width }}>
      <LayersElements layers={layers}></LayersElements>
      <LegendControl symbols={typeSymbolColors.filter(ts => sensors.find(s => s.instrumentType === ts.type))}></LegendControl>     
      
      <MarkerCluster sensors={sensors}></MarkerCluster>

      {/*<LegendControl symbols={typeSymbolColors.filter(ts => sensors.find(s => s.instrumentType === ts.type) !== null)}></LegendControl>   */}
      {sensors.map(c => {
        let settings = typeSymbolColors.find(t => t.type === c.instrumentType);
        if (!settings) {
          settings = typeSymbolColors.find(t => t.type === 'default') as sensorSymbol;
        }
        return (
          <></>
          // <CircleMarker color={settings.color} radius={settings.size} center={c.coord as [number, number]}>
          //   <Popup>
          //     <b>Instrument type: {c.instrumentType}</b>
          //     <br />
          //     <b>Unit: {c.sampleType}</b>
          //     <br />
          //     <b>InstrumentID: {c.id}</b>
          //     <br />
          //     <table>
          //       <tr>
          //         <td>Max:</td>
          //         <td>{c.min}</td>
          //       </tr>
          //       <tr>
          //         <td>Min:</td>
          //         <td>{c.max}</td>
          //       </tr>
          //       <tr>
          //         <td>Mean:</td>
          //         <td>{c.mean}</td>
          //       </tr>
          //     </table>
          //   </Popup>
          // </CircleMarker>
        );
      })}
      
    </Map>
  );
};
export { MapPanel };
