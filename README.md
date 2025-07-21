# form-chain-effect-engine

[![Open in CodeSandbox](https://img.shields.io/badge/CodeSandbox-Demo-blue?logo=codesandbox)](https://codesandbox.io/s/new)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-black?logo=github)](https://github.com/your-username/form-chain-effect-engine)

> [中文文档请见 README.zh-CN.md](./README.zh-CN.md)

A dependency chain effect engine for React and Ant Design Form. Supports chain-triggered effects between fields, ideal for complex form linkage and dependency scenarios.

## Features

- **Chain Dependency Effects**: When field A changes, automatically trigger effects for dependent fields B, C, etc., recursively.
- **Cycle Protection**: Automatically detects and prevents cyclic dependencies.
- **Advanced Chain Control**: Optionally enable chain interruption (stop) and more.
- **Type Safety**: Full TypeScript support for a great developer experience.
- **Manual Trigger**: Supports manual effect triggering for custom scenarios.

## Installation

```bash
npm install form-chain-effect-engine
```

## API

### useFormChainEffectEngine

```ts
import { useFormChainEffectEngine } from "form-chain-effect-engine";
```

**Parameters**

- `form: FormInstance`  
  The Ant Design Form instance.
- `config: FormChainEffectMap`  
  Dependency and effect configuration for fields:

  ```ts
  interface FormChainEffectMap {
    [field: string]: {
      dependents?: string[]; // Downstream dependent fields
      effect?: (
        changedValue: any,
        allValues: Record<string, any>,
        chain: Chain
      ) => void; // Effect function
    };
  }
  ```

- `options?: UseFormChainEffectEngineOptions`  
  Optional, enable advanced chain control (e.g., stop).

**Returns**

- `onValuesChange: (changed: Record<string, any>) => void`  
  Pass to Form's `onValuesChange` to handle chain effects automatically.
- `manualTrigger: (field: string, value: any) => void`  
  Manually trigger the effect chain for a field.

---

### Example

```tsx
import React from "react";
import { Form, Input } from "antd";
import { useFormChainEffectEngine } from "form-chain-effect-engine";

const config = {
  A: {
    dependents: ["B"],
    effect: (val, all, chain) => {
      // When A changes, automatically trigger B
      console.log("A changed:", val);
    },
  },
  B: {
    dependents: ["C"],
    effect: (val, all, chain) => {
      // When B changes, automatically trigger C
      console.log("B changed:", val);
    },
  },
  C: {
    effect: (val, all, chain) => {
      // When C changes
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

### Advanced Usage

Enable chain interruption (e.g., stop further effects if a condition is met):

```ts
const config = {
  A: {
    dependents: ["B"],
    effect: (val, all, chain) => {
      if (val === "stop") {
        chain.stop?.(); // Stop the chain
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

### Types

See `src/types/types.ts` for details. Main types:

- `FormChainEffectMap`
- `Chain`
- `EffectFn`
- `UseFormChainEffectEngineOptions`

---

### Scenarios

- Multi-field linkage, complex dependency forms
- Cascading effects, automatic data flow
- Chain effects and interruption in form logic

---

For more examples or questions, please open an issue!
