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
      // PUT YOUR JSX FOR THE COMPONENT HERE:

      <div>
         <b>Measurand: {s.instrumentType}</b>
               <br />
               <b>Unit: {s.sampleType}</b>
               <br />
               <b>Instrument id: {s.id}</b>
               <br />
               <table>
                 <tr>
                   <td>Max:</td>
                   <td>{s.min}</td>
                 </tr>
                 <tr>
                   <td>Min:</td>
                   <td>{s.max}</td>
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
    //console.log("mcg", mcg);
    setMarkerGroup(mcg);

    // iconCreateFunction: function(cluster) {
    //   return L.divIcon({ html: '<b>' + cluster.getChildCount() + '</b>' });
    // }


  }, []);

  useEffect(() => {
    //console.log("markerGroup",markerGroup);
    if (markerGroup) {
      {
        // console.log("L.icon", L.icon);
        // let DefaultIcon = L.icon({
        //     iconUrl: L.icon as any
        // });
        
        // L.Marker.prototype.options.icon = DefaultIcon;
       
        sensors.map(c => {
          let settings = typeSymbolColors.find(t => t.type === c.instrumentType);
          if (!settings) {
            settings = typeSymbolColors.find(t => t.type === 'default') as sensorSymbol;
          }
        //   var marker = L.marker(c.coord as [number, number]);

        var popupStr = createMarkerPopup(c);
        var marker = L.circleMarker(c.coord as [number, number], {color:settings.color, radius: settings.size});
        marker.bindPopup(popupStr);        
        markerGroup.addLayer(marker);
        
        });
      }
      (leaflet.map as Map).addLayer(markerGroup);
      console.log("Markergroup added: ", markerGroup);
      // for (var i = 0; i < addressPoints.length; i++) {
      //     var a = addressPoints[i];
      //     var title = a[2];
      //     var marker = L.marker(new L.LatLng(a[0], a[1]), { title: title });
      //     marker.bindPopup(title);
      //     markers.addLayer(marker);
      // }
    }
  }, [sensors,markerGroup]);

  return null;
};

export default MarkerCluster;
