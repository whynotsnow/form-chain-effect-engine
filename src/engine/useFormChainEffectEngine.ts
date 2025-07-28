import { useCallback } from "react";
import type {
  Chain,
  TriggerFn,
  UseFormChainEffectEngineConfig,
} from "../types/types";

function createChain(
  source: string,
  enableAdvanced: boolean,
  _triggerFn: TriggerFn,
): Chain {
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
export function useFormChainEffectEngine({
  form,
  config,
  options = {},
  onEffectResult,
}: UseFormChainEffectEngineConfig) {
  const enableAdvanced = options.enableAdvancedControl ?? false;
  const debugLog = options.debugLog ?? false;
  const effectActions = options.effectActions ?? {};

  const trigger = useCallback(
    (
      field: string,
      chain: Chain,
      visited: Set<string>,
      overrideValue?: any,
    ) => {
      // 参数验证
      if (!field || typeof field !== "string") {
        console.error("[form-chain-effect-engine] 无效的字段名称:", field);
        return;
      }

      if (visited.has(field)) {
        if (debugLog) {
          console.warn(
            `[form-chain-effect-engine] 检测到循环依赖，链路已终止: ${[...chain.path, field].join(" → ")}`,
          );
        }
        return;
      }
      visited.add(field);

      const item = config[field];
      if (!item) {
        if (debugLog) {
          console.log(
            `[form-chain-effect-engine] 字段 ${field} 未在配置中找到`,
          );
        }
        return;
      }

      // 安全地获取表单值
      let currentVal: any;
      let allValues: Record<string, any>;

      try {
        currentVal =
          overrideValue !== undefined
            ? overrideValue
            : form.getFieldValue(field);
        allValues = form.getFieldsValue();
      } catch (err) {
        console.error(
          `[form-chain-effect-engine] 获取表单值失败: 字段 ${field}, 错误:`,
          err,
        );
        return;
      }

      if (debugLog) {
        console.log(
          `[form-chain-effect-engine] 触发 effect: ${field}, 当前值:`,
          currentVal,
          ", 链路:",
          chain.path,
        );
      }

      let result: any;

      if (item.effect && typeof item.effect === "function") {
        try {
          result = item.effect(currentVal, allValues, chain, effectActions);
        } catch (err) {
          console.error(
            `[form-chain-effect-engine] effect 执行异常: 字段 ${field}, 错误:`,
            err,
          );
          // 不中断链路，继续执行依赖字段
        }
      }

      if (result) {
        // 处理异步 effect 的返回值
        if (result instanceof Promise) {
          result
            .then((resolvedResult) => {
              if (resolvedResult) {
                try {
                  onEffectResult?.({
                    fieldName: field,
                    field: item,
                    result: resolvedResult,
                    chain,
                    currentVal,
                    allValues,
                  });
                } catch (err) {
                  console.error(
                    `[form-chain-effect-engine] onEffectResult 回调执行异常: 字段 ${field}, 错误:`,
                    err,
                  );
                }
              }
            })
            .catch((err) => {
              console.error(
                `[form-chain-effect-engine] 异步 effect 执行异常: 字段 ${field}, 错误:`,
                err,
              );
            });
        } else {
          try {
            onEffectResult?.({
              fieldName: field,
              field: item,
              result,
              chain,
              currentVal,
              allValues,
            });
          } catch (err) {
            console.error(
              `[form-chain-effect-engine] onEffectResult 回调执行异常: 字段 ${field}, 错误:`,
              err,
            );
          }
        }
      }

      if (enableAdvanced && chain.isStopped) {
        if (debugLog) {
          console.log(`[form-chain-effect-engine] 链路已停止: ${field}`);
        }
        return;
      }

      if (item.dependents && item.dependents.length > 0) {
        for (const dep of item.dependents) {
          // 验证依赖字段名称
          if (!dep || typeof dep !== "string") {
            console.error(
              `[form-chain-effect-engine] 无效的依赖字段名称: ${dep}, 来源字段: ${field}`,
            );
            continue;
          }
          trigger(dep, extendChain(chain, dep), visited);
        }
      }
    },
    [form, config, enableAdvanced, debugLog, effectActions, onEffectResult],
  );

  const onValuesChange = useCallback(
    (changed: Record<string, any>) => {
      if (!changed || typeof changed !== "object") {
        console.error(
          "[form-chain-effect-engine] 无效的 changed 参数:",
          changed,
        );
        return;
      }

      const visited = new Set<string>();
      const changedKeys = Object.keys(changed);
      if (changedKeys.length === 0) {
        if (debugLog) {
          console.log("[form-chain-effect-engine] 没有检测到字段变更");
        }
        return;
      }

      // 只处理第一个变更的字段（保持原有逻辑）
      const changedKey = changedKeys[0];
      trigger(
        changedKey,
        createChain(changedKey, enableAdvanced, trigger),
        visited,
      );
    },
    [trigger, enableAdvanced, debugLog],
  );

  const manualTrigger = useCallback(
    (field: string, value?: any) => {
      if (!field || typeof field !== "string") {
        console.error("[form-chain-effect-engine] 无效的字段名称:", field);
        return;
      }

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
