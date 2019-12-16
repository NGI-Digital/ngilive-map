// Defines type sensor that is used before and after projetion
export type sensor = {
  id: number;
  coord: number[];
  coordSystem: string;
  sampleType: string;
  instrumentType: string;
  min?: number;
  max?: number;
  mean?: number;
};
