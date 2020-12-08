import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
//import { MapControlProps } from 'react-leaflet';
import ReactDOM from 'react-dom';
import L from 'leaflet';
//import { Map } from 'leaflet';
import React from 'react';
import { sensorConfig } from 'types/sensorConfig';
import '../customComps.css';

type LegendControlProps = {
  symbols: sensorConfig[];
};

const LegendControl: React.FC<LegendControlProps> = ({ symbols }) => {
  const map = useMap();
  const [control, setControl] = useState<L.Control | null>(null);

  // TODO: Fix
  useEffect(() => {
    function createContent() {
      const jsx = (
        <div className="rcorners1">
          {symbols
            .filter(s => s.showInLegend)
            .map(s => {
              return (
                <>
                  <div>
                    <span style={{ backgroundColor: s.color, width: '100px', height: '10px' }}>&nbsp;&nbsp;&nbsp;</span>
                    <span style={{ color: '#000000', backgroundColor: '#FFFFFF' }}>&nbsp;{s.type}</span>
                  </div>
                </>
              );
            })}
        </div>
      );

      const div = L.DomUtil.create('div', '');
      ReactDOM.render(jsx, div);
      return div;
    }
    if (control) {
      control.onAdd = map => {
        return createContent();
      };

      control.onRemove = map => {};

      if (control) {
        map.removeControl(control);
      }
      control.addTo(map);
    }
  });

  useEffect(() => {
    const c = new L.Control({ position: 'topright' });
    setControl(c);
  }, []);

  return <></>;
};

export default LegendControl;
