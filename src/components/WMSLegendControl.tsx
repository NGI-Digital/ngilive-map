import { useEffect, useState } from 'react';
import { MapControl, useLeaflet } from 'react-leaflet';
//import { MapControlProps } from 'react-leaflet';
import ReactDOM from 'react-dom';
import L from 'leaflet';
//import { Map } from 'leaflet';
import React from 'react';
//import { sensorConfig } from 'types/sensorConfig';
import '../customComps.css';
import { mapLayer } from '../types/mapLayer';

type WMSLegendControlProps = {
  mapLayers: mapLayer[];
};

const LegendControl: React.FC<WMSLegendControlProps> = ({ mapLayers }) => {
  const leaflet = useLeaflet();
  const [control, setControl] = useState<L.Control | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  function createContent() {
    // console.log('layers', mapLayers);
    const renderLegend = (
      <div className="WMSLegendStyle" onClick={(e): void => setIsCollapsed(true)}>
        {mapLayers
          .filter(l => l.WMSLegendURL != null && l.WMSLegendURL != '')
          .map(l => {
            return (
              <>
                <img style={{ height: l.WMSLegendScale ? l.WMSLegendScale : '400px' }} src={l.WMSLegendURL}></img>
              </>
            );
          })}
      </div>
    );

    const collapsed = (
      <div>
        {/* <img src="../img/camera.png" onClick={(e): void => setIsCollapsed(false)}></img> */}
        <button className="WMSLegendButtonStyle" onClick={(e): void => setIsCollapsed(false)}></button>
      </div>
    );

    const div = L.DomUtil.create('div', '');
    if (isCollapsed) ReactDOM.render(collapsed, div);
    else ReactDOM.render(renderLegend, div);
    console.log('div:', div);
    return div;
  }

  useEffect(() => {
    if (control) {
      control.onAdd = map => {
        const ht = createContent();
        console.log('HTML content', ht);
        return ht;
      };

      control.onRemove = map => {};

      if (control) {
        (leaflet.map as L.Map).removeControl(control);
      }
      control.addTo(leaflet.map as L.Map);
    }
  }, [mapLayers, control, isCollapsed]);

  useEffect(() => {
    const c = new L.Control({ position: 'bottomleft' });
    setControl(c);
  }, []);

  return <></>;
};

export default LegendControl;
