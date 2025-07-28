import React from "react";
import { renderHook, act } from "@testing-library/react-hooks";
import { useFormChainEffectEngine } from "./useFormChainEffectEngine";
import { Form } from "antd";

function useTestForm() {
  const [form] = Form.useForm();
  return form;
}

describe("useFormChainEffectEngine", () => {
  it("should trigger chain effect for dependents", () => {
    const { result: formResult } = renderHook(() => useTestForm());
    const form = formResult.current;
    form.getFieldValue = jest.fn((field) => {
      if (field === "A") return 1;
      if (field === "B") return 2;
      return undefined;
    });
    form.getFieldsValue = jest.fn(() => ({ A: 1, B: 2 }));
    const effectA = jest.fn();
    const effectB = jest.fn();
    const config = {
      A: { dependents: ["B"], effect: effectA },
      B: { effect: effectB },
    };
    const { result } = renderHook(() =>
      useFormChainEffectEngine({ form, config }),
    );
    act(() => {
      result.current.onValuesChange({ A: 1 });
    });
    expect(effectA).toHaveBeenCalledWith(
      1,
      { A: 1, B: 2 },
      expect.any(Object),
      expect.any(Object),
    );
    expect(effectB).toHaveBeenCalled();
  });

  it("should support manualTrigger", () => {
    const { result: formResult } = renderHook(() => useTestForm());
    const form = formResult.current;
    const effectA = jest.fn();
    const config = {
      A: { effect: effectA },
    };
    const { result } = renderHook(() =>
      useFormChainEffectEngine({ form, config }),
    );
    act(() => {
      result.current.manualTrigger("A", 123);
    });
    expect(effectA).toHaveBeenCalledWith(
      123,
      expect.any(Object),
      expect.any(Object),
      expect.any(Object),
    );
  });

  it("should not throw if effect is missing", () => {
    const { result: formResult } = renderHook(() => useTestForm());
    const form = formResult.current;
    form.getFieldValue = jest.fn(() => 1);
    form.getFieldsValue = jest.fn(() => ({ A: 1 }));
    const config = {
      A: { dependents: ["B"] },
      B: {},
    };
    const { result } = renderHook(() =>
      useFormChainEffectEngine({ form, config }),
    );
    expect(() => {
      act(() => {
        result.current.onValuesChange({ A: 1 });
      });
    }).not.toThrow();
  });

  it("should not throw if dependents is empty", () => {
    const { result: formResult } = renderHook(() => useTestForm());
    const form = formResult.current;
    form.getFieldValue = jest.fn(() => 1);
    form.getFieldsValue = jest.fn(() => ({ A: 1 }));
    const config = {
      A: { dependents: [], effect: jest.fn() },
    };
    const { result } = renderHook(() =>
      useFormChainEffectEngine({ form, config }),
    );
    expect(() => {
      act(() => {
        result.current.onValuesChange({ A: 1 });
      });
    }).not.toThrow();
  });

  it("should not throw if field not in config", () => {
    const { result: formResult } = renderHook(() => useTestForm());
    const form = formResult.current;
    form.getFieldValue = jest.fn(() => 1);
    form.getFieldsValue = jest.fn(() => ({ A: 1 }));
    const config = {
      A: { effect: jest.fn() },
    };
    const { result } = renderHook(() =>
      useFormChainEffectEngine({ form, config }),
    );
    expect(() => {
      act(() => {
        result.current.onValuesChange({ B: 1 });
      });
    }).not.toThrow();
  });

  it("should stop chain when chain.stop is called (advanced)", () => {
    const { result: formResult } = renderHook(() => useTestForm());
    const form = formResult.current;
    form.getFieldValue = jest.fn((field) => {
      if (field === "A") return 1;
      if (field === "B") return 2;
      return undefined;
    });
    form.getFieldsValue = jest.fn(() => ({ A: 1, B: 2 }));
    const effectA = jest.fn((val, all, chain) => {
      chain.stop && chain.stop();
    });
    const effectB = jest.fn();
    const config = {
      A: { dependents: ["B"], effect: effectA },
      B: { effect: effectB },
    };
    const { result } = renderHook(() =>
      useFormChainEffectEngine({
        form,
        config,
        options: { enableAdvancedControl: true },
      }),
    );
    act(() => {
      result.current.onValuesChange({ A: 1 });
    });
    expect(effectA).toHaveBeenCalled();
    expect(effectB).not.toHaveBeenCalled();
  });

  it("should prevent infinite loop on circular dependency", () => {
    const { result: formResult } = renderHook(() => useTestForm());
    const form = formResult.current;
    form.getFieldValue = jest.fn(() => 1);
    form.getFieldsValue = jest.fn(() => ({ A: 1, B: 1 }));
    const effectA = jest.fn();
    const effectB = jest.fn();
    const config = {
      A: { dependents: ["B"], effect: effectA },
      B: { dependents: ["A"], effect: effectB },
    };
    const { result } = renderHook(() =>
      useFormChainEffectEngine({ form, config }),
    );
    expect(() => {
      act(() => {
        result.current.onValuesChange({ A: 1 });
      });
    }).not.toThrow();
    expect(effectA).toHaveBeenCalled();
    expect(effectB).toHaveBeenCalled();
    // 不会死循环
    expect(effectA.mock.calls.length).toBe(1);
    expect(effectB.mock.calls.length).toBe(1);
  });

  it("should log warning on circular dependency if debugLog enabled", () => {
    const { result: formResult } = renderHook(() => useTestForm());
    const form = formResult.current;
    form.getFieldValue = jest.fn(() => 1);
    form.getFieldsValue = jest.fn(() => ({ A: 1, B: 1 }));
    const effectA = jest.fn();
    const effectB = jest.fn();
    const config = {
      A: { dependents: ["B"], effect: effectA },
      B: { dependents: ["A"], effect: effectB },
    };
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderHook(() =>
      useFormChainEffectEngine({
        form,
        config,
        options: { debugLog: true },
      }),
    );
    act(() => {
      result.current.onValuesChange({ A: 1 });
    });
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("should log effect error if effect throws", () => {
    const { result: formResult } = renderHook(() => useTestForm());
    const form = formResult.current;
    form.getFieldValue = jest.fn(() => 1);
    form.getFieldsValue = jest.fn(() => ({ A: 1 }));
    const errorEffect = jest.fn(() => {
      throw new Error("effect error");
    });
    const config = {
      A: { effect: errorEffect },
    };
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() =>
      useFormChainEffectEngine({ form, config }),
    );
    act(() => {
      result.current.onValuesChange({ A: 1 });
    });
    expect(errorEffect).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("should return early if visited.has(field)", () => {
    const { result: formResult } = renderHook(() => useTestForm());
    const form = formResult.current;
    form.getFieldValue = jest.fn(() => 1);
    form.getFieldsValue = jest.fn(() => ({ A: 1 }));
    const effectA = jest.fn();
    const config = {
      A: { dependents: ["A"], effect: effectA },
    };
    const { result } = renderHook(() =>
      useFormChainEffectEngine({ form, config }),
    );
    act(() => {
      result.current.onValuesChange({ A: 1 });
    });
    // 只会调用一次，不会死循环
    expect(effectA.mock.calls.length).toBe(1);
  });

  it("should call onEffectResult when effect returns a value", () => {
    const { result: formResult } = renderHook(() => useTestForm());
    const form = formResult.current;
    form.getFieldValue = jest.fn(() => 1);
    form.getFieldsValue = jest.fn(() => ({ A: 1 }));
    const effectA = jest.fn(() => ({ success: true, message: "A changed" }));
    const onEffectResult = jest.fn();
    const config = {
      A: { effect: effectA },
    };
    const { result } = renderHook(() =>
      useFormChainEffectEngine({ form, config, onEffectResult }),
    );
    act(() => {
      result.current.onValuesChange({ A: 1 });
    });
    expect(effectA).toHaveBeenCalled();
    expect(onEffectResult).toHaveBeenCalledWith({
      fieldName: "A",
      field: { effect: effectA },
      result: { success: true, message: "A changed" },
      chain: expect.any(Object),
      currentVal: 1,
      allValues: { A: 1 },
    });
  });

  it("should not call onEffectResult when effect returns undefined", () => {
    const { result: formResult } = renderHook(() => useTestForm());
    const form = formResult.current;
    form.getFieldValue = jest.fn(() => 1);
    form.getFieldsValue = jest.fn(() => ({ A: 1 }));
    const effectA = jest.fn(() => undefined);
    const onEffectResult = jest.fn();
    const config = {
      A: { effect: effectA },
    };
    const { result } = renderHook(() =>
      useFormChainEffectEngine({ form, config, onEffectResult }),
    );
    act(() => {
      result.current.onValuesChange({ A: 1 });
    });
    expect(effectA).toHaveBeenCalled();
    expect(onEffectResult).not.toHaveBeenCalled();
  });

  it("should not call onEffectResult when onEffectResult is not provided", () => {
    const { result: formResult } = renderHook(() => useTestForm());
    const form = formResult.current;
    form.getFieldValue = jest.fn(() => 1);
    form.getFieldsValue = jest.fn(() => ({ A: 1 }));
    const effectA = jest.fn(() => ({ success: true }));
    const config = {
      A: { effect: effectA },
    };
    const { result } = renderHook(() =>
      useFormChainEffectEngine({ form, config }),
    );
    act(() => {
      result.current.onValuesChange({ A: 1 });
    });
    expect(effectA).toHaveBeenCalled();
    // 没有传入 onEffectResult，所以不会调用
  });

  it("should handle async effect with onEffectResult", async () => {
    const { result: formResult } = renderHook(() => useTestForm());
    const form = formResult.current;
    form.getFieldValue = jest.fn(() => 1);
    form.getFieldsValue = jest.fn(() => ({ A: 1 }));
    const asyncEffect = jest.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { async: true, data: "async result" };
    });
    const onEffectResult = jest.fn();
    const config = {
      A: { effect: asyncEffect },
    };
    const { result } = renderHook(() =>
      useFormChainEffectEngine({ form, config, onEffectResult }),
    );
    act(() => {
      result.current.onValuesChange({ A: 1 });
    });
    // 等待异步 effect 完成
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(asyncEffect).toHaveBeenCalled();
    expect(onEffectResult).toHaveBeenCalledWith({
      fieldName: "A",
      field: { effect: asyncEffect },
      result: { async: true, data: "async result" },
      chain: expect.any(Object),
      currentVal: 1,
      allValues: { A: 1 },
    });
  });
});
