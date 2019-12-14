
const defineProjectionZones = () => {
    let zoneDefinitions = [];
    for (let i = 5; i <= 30; i++) {
        zoneDefinitions.push([
            `EPSG:51${i < 10 ? '0' : ''}${i}`,
            `+proj=tmerc +lat_0=58 +lon_0=${i}.5 +k=1 +x_0=100000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs`,
        ]);
    }

    for (let i = 30; i <= 35; i++) {
        zoneDefinitions.push([`EPSG:258${i}`, `+proj=utm +zone=${i} +ellps=GRS80 +units=m +no_defs`]);
    }
    return zoneDefinitions;
}

export default defineProjectionZones;

