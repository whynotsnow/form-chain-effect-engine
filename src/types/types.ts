import { FormInstance } from 'antd';

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
  effectActions?: EA
) => void;

export interface DependencyConfig<EA = Record<string, any>> {
  dependents?: string[];
  effect?: EffectFn<EA>;
}

export interface FormChainEffectMap<EA = Record<string, any>> {
  [field: string]: {
    dependents?: string[];
    effect?: EffectFn<EA>;
  };
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
  overrideValue?: any
) => void;
