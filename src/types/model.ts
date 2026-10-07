export type RawInput = Record<string, number | string>;
export type Outputs = Record<string, number | number[]>;

export type FormatKind = "plain" | "clock" | "hours" | "minutes";
export interface Option { value: string | number; label: string; emoji?: string }
interface FieldBase { name: string; label: string; help?: string; invalid?: string }
export interface SliderField extends FieldBase { type: "slider"; min: number; max: number; step: number; default: number; unit?: string; format?: FormatKind; log?: boolean }
export interface NumberFieldDef extends FieldBase { type: "number"; min: number; max: number; step: number; default: number; unit?: string }
export interface SegmentedField extends FieldBase { type: "segmented"; options: Option[]; default: number | string }
export interface SelectField extends FieldBase { type: "select"; options: Option[]; default: string }
export type Field = SliderField | NumberFieldDef | SegmentedField | SelectField;

export type OutputType = "binary-classification" | "multiclass-classification" | "classification + regression";

export interface ModelDef {
  id: string;
  index: number;
  name: string;
  short: string;
  category: string;
  outputType: OutputType;
  primaryHead: string;
  fields: Field[];
  disclaimer?: string;
}

export interface ProbabilityRow { label: string; value: number }
export interface Stat { label: string; value: string }
export type Level = "low" | "mid" | "high" | "extreme";
export interface ImpactItem { name: string; label: string; share: number; level: "HIGH" | "MEDIUM" | "LOW"; direction: "up" | "down" }

export interface PredictionResult {
  headline: string;
  probability: number;
  probabilityLabel: string;
  probabilities: ProbabilityRow[];
  stats: Stat[];
  badge?: { label: string; level: Level };
  message: string;
  recommendation: string;
  featureImportance: ImpactItem[];
  metadata: { modelId: string; version: string; algorithm: string; trainedAt: string };
}

export interface PredictionModel {
  id: string;
  predict(input: RawInput): Promise<PredictionResult>;
}

export interface HeadMeta { algorithm: string; task: string; metrics: Record<string, number>; candidates?: { model: string; val_log_loss: number; val_accuracy: number }[] }
export interface ModelMetadata {
  id: string; name: string; version: string; trained_at: string; seed: number; n_samples: number;
  splits: { train: number; val: number; test: number };
  heads: Record<string, HeadMeta>;
  feature_importance: { feature: string; importance: number }[];
  limitations: string[];
  dataset: { source: string; generator: string; rows: number };
  export_relative_error: Record<string, number>;
}
