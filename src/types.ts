
export type DataType = 'csv' | 'xlsx' | 'json' | 'txt' | null;

export interface DatasetInfo {
  name: string;
  size: number;
  rows: number;
  cols: number;
  columns: string[];
  type: DataType;
  data: any[];
}

export interface VariableSummary {
  name: string;
  type: 'numeric' | 'categorical' | 'boolean' | 'date' | 'text';
  stats: {
    min?: number;
    max?: number;
    mean?: number;
    median?: number;
    stdDev?: number;
    nullCount: number;
    nullPercentage: number;
    uniqueValues: number;
  };
}

export interface PredictionResult {
  modelName: string;
  metrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1?: number;
    mae?: number;
    rmse?: number;
    r2?: number;
  };
  featureImportance: { feature: string; importance: number }[];
  rules: string[];
}
