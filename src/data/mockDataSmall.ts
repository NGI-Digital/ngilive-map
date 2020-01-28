export type MocSensor = {
  INSTRUMENT_NAME: string;
  COORDINATE_ID?: number;
  INSTRUMENT_ID: number;
  SAMPLER_ID?: string;
  SAMPLE_TYPE: string;
  TYPE: string;
  MAX: number;
  MIN?: number;
  MEAN?: number;
  XPOS: number;
  YPOS: number;
  ZPOS?: number;
  COORDINATE_SYSTEM: string;
  DEPTH: number;
};

export const mockSensorsSmall: MocSensor[] = [
  {
    INSTRUMENT_NAME: "ab",
    COORDINATE_ID: 10,
    INSTRUMENT_ID: 10,
    SAMPLER_ID: 'NULL',
    SAMPLE_TYPE: 'pressure',
    TYPE: 'pressure',
    MIN: 14,
    MAX: 14,
    MEAN: 14,
    XPOS: 6658571.468,
    YPOS: 572743.018,
    ZPOS: 99.99,
    COORDINATE_SYSTEM: 'UTM32',
    DEPTH: 5.5,
  },
  {
    INSTRUMENT_NAME: "ab",
    COORDINATE_ID: 20,
    INSTRUMENT_ID: 20,
    SAMPLER_ID: 'NULL',
    SAMPLE_TYPE: 'diceplacement',
    TYPE: 'pressure',
    MIN: 5,
    MAX: 5,
    MEAN: 5,
    XPOS: 6639559.851,
    YPOS: 582404.97,
    ZPOS: 115.724,
    COORDINATE_SYSTEM: 'UTM32',
    DEPTH: 123.1,
  },
  {
    INSTRUMENT_NAME: "ab",
    COORDINATE_ID: 30,
    INSTRUMENT_ID: 30,
    SAMPLER_ID: 'NULL',
    SAMPLE_TYPE: 'pressure',
    TYPE: 'pressure',
    MIN: 8,
    MAX: 8,
    MEAN: 8,
    XPOS: 6639639.969,
    YPOS: 581599.904,
    ZPOS: 116.62,
    COORDINATE_SYSTEM: 'UTM32',
    DEPTH: 179.5,
  },
  {
    INSTRUMENT_NAME: "ab",
    COORDINATE_ID: 40,
    INSTRUMENT_ID: 40,
    SAMPLER_ID: 'NULL',
    SAMPLE_TYPE: 'pressure',
    TYPE: 'pressure',
    MIN: 10,
    MAX: 11,
    MEAN: 11,
    XPOS: 6645470.567,
    YPOS: 578458.453,
    ZPOS: 158.631,
    COORDINATE_SYSTEM: 'UTM32',
    DEPTH: 78,
  },
];
