import { useEffect } from 'react';
//import { useLeaflet } from 'react-leaflet';
import { MapControl, useLeaflet } from 'react-leaflet';
import { MapControlProps } from 'react-leaflet';
import ReactDOM from 'react-dom';
//import * as esri from 'esri-leaflet';
import L from 'leaflet';
import { Map } from 'leaflet';
//import * as react from 'react';
import React from 'react';
import { sensorSymbol } from 'types/sensorSymbol';


type LegendControlProps = {
  symbols: sensorSymbol[]
}

const LegendControl: React.FC<LegendControlProps> = ({symbols}) => {
  const leaflet = useLeaflet();
  const control = new L.Control({position: 'topright'});

  useEffect(() => {
    console.log("her", symbols)

    control.onAdd = (map) => {
      const jsx = (
        // PUT YOUR JSX FOR THE COMPONENT HERE:

        <div style={{color: 'black'}}>
          {symbols.map(s => {
            return (
              <>
              <div>
        <span style={{backgroundColor: s.color, width: '100px', height: '10px'}}>&nbsp;&nbsp;&nbsp;</span>

          <span style={{backgroundColor: '#FFFFFF'}}>{s.type}</span>
          </div>
              </>
            )
          })}
        </div>
      )

      let div = L.DomUtil.create('div', '');
      ReactDOM.render(jsx, div);
      return div;
    }

  }, [symbols])

  useEffect(() => {
    control.addTo(leaflet.map as L.Map);
  }, []) 
 
  return (
  <></>
  )

  
  // const legend = new L.Control(
  //   { position: 'bottomright' }
  //   );

  // useEffect(() => {
  //   const jsx = (
  //     <div>
  //         {props.children}
  //     </div>
  // );


  //   legend.onAdd = (map) => {
  //         const div = L.DomUtil.create('div', '');
  //         ReactDOM.render(jsx, div);
  //         return div;
  //     };
  // }, []);

  // return legend;
};

 export default LegendControl;
