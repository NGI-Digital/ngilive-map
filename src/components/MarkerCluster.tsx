import { useEffect, useState } from 'react';
import { useLeaflet } from 'react-leaflet';
import * as esri from 'esri-leaflet';
import { Map } from 'leaflet';
import L from 'leaflet';
import { sensor } from 'types/sensor';
import { typeSymbolColors } from 'data/defualtSensorColors';
import { sensorSymbol } from 'types/sensorSymbol';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import '../MarkerCluster.css'
import '../MarkerCluster.Default.css'

import {
    TileLayer, Marker, Popup
} from 'react-leaflet'
import React from 'react';
import ReactDOM from 'react-dom';

type MarkerClusterType = {
  sensors: sensor[];
};  

const MarkerCluster: React.FC<MarkerClusterType> = ({ sensors }) => {
  const leaflet = useLeaflet();
  const [markerGroup, setMarkerGroup] = useState();


  function createMarkerPopup(s: sensor) {
    const jsx = (
      <div>
         <b>{s.name}</b> <br /> <br />
               {s.instrumentType} [{s.unit}]
               <br />
               <table>
                 <tr>
                   <td>Last value:</td>
                   <td>{s.lastValue}</td>
                 </tr>
                 <tr>
                   <td>Max:</td>
                   <td>{s.max}</td>
                 </tr>
                 <tr>
                   <td>Min:</td>
                   <td>{s.min}</td>
                 </tr>
                 <tr>
                   <td>Mean:</td>
                   <td>{s.mean}</td>
                 </tr>
               </table>               
              
      </div>
    )

    let div = L.DomUtil.create('div', '');
    ReactDOM.render(jsx, div);
    return div;
  }

  useEffect(() => {
    const mcg = L.markerClusterGroup({spiderfyOnMaxZoom: true, zoomToBoundsOnClick: false, showCoverageOnHover: false
              });
    setMarkerGroup(mcg);

  }, []);

  useEffect(() => {
    if (markerGroup) {
      {
        markerGroup.clearLayers();
        sensors.map(c => {
          let settings = typeSymbolColors.find(t => t.type === c.instrumentType);
          if (!settings) {
            settings = typeSymbolColors.find(t => t.type === 'default') as sensorSymbol;
          }

        var popupStr = createMarkerPopup(c);
        var marker = L.circleMarker(c.coord as [number, number], {color:settings.color, radius: settings.size});
        marker.bindPopup(popupStr);
        //marker.bindTooltip(popupStr);        
        markerGroup.addLayer(marker);
        
        });

        (leaflet.map as Map).addLayer(markerGroup);

        console.log("Markergroup added: ", markerGroup);
      }
    }
  }, [sensors,markerGroup]);

  return null;
};

export default MarkerCluster;
