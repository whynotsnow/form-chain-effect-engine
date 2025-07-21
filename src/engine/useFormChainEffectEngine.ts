import { useCallback } from 'react';
import type { FormInstance } from 'antd/lib/form';
import type { Chain, FormChainEffectMap, UseFormChainEffectEngineOptions } from '../types/types';

type TriggerFn = (field: string, chain: Chain, visited: Set<string>) => void;

function createChain(source: string, enableAdvanced: boolean, triggerFn: TriggerFn): Chain {
  const chain: Chain = {
    source,
    path: [source],
  };

  if (enableAdvanced) {
    chain.isStopped = false;
    // chain.isSkipped = false;

    chain.stop = () => {
      chain.isStopped = true;
    };
    // chain.skip = () => {
    //   chain.isSkipped = true;
    // };
    // chain.redirect = (target: string) => {
    //   chain.redirectTarget = target;
    //   chain.path.push(target);
    //   chain.isStopped = true;
    //   triggerFn(target, chain, new Set(chain.path));
    // };
  }

  return chain;
}

function extendChain(chain: Chain, nextField: string): Chain {
  return {
    ...chain,
    path: [...chain.path, nextField],
  };
}

export function useFormChainEffectEngine(
  form: FormInstance,
  config: FormChainEffectMap,
  options: UseFormChainEffectEngineOptions = {},
) {
  const enableAdvanced = options.enableAdvancedControl ?? false;

  const trigger = useCallback(
    (field: string, chain: Chain, visited: Set<string>, overrideValue?: any) => {
      if (visited.has(field)) return;
      visited.add(field);

      const item = config[field];
      if (!item) return;

      const currentVal = overrideValue !== undefined ? overrideValue : form.getFieldValue(field);
      const allValues = form.getFieldsValue();

      if (item.effect) {
        item.effect(currentVal, allValues, chain);
      }

      // 🛑 检查是否中止链路
      if (enableAdvanced && chain.isStopped) return;

      if (item.dependents && item.dependents.length > 0) {
        for (const dep of item.dependents) {
          trigger(dep, extendChain(chain, dep), visited);
        }
      }
    },
    [form, config, enableAdvanced],
  );

  const onValuesChange = useCallback(
    (changed: Record<string, any>) => {
      const visited = new Set<string>();
      const changedKey = Object.keys(changed)[0];
      if (!changedKey) return;
      trigger(changedKey, createChain(changedKey, enableAdvanced, trigger), visited);
    },
    [trigger, enableAdvanced],
  );

  // 支持手动触发方法
  const manualTrigger = useCallback(
    (field: string, value: any) => {
      const visited = new Set<string>();
      const chain = createChain(field, enableAdvanced, trigger);
      trigger(field, chain, visited, value);
    },
    [trigger, enableAdvanced],
  );

  return {
    onValuesChange,
    manualTrigger,
  };
}
