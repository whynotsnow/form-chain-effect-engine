# Changelog

## [2.0.1] - 2024-12-19

### 🚀 新增功能

- **类型扩展性增强**: `FormChainEffectMap` 和 `EffectConfig` 类型现在支持扩展任意自定义属性
  - 通过 `& Record<string, any>` 提供更好的类型灵活性
  - 允许在配置对象中添加自定义属性而不报错

### 🔧 改进

- **自动化发布流程优化**: 更新 GitHub Actions 触发条件
  - 修改为只在推送 tag 或创建 Release 时触发自动发包
  - 避免忘记更新版本号时意外发包
  - 提高发布流程的安全性和可控性

### 📚 文档更新

- **发布指南完善**: 更新 `docs/PUBLISH_GUIDE.md`
  - 详细说明单分支（master）自动化发布流程
  - 添加常见问题解答（FAQ）
  - 明确 tag 推送和 Release 创建的触发机制

### 🛠️ 开发工具

- **代码格式化配置**: 完善 Prettier 和 ESLint 配置
  - 解决格式化冲突问题
  - 统一代码风格（双引号、尾随逗号、箭头函数括号）
  - 添加自动格式化 npm 脚本

### 🔒 安全性

- **发布流程安全**: 防止意外发包
  - 只有明确创建 tag 才会触发自动发包
  - 确保每次发布都有对应的版本号

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
