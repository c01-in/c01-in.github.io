# Flutter 状态管理机制理解与对比：从 Compose / React 到 Riverpod

最近在开发 Flutter 项目过程中，我对状态管理结构产生了几点疑问，主要包括：

- 为什么副作用监听通常写在 UI 层？
- Flutter 的状态管理和 Jetpack Compose / React 有哪些本质区别？
- 各种主流 Flutter 状态管理框架的设计理念和使用方式？
- 怎样写出职责清晰、结构合理的 Flutter 状态代码？

这篇笔记总结我的理解和查阅的一些资料。

---

## 🧠 Flutter 状态管理的核心分层

Flutter（尤其是使用 Riverpod 等现代框架）状态管理系统可以简要拆解为以下几个层：

| 模块 | 职责 |
|------|------|
| **UI Widget** | 渲染视图、接收用户操作、监听状态变化 |
| **State Provider** | 管理业务状态（如当前 step、播放状态等） |
| **副作用监听** | 监听状态变化后触发行为（如倒计时、跳转页面） |
| **Service / Controller (可选)** | 聚合调用逻辑、解耦 UI 和状态切换（类似 ViewModel） |

而 Flutter 的状态监听通常通过 `ref.listen`（Riverpod）或 `BlocListener`（Bloc）写在 UI 层，而非状态控制器内部。

---

## 🔄 和 Jetpack Compose / React 的区别

| 特性 | Jetpack Compose (Kotlin) / React (JS) | Flutter |
|------|----------------------------------------|---------|
| 状态来源 | `ViewModel` / `useState` / `useReducer` | Provider / Riverpod 等 |
| 状态监听方式 | 自动响应 + `LaunchedEffect` / useEffect | 显式 `ref.listen` / BlocListener |
| 副作用管理 | `viewModelScope.launch {}` / useEffect | UI 组件中显式注册 |
| 状态发起 | ViewModel 调度一切 | 多由 UI 主动发起，例如 `ref.read(...).next()` |
| 推荐模式 | ViewModel 主导，UI 被动 | UI 中组合小 Provider，逻辑分散 |

---

## 🧪 示例对比：倒计时自动播放

### Jetpack Compose 版本
```kotlin
val viewModel: TrainingViewModel = hiltViewModel()
val currentStep by viewModel.currentStep.collectAsState()

LaunchedEffect(currentStep.id) {
    viewModel.startCountdown(currentStep.duration)
}
```
逻辑集中在 ViewModel 中，UI 自动响应。

### Flutter + Riverpod 版本
```dart
ref.listen(trainingControllerProvider, (prev, next) {
  if (prev?.currentStep?.id != next.currentStep?.id && next.currentStep != null) {
    ref.read(countdownTimerProvider.notifier)
      ..reset()
      ..start();
  }
});
```
监听逻辑需由 UI 层明确声明。

---

## 📦 主流 Flutter 状态管理框架比较

| 框架 | 特点 | 是否推荐副作用写在 UI 层 |
|------|------|---------------------------|
| **Riverpod** | 推荐组合式 Provider，最灵活 | ✅ 是，使用 `ref.listen()` |
| **Bloc** | 明确事件-状态流，规范强 | ✅ 是，使用 `BlocListener` |
| **Provider** | 入门简单，灵活性一般 | ✅ 是，使用 `Consumer` 绑定 |
| **GetX** | API 简洁，全局状态为主 | ✅ 是，使用 `.listen()` / `Obx` |
| **MobX** | 响应式、数据驱动 | ✅ 是，使用 `Observer` |
| **Redux** | 类似 React Redux，纯函数 reducer | ❌ 不建议写副作用在 UI，使用 middleware |
| **States_rebuilder** | 注重状态切换效率 | ✅ 是，支持 `.onSetState()` 等回调 |

---

## ♻️ 如果想实现 MVVM 风格怎么办？

虽然 Flutter 没有 ViewModel 概念，但可以手动实现类似结构：

```dart
class TrainingService {
  final Ref ref;

  TrainingService(this.ref);

  void nextStepAndPlay() {
    final controller = ref.read(trainingControllerProvider.notifier);
    controller.nextStep();

    final timer = ref.read(countdownTimerProvider.notifier);
    timer.reset();
    timer.start();
  }
}
```
然后 UI 中只调用：
```dart
ref.read(trainingServiceProvider).nextStepAndPlay();
```
这样结构就更像 Kotlin / React 的服务分发逻辑了。

---

## ✅ 总结：Flutter 的状态管理哲学

- Flutter 提倡组合小的 Provider 单元，让 UI 自行组合监听
- 副作用如导航、倒计时、弹窗通常由 UI 层监听触发
- 如果更习惯 MVVM，可封装 service 层协调 Provider
- Riverpod 提供了强大但不强制的工具，适合构建可测试、结构清晰的项目

---

我最终决定采用 Flutter 的主流方式：  
**controller 负责状态，UI 监听状态变化并触发副作用。**  
如果以后需要支持更复杂的自动逻辑，可以引入 `TrainingService` 做中间协调器，逐步演进。

