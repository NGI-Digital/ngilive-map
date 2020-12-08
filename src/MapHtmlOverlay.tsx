import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import ReactDOM from 'react-dom';
import L from 'leaflet';
import React from 'react';

type MapHtmlOverlayProps = {
  showSensorNames: boolean;
  setShowSensorNames: any;
};

const MapHtmlOverlay: React.FC<MapHtmlOverlayProps> = ({ showSensorNames, setShowSensorNames }) => {
  const map = useMap();
  const [control, setControl] = useState<L.Control | null>(null);

  useEffect(() => {
    function createContent() {
      const jsx = (
        <div className="rcorners1">
          <>
            <div style={{ backgroundColor: 'white', padding: '1em', borderRadius: '1em' }}>
              <input
                id="showNames"
                checked={showSensorNames}
                onChange={() => setShowSensorNames(!showSensorNames)}
                type="checkbox"
                title="Show sensor names"
              ></input>
              <label htmlFor="showNames">&nbsp;Show sensor names</label>
            </div>
          </>
        </div>
      );

      const div = L.DomUtil.create('div', '');
      ReactDOM.render(jsx, div);
      return div;
    }
    if (control) {
      control.onAdd = () => {
        return createContent();
      };

      //   if (control) {
      //     map.removeControl(control);
      //   }
      control.addTo(map);
    }
  });

  useEffect(() => {
    const c = new L.Control({ position: 'bottomright' });
    setControl(c);
  }, []);

  return <></>;
};

export default MapHtmlOverlay;
