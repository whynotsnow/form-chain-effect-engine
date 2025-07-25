# Changelog

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
