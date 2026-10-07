import type { Outputs, RawInput } from "@/types/model";
export type { Outputs, RawInput };

export interface InputSpec { name: string; kind: "num" | "cat"; lo?: number; hi?: number; enc?: string; values?: string[] }
export interface Column { op: "num" | "log1p" | "sin" | "cos" | "onehot"; src: string; lo?: number; hi?: number; period?: number; value?: string; name: string }
export interface FeaturizerSpec { inputs: InputSpec[]; columns: Column[]; baseline: Record<string, number | string> }

export interface Tree { f: number[]; t: number[]; l: number[]; r: number[]; v: (number | number[])[] }
export interface LinearHead { kind: "linear"; task: "binary" | "multiclass"; classes: string[] | null; mean: number[]; scale: number[]; coef: number[][]; intercept: number[] }
export interface ForestHead { kind: "forest"; task: "binary" | "multiclass" | "regression"; classes: string[] | null; trees: Tree[]; calibration: { x: number[]; y: number[] } | null; target: "raw" | "log" }
export type Head = LinearHead | ForestHead;
export interface ModelFile { schema: 1; id: string; featurizer: FeaturizerSpec; heads: Record<string, Head> }
