# Changelog

## [2.0.0] - 2024-07-27

### Added

- 新增 onEffectResult 参数，提供监控 effect 调用和消费 effect 返回值的能力，更优雅地处理 effect 中的 UI 事件和业务逻辑。
- 支持异步 effect 的返回值处理。
- 完善 onEffectResult 相关的测试用例，覆盖同步、异步、边界场景。

### Changed

- **API 重构**：useFormChainEffectEngine 改为统一配置对象方式，提升 API 设计的一致性和扩展性。
- **错误处理增强**：添加了更完善的参数验证和错误处理，包括字段名称验证、表单值获取异常处理、回调函数异常处理等。
- **调试信息优化**：增加了更详细的调试日志，便于问题排查和开发调试。
- README.md 补充 onEffectResult 参数说明和用法示例，更新所有示例代码为新的 API 格式。

### Breaking Changes

- useFormChainEffectEngine 函数签名变更：从多参数改为统一配置对象
- 旧版本调用方式不再支持，需要更新为新的对象参数格式

## [1.0.2] - 2024-07-25

### Changed

- 新增 debugLog 参数，支持 effect 触发、循环依赖等调试日志输出。
- effectActions 类型定义支持泛型自定义，提升类型安全和开发体验。
- README.md 补充 effectActions 用法和类型说明，补充 debugLog 参数说明。

## [1.0.1] - 2024-07-21

### Added

- 自动生成类型声明文件（index.d.ts），提升 TypeScript 支持。
- 增加边界场景和异常处理的自动化测试用例，测试覆盖率达 97%+。
- prepublishOnly 钩子，防止未构建或测试未通过时误发包。

### Changed

- 优化 package.json，完善 author、repository、sideEffects 等字段。
- build 流程支持类型声明生成，确保 dist/ 下产物完整。
- README.md 英文文档完善，支持 CodeSandbox 在线体验入口。

### Fixed

- 修复未生成类型声明文件的问题。
- 修复测试用例中的 hooks 调用错误。

## [1.0.0] - 2024-07-20

- 首次发布 form-chain-effect-engine
