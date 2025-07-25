import { useCallback } from 'react';
import type { FormInstance } from 'antd/lib/form';
import type {
  Chain,
  FormChainEffectMap,
  TriggerFn,
  UseFormChainEffectEngineOptions,
} from '../types/types';


function createChain(source: string, enableAdvanced: boolean, triggerFn: TriggerFn): Chain {
  const chain: Chain = {
    source,
    path: [source],
  };
  if (enableAdvanced) {
    chain.isStopped = false;
    chain.stop = () => {
      chain.isStopped = true;
    };
  }
  return chain;
}

function extendChain(chain: Chain, nextField: string): Chain {
  return {
    ...chain,
    path: [...chain.path, nextField],
  };
}

// =============核心 Hook=============
export function useFormChainEffectEngine(
  form: FormInstance,
  config: FormChainEffectMap,
  options: UseFormChainEffectEngineOptions = {}
) {
  const enableAdvanced = options.enableAdvancedControl ?? false;
  const debugLog = options.debugLog ?? false;
  const effectActions = options.effectActions ?? {};

  const trigger = useCallback(
    (field: string, chain: Chain, visited: Set<string>, overrideValue?: any) => {
      if (visited.has(field)) {
        if (debugLog) {
          console.warn(
            `[form-chain-effect-engine] 检测到循环依赖，链路已终止: ${[...chain.path, field].join(' → ')}`
          );
        }
        return;
      }
      visited.add(field);

      const item = config[field];
      if (!item) return;

      const currentVal = overrideValue !== undefined ? overrideValue : form.getFieldValue(field);
      const allValues = form.getFieldsValue();

      if (debugLog) {
        console.log(
          `[form-chain-effect-engine] 触发 effect: ${field}, 当前值:`,
          currentVal,
          ', 链路:',
          chain.path
        );
      }

      if (item.effect) {
        try {
          item.effect(currentVal, allValues, chain, effectActions);
        } catch (err) {
          console.error(`[form-chain-effect-engine] effect 执行异常: 字段 ${field}, 错误:`, err);
        }
      }

      if (enableAdvanced && chain.isStopped) return;

      if (item.dependents && item.dependents.length > 0) {
        for (const dep of item.dependents) {
          trigger(dep, extendChain(chain, dep), visited);
        }
      }
    },
    [form, config, enableAdvanced, debugLog, effectActions]
  );

  const onValuesChange = useCallback(
    (changed: Record<string, any>) => {
      const visited = new Set<string>();
      const changedKey = Object.keys(changed)[0];
      if (!changedKey) return;
      trigger(changedKey, createChain(changedKey, enableAdvanced, trigger), visited);
    },
    [trigger, enableAdvanced]
  );

  const manualTrigger = useCallback(
    (field: string, value: any) => {
      const visited = new Set<string>();
      const chain = createChain(field, enableAdvanced, trigger);
      trigger(field, chain, visited, value);
    },
    [trigger, enableAdvanced]
  );

  return {
    onValuesChange,
    manualTrigger,
  };
}
