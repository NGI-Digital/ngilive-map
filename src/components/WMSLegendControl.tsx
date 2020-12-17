import { useEffect, useState } from 'react';
import React from 'react';
import '../customComps.css';
import { MapLayer } from '../types/mapLayer';

type WMSLegendControlProps = {
  mapLayers: MapLayer[];
  position: 'bottomleft' | 'bottomright' | 'topright' | 'topleft';
};

const POSITION_CLASSES = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right',
};

const LegendControl: React.FC<WMSLegendControlProps> = ({ mapLayers, position }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const positionClass = (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright;
  const [legendLayers, setLegendLayers] = useState<MapLayer[]>([]);

  useEffect(() => {
    setLegendLayers(mapLayers.filter(l => l.WMSLegendURL && l.isVisible));
  }, [mapLayers]);

  return (
    <>
      {legendLayers.length > 0 && (
        <div className={positionClass}>
          <div className="leaflet-control leaflet-bar">
            {!isCollapsed && (
              <div className="WMSLegendStyle" onClick={(): void => setIsCollapsed(true)}>
                {legendLayers.map(l => {
                  return (
                    <>
                      <img style={{ height: l.WMSLegendScale ? l.WMSLegendScale : '400px' }} src={l.WMSLegendURL}></img>
                    </>
                  );
                })}
              </div>
            )}
            {isCollapsed && (
              <button className="WMSLegendButtonStyle" onClick={(): void => setIsCollapsed(!isCollapsed)}>
                <span className="tooltiptext">Vis legende for temakartlag</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LegendControl;
