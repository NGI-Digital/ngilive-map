import { DataFrame } from '@grafana/data';

const getSensorQueryErrors = (dataFrame: DataFrame): string[] => {
  const requiredFields = ['sensor_name', 'pos_east', 'pos_north', 'coordinate_system', 'type'];

  let missingFields: string[] = [];
  requiredFields.forEach(req_field => {
    const field = dataFrame.fields.find(f => f.name === req_field);
    if (!field) {
      missingFields.push(req_field);
    }
  });

  return missingFields;
};

export { getSensorQueryErrors };
