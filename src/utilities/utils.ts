import { sensor } from '../types/sensor';
import { envelope } from "../types/envelope"

const getSensorsExtent = (sensorArray: sensor[]): envelope => {
    const mapEx: envelope =
    {
        minX: 9999999999,
        maxX: -9999999999,
        minY: 999999999,
        maxY: -9999999999
    };
    sensorArray.forEach((sensor: sensor) => {
        mapEx.minX = mapEx.minX > sensor.coord[0] ? sensor.coord[0] : mapEx.minX;
        mapEx.maxX = mapEx.maxX < sensor.coord[0] ? sensor.coord[0] : mapEx.maxX;
        mapEx.minY = mapEx.minY > sensor.coord[1] ? sensor.coord[1] : mapEx.minY;
        mapEx.maxY = mapEx.maxY < sensor.coord[1] ? sensor.coord[1] : mapEx.maxY;
    });
    return mapEx;
}

export { getSensorsExtent };
