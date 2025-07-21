# form-chain-effect-engine

[![Open in CodeSandbox](https://img.shields.io/badge/CodeSandbox-Demo-blue?logo=codesandbox)](https://codesandbox.io/s/new)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-black?logo=github)](https://github.com/your-username/form-chain-effect-engine)

> [English Guide see README.md](./README.md)

基于 React 和 Ant Design Form 的表单依赖链副作用引擎，支持字段间依赖关系的链式 effect 自动触发，适用于复杂表单联动、依赖变更场景。

## 功能特性

- **链式依赖副作用**：支持字段 A 变更自动触发 B、C 等依赖字段 effect，递归联动。
- **循环依赖防护**：自动检测并阻止循环依赖，防止死循环。
- **高级链路控制**：可选启用链路中断（stop）等高级控制。
- **类型安全**：TypeScript 全类型定义，开发体验友好。
- **手动触发**：支持手动触发 effect，满足自定义场景。

## 安装

```bash
npm install form-chain-effect-engine
```

## API 说明

### useFormChainEffectEngine

```ts
import { useFormChainEffectEngine } from "form-chain-effect-engine";
```

**参数**

- `form: FormInstance`  
  Ant Design Form 的实例对象。
- `config: FormChainEffectMap`  
  字段依赖与副作用配置，结构如下：

  ```ts
  interface FormChainEffectMap {
    [field: string]: {
      dependents?: string[]; // 依赖的下游字段
      effect?: (
        changedValue: any,
        allValues: Record<string, any>,
        chain: Chain
      ) => void; // 副作用函数
    };
  }
  ```

- `options?: UseFormChainEffectEngineOptions`  
  可选，是否启用高级链路控制（如 stop）。

**返回**

- `onValuesChange: (changed: Record<string, any>) => void`  
  传递给 Form 的 `onValuesChange`，自动处理依赖链 effect。
- `manualTrigger: (field: string, value: any) => void`  
  手动触发某字段的 effect 链。

---

## 使用示例

```tsx
import React from "react";
import { Form, Input } from "antd";
import { useFormChainEffectEngine } from "form-chain-effect-engine";

const config = {
  A: {
    dependents: ["B"],
    effect: (val, all, chain) => {
      // A 变更时，自动触发 B
      console.log("A changed:", val);
    },
  },
  B: {
    dependents: ["C"],
    effect: (val, all, chain) => {
      // B 变更时，自动触发 C
      console.log("B changed:", val);
    },
  },
  C: {
    effect: (val, all, chain) => {
      // C 变更时
      console.log("C changed:", val);
    },
  },
};

export default function DemoForm() {
  const [form] = Form.useForm();
  const { onValuesChange } = useFormChainEffectEngine(form, config);

  return (
    <Form form={form} onValuesChange={onValuesChange}>
      <Form.Item name="A" label="字段A">
        <Input />
      </Form.Item>
      <Form.Item name="B" label="字段B">
        <Input />
      </Form.Item>
      <Form.Item name="C" label="字段C">
        <Input />
      </Form.Item>
    </Form>
  );
}
```

---

## 高级用法

启用链路中断（如某 effect 满足条件时终止后续 effect）：

```ts
const config = {
  A: {
    dependents: ["B"],
    effect: (val, all, chain) => {
      if (val === "stop") {
        chain.stop?.(); // 终止后续链路
      }
    },
  },
  // ...
};

const { onValuesChange } = useFormChainEffectEngine(form, config, {
  enableAdvancedControl: true,
});
```

---

## 类型定义

详见 `src/types/types.ts`，主要类型如下：

- `FormChainEffectMap`
- `Chain`
- `EffectFn`
- `UseFormChainEffectEngineOptions`

---

## 适用场景

- 多字段联动、复杂依赖表单
- 级联 effect、自动数据流转
- 需要链式副作用、链路中断的表单逻辑

---

如需更多示例或有问题欢迎提 issue！
