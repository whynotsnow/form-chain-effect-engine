import { FormInstance } from "antd";

export interface Chain {
  source: string;
  path: string[];
  // 状态字段可选（在 createChain 中逐步赋值）
  isStopped?: boolean;
  isSkipped?: boolean;
  redirectTarget?: string;

  // 高级控制 API 可选（在 enableAdvancedControl = true 时赋值）
  stop?: () => void;
  // 以下未实现
  // skip?: () => void;
  // redirect?: (target: string) => void;

  // 下面是你动态赋值的内部方法，声明为可选
  stopPropagation?: () => void;
  // skipEffect?: () => void;
  // redirectTo?: (field: string) => void;
}

export type EffectFn<EA = Record<string, any>> = (
  changedValue: any,
  allValues: Record<string, any>,
  chain: Chain,
  effectActions?: EA,
) => void;

export type EffectConfig<EA> = {
  dependents?: string[];
  effect?: EffectFn<EA>;
} & Record<string, any>;

export interface FormChainEffectMap<EA = Record<string, any>> {
  [field: string]: EffectConfig<EA>;
}

export interface UseFormChainEffectEngineOptions<EA = Record<string, any>> {
  enableAdvancedControl?: boolean;
  debugLog?: boolean;
  effectActions?: EA;
}

export interface ChainControllerOptions {
  enableAdvancedControl: boolean;
  trigger: (field: string, chain: Chain, visited: Set<string>) => void;
}

export type TriggerFn = (
  field: string,
  chain: Chain,
  visited: Set<string>,
  overrideValue?: any,
) => void;

export interface UseFormChainEffectEngineConfig {
  form: FormInstance;
  config: FormChainEffectMap;
  options?: UseFormChainEffectEngineOptions;
  onEffectResult?: (options: onEffectResultOptions) => void;
}

export interface onEffectResultOptions {
  fieldName: string; // 当前触发 effect 的字段名称
  field: {
    dependents?: string[];
    effect?: EffectFn<Record<string, any>>;
  }; // 完整的字段配置对象
  result: any; // effect 的返回值
  chain: Chain; // 当前的链路信息
  currentVal: any; // 当前字段值
  allValues: Record<string, any>; // 所有表单值
}
