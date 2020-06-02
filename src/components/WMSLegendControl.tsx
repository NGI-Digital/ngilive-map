import { useEffect, useState } from 'react';
import { MapControl, useLeaflet, LayersControl } from 'react-leaflet';
//import { MapControlProps } from 'react-leaflet';
import ReactDOM from 'react-dom';
import L from 'leaflet';
//import { Map } from 'leaflet';
import React from 'react';
//import { sensorConfig } from 'types/sensorConfig';
import '../customComps.css';
import { mapLayer } from '../types/mapLayer';
//import { Map as LeafletMap } from 'leaflet';

type WMSLegendControlProps = {
  mapLayers: mapLayer[];
};

const LegendControl: React.FC<WMSLegendControlProps> = ({ mapLayers }) => {
  const leaflet = useLeaflet();
  const [control, setControl] = useState<L.Control | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [includLayersInLegend, setIncludeLayersInLegend] = useState<string[]>([]);

  function createContent() {
    var counter = 0;
    console.log('includLayersInLegend', includLayersInLegend);

    const buttonHTML = (
      <div>
        <button className="WMSLegendButtonStyle" onClick={(e): void => setIsCollapsed(!isCollapsed)}>
          <span className="tooltiptext">Vis legende for temakartlag</span>
        </button>
      </div>
    );

    const buttonHTMLChecked = (
      <div>
        <button className="WMSLegendButtonStyleChecked" onClick={(e): void => setIsCollapsed(!isCollapsed)}>
          <span className="tooltiptext">Ingen temakartlag synlinge</span>
        </button>
      </div>
    );

    const legehtHTML = (
      <div className="WMSLegendStyle" onClick={(e): void => setIsCollapsed(true)}>
        {mapLayers
          .filter(l => l.WMSLegendURL != null && l.WMSLegendURL != '')
          .filter(l => includLayersInLegend.includes(l.name) || l.isVisible === true)
          .map(l => {
            counter++;
            return (
              <>
                <img style={{ height: l.WMSLegendScale ? l.WMSLegendScale : '400px' }} src={l.WMSLegendURL}></img>
              </>
            );
          })}
      </div>
    );

    // console.log('Antall:', counter);
    const div = L.DomUtil.create('div', '');
    if (!isCollapsed && counter == 0) {
      ReactDOM.render(buttonHTMLChecked, div);
    } else if (isCollapsed) {
      ReactDOM.render(buttonHTML, div);
    } else {
      ReactDOM.render(legehtHTML, div);
    }
    return div;
  }

  // useEffect(() => {
  //   console.log('her er jeg XX');
  //   console.log('includLayersInLegendXX', includLayersInLegend);
  // }, [mapLayers]);

  useEffect(() => {
    // console.log('her er jeg #1');
    if (control) {
      control.onAdd = map => {
        const ht = createContent();
        return ht;
      };

      control.onRemove = map => {};

      if (control) {
        (leaflet.map as L.Map).removeControl(control);
      }
      control.addTo(leaflet.map as L.Map);
    }
  }, [mapLayers, control, isCollapsed, includLayersInLegend]);

  useEffect(() => {
    // notIncludeLayers = [];

    const c = new L.Control({ position: 'bottomleft' });
    console.log('her er jeg');

    if (leaflet.map) {
      leaflet.map.addEventListener('overlayremove', (e: any) => {
        console.log('her');
        // const newArr = includLayersInLegend.filter(s => s !== e.name);
        setIncludeLayersInLegend(state => state.filter(s => s !== e.name));
      });
      leaflet.map.addEventListener('overlayadd', (e: any) => {
        console.log(includLayersInLegend, e.name);
        console.log('Pakka ut:', ...includLayersInLegend);
        setIncludeLayersInLegend(state => [...state, e.name]);
        console.log(includLayersInLegend, e.name);
      });
    }

    setControl(c);
  }, []);

  return <></>;
};

export default LegendControl;
