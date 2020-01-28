// Defines type sensor that is used before and after projetion
export type sensor = {
  name: string;
  id: number;
  coord: number[];
  coordSystem: string;
  unit: string;
  instrumentType: string;
  min?: number;
  max?: number;
  mean?: number;
  lastValue?: number;
};
