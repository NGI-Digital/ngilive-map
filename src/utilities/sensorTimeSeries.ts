import { sensorTimeSerial } from '../types/sensorTimeSierial';

const getTimeSerial = (data: any, sensorName: string): sensorTimeSerial => {
  const returnData: sensorTimeSerial = {
    values: [],
    timestamps: [],
  };

  const series = data.series;
  for (let serial of series) {
    if (typeof serial.name != 'undefined') {
      if (serial.name === sensorName) {
        const vals = serial.fields[0].values.buffer;
        const timestamps = serial.fields[1].values.buffer;
        returnData.values = vals;
        returnData.timestamps = timestamps;

        // var new_array: string[] = dates.map(function(element: number) {
        //   console.log('element:', element);
        //   var date = new Date(element);
        //   const dateStr =
        //     date.getFullYear() +
        //     '.' +
        //     date.getMonth() +
        //     '.' +
        //     date.getDate() +
        //     '-' +
        //     date.getFullYear() +
        //     '.' +
        //     date.getHours() +
        //     '.' +
        //     date.getMinutes();
        //   //     date.getFullYear(),
        //   //     date.getMonth()+1,
        //   //     date.getDate(),
        //   //     date.getHours(),
        //   //     date.getMinutes(),
        //   //     date.getSeconds(),
        //   //  ];

        //   console.log('temp:', dateStr);
        //   //element[2] = temp.toISOString();
        //   return dateStr;
        // });
        // returnData.dates = new_array;
        //console.log('Instrumentnavn:', serial.name, 'Dataserie', serial);
      }
    }
  }

  return returnData;
};

export default getTimeSerial;
