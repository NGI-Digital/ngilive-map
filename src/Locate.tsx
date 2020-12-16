import React from 'react';
import { useMap } from 'react-leaflet';

type LocateProps = {};

const Locate: React.FC<LocateProps> = () => {
  const map = useMap();

  map.addEventListener('click', () => {
    map.locate();
  });

  return (
    <>
      <div className="locate">L</div>
    </>
  );
};

export default Locate;
