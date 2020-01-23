import { useEffect, useState } from 'react';
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
import '../customComps.css'

type LegendControlProps = {
  symbols: sensorSymbol[]
}

const LegendControl: React.FC<LegendControlProps> = ({symbols}) => {
  const leaflet = useLeaflet();
  const [control, setControl] = useState<L.Control | null>(null);
  
  function createContent() {
    const jsx = (
      // PUT YOUR JSX FOR THE COMPONENT HERE:

      <div className="rcorners1">
        {symbols.map(s => {
          return (
            <>
            <div>
              <span style={{backgroundColor: s.color, width: '100px', height: '10px'}}>&nbsp;&nbsp;&nbsp;</span>
              <span style={{color: '#000000', backgroundColor: '#FFFFFF'}}>&nbsp;{s.type}</span>
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

  useEffect(() => {
    console.log("her", symbols)
    if(control) {
    control.onAdd = (map) => {
      return createContent();
    }

    control.onRemove= (map) => {
    }

    if(control) {

      (leaflet.map as L.Map).removeControl(control);
    }
    control.addTo(leaflet.map as L.Map);
  }

  }, [symbols, control])

  useEffect(() => {
    const c = new L.Control({position: 'topright'});
    setControl(c);
    console.log("Grm");
    // control.addTo(leaflet.map as L.Map);
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
