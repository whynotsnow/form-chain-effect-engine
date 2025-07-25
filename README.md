<p align="right">
  🌐 Language | <a href="#简体中文说明">简体中文</a> | <a href="#english-documentation">English</a>
</p>

# form-chain-effect-engine

[![Open in CodeSandbox](https://img.shields.io/badge/CodeSandbox-Demo-blue?logo=codesandbox)](https://codesandbox.io/p/sandbox/s6v4f5)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-black?logo=github)](https://github.com/whynotsnow/form-chain-effect-engine)

> ⚙️ 基于 React 和 Ant Design Form 的表单依赖链副作用引擎  
> [🇺🇸 English Guide see below ⬇](#english-documentation)

---

## 📘 简体中文说明

基于 React 和 Ant Design Form 的表单依赖链副作用引擎，支持字段间依赖关系的链式 effect 自动触发，适用于复杂表单联动、依赖变更场景。

### ✨ 功能特性

- 🔁 **链式依赖副作用**：字段 A 变更自动触发 B、C 等依赖字段，递归联动。
- 🛡️ **循环依赖防护**：自动检测并阻止循环依赖，防止死循环。
- 🧠 **高级链路控制**：支持链路中断（如 stop）等复杂逻辑。
- 🔡 **类型安全**：完整 TypeScript 支持，开发体验良好。
- 🧷 **手动触发**：提供手动触发机制以应对动态需求。

### 📦 安装

```bash
npm install form-chain-effect-engine
```

---

## 🧩 API 说明

### `useFormChainEffectEngine`

```ts
import { useFormChainEffectEngine } from "form-chain-effect-engine";
```

#### 参数

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
  可选，是否启用高级链路控制（如 stop），是否开启 debugLog 日志，effectActions 扩展等。

#### options 详细说明

- `enableAdvancedControl?: boolean` 是否启用链路中断等高级控制
- `debugLog?: boolean` 是否开启调试日志，开启后会在控制台输出 effect 触发、循环依赖等调试信息
- `effectActions?: Record<string, any>` 注入 effect 的扩展方法

#### debugLog 用法示例

```ts
const { onValuesChange } = useFormChainEffectEngine(form, config, {
  debugLog: true,
});
// 控制台会输出 effect 触发、循环依赖等调试信息
```

#### 返回

- `onValuesChange: (changed: Record<string, any>) => void`  
  传递给 Form 的 `onValuesChange`，自动处理依赖链 effect。
- `manualTrigger: (field: string, value: any) => void`  
  手动触发某字段的副作用链。

### effectActions 扩展

`effectActions` 是 effect 的第四个参数，用于注入自定义的扩展方法（如 setGroupMeta、dispatch 等）。你可以在 useFormChainEffectEngine 的 options 里传入 effectActions，并在 effect 里使用。

#### 类型定义（支持泛型自定义）

```ts
export type EffectFn<EA = Record<string, any>> = (
  changedValue: any,
  allValues: Record<string, any>,
  chain: Chain,
  effectActions?: EA
) => void;
```

#### 用法示例

```ts
const effectActions = {
  setGroupMeta: (meta) => {
    /* ... */
  },
  dispatch: (action) => {
    /* ... */
  },
};

const config = {
  A: {
    effect: (val, all, chain, actions) => {
      actions?.setGroupMeta?.({ key: val });
      actions?.dispatch?.({ type: "A_CHANGED", payload: val });
    },
  },
};

const { onValuesChange } = useFormChainEffectEngine(form, config, {
  effectActions,
});
```

---

## 📄 使用示例

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

## 🚀 高级用法

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

## 📚 类型定义

详见 `src/types/types.ts`，主要类型包括：

- `FormChainEffectMap`
- `Chain`
- `EffectFn`
- `UseFormChainEffectEngineOptions`

---

## 📌 适用场景

- 多字段联动、复杂依赖表单
- 级联 effect、自动数据流转
- 需要链式副作用、链路中断的表单逻辑

---

如需更多示例或有问题欢迎提 issue 🙌

---

## 📘 English Documentation

> [点击跳转至中文说明 ⬆](#简体中文说明)

A dependency chain effect engine for React and Ant Design Form. Supports chain-triggered effects between fields, ideal for complex form linkage and dependency scenarios.

### ✨ Features

- 🔁 **Chain Dependency Effects**: When field A changes, automatically trigger effects for dependent fields B, C, etc., recursively.
- 🛡️ **Cycle Protection**: Automatically detects and prevents cyclic dependencies.
- 🧠 **Advanced Chain Control**: Optionally enable chain interruption (stop) and more.
- 🔡 **Type Safety**: Full TypeScript support for a great developer experience.
- 🧷 **Manual Trigger**: Supports manual effect triggering for custom scenarios.

### 📦 Installation

```bash
npm install form-chain-effect-engine
```

---

## 🧩 API

### `useFormChainEffectEngine`

```ts
import { useFormChainEffectEngine } from "form-chain-effect-engine";
```

**Parameters**

- `form: FormInstance` – The Ant Design Form instance.
- `config: FormChainEffectMap` – Dependency and effect configuration:

  ```ts
  interface FormChainEffectMap {
    [field: string]: {
      dependents?: string[];
      effect?: (
        changedValue: any,
        allValues: Record<string, any>,
        chain: Chain
      ) => void;
    };
  }
  ```

- `options?: UseFormChainEffectEngineOptions` – Optional: enable advanced chain controls like stop.

**Returns**

- `onValuesChange: (changed: Record<string, any>) => void` – Pass into `Form`'s `onValuesChange` to auto-handle effect chains.
- `manualTrigger: (field: string, value: any) => void` – Manually trigger a field's effect chain.

### effectActions 扩展

`effectActions` 是 effect 的第四个参数，用于注入自定义的扩展方法（如 setGroupMeta、dispatch 等）。你可以在 useFormChainEffectEngine 的 options 里传入 effectActions，并在 effect 里使用。

#### 类型定义（支持泛型自定义）

```ts
export type EffectFn<EA = Record<string, any>> = (
  changedValue: any,
  allValues: Record<string, any>,
  chain: Chain,
  effectActions?: EA
) => void;
```

#### 用法示例

```ts
const effectActions = {
  setGroupMeta: (meta) => {
    /* ... */
  },
  dispatch: (action) => {
    /* ... */
  },
};

const config = {
  A: {
    effect: (val, all, chain, actions) => {
      actions?.setGroupMeta?.({ key: val });
      actions?.dispatch?.({ type: "A_CHANGED", payload: val });
    },
  },
};

const { onValuesChange } = useFormChainEffectEngine(form, config, {
  effectActions,
});
```

---

## 📄 Example

```tsx
import React from "react";
import { Form, Input } from "antd";
import { useFormChainEffectEngine } from "form-chain-effect-engine";

const config = {
  A: {
    dependents: ["B"],
    effect: (val, all, chain) => {
      console.log("A changed:", val);
    },
  },
  B: {
    dependents: ["C"],
    effect: (val, all, chain) => {
      console.log("B changed:", val);
    },
  },
  C: {
    effect: (val, all, chain) => {
      console.log("C changed:", val);
    },
  },
};

export default function DemoForm() {
  const [form] = Form.useForm();
  const { onValuesChange } = useFormChainEffectEngine(form, config);

  return (
    <Form form={form} onValuesChange={onValuesChange}>
      <Form.Item name="A" label="Field A">
        <Input />
      </Form.Item>
      <Form.Item name="B" label="Field B">
        <Input />
      </Form.Item>
      <Form.Item name="C" label="Field C">
        <Input />
      </Form.Item>
    </Form>
  );
}
```

---

## 🚀 Advanced Usage

Enable chain interruption (e.g., conditionally stop further execution):

```ts
const config = {
  A: {
    dependents: ["B"],
    effect: (val, all, chain) => {
      if (val === "stop") {
        chain.stop?.();
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

## 📚 Types

Main types available in `src/types/types.ts`:

- `FormChainEffectMap`
- `Chain`
- `EffectFn`
- `UseFormChainEffectEngineOptions`

---

## 📌 Scenarios

- Complex multi-field dependency forms
- Cascading effects between fields
- Advanced chain interruption and custom logic

---

Have questions or suggestions? Feel free to open an issue 💬
