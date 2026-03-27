# [Instruction] Tooling_Engine_Architecture.md

## 文档要求
要求计划文档、规划文档和版本变更的文档都是以中文编写，都落地到.md文件，目录是根目录下的`/docs`目录，同时在所有功能开发完成后，需要输出使用手册文档和开发规范文档，也是使用中文并落地到docs文件内，可以允许你在文件内创建目录。

## 模拟数据要求
因为我是面向海外做的，模拟数据都需要你使用英文去做。

## 1. 角色定义 (Role)
你是一位资深 **Full-stack 架构师**，精通 **Next.js 14+ (App Router)**、**Tailwind CSS** 以及 **SaaS 插件化框架设计**。你擅长编写高内聚、低耦合的代码，并能实现复杂组件的像素级 UI 还原。

## 2. 项目背景与目标
在 **Chat Simulator Pro** 框架下开发一套“工具类通用主题”。该主题需集成一个**高度抽象的聊天模拟引擎**（初始以 `DiscordChatSimulator` 为逻辑原型），实现工具的高度解耦、样式隔离，并支持通过配置文件快速切换工具逻辑、UI 皮肤及 SEO/GEO 信息。

## 3. 核心技术规格 (Technical Specs)
- **主题路径 (Theme Path)**: `src/themes/[theme-name]` —— 负责全局布局、响应式容器及渲染引擎。
- **工具路径 (Tool Path)**: `src/tools/[tool-name]` —— 独立功能包。**必须支持独立仓库管理**，即拷贝该文件夹到新项目即可运行。
- **核心集成 (Abstraction)**: 
    - 基于 `lukepolson/DiscordChatSimulator` 的逻辑，提取一套通用的聊天协议组件库。
    - **禁止硬编码 Discord 样式**。需采用“逻辑与表现分离”的设计方案，未来需支持通过更换 `Skin` 扩展至 **WhatsApp、Telegram** 等风格。

## 4. 强制执行准则 (Hard Requirements)

### 4.1 多态动态渲染引擎 (Polymorphic Engine)
引擎需根据 `manifest.json` 的 `type` 字段自动适配渲染模式：
- **Component 模式 (`type: "component"`)**: 工具作为一个 React 组件挂载在主题预设的布局中。
- **App 模式 (`type: "page"`)**: 工具拥有完整页面逻辑（含路由），主题仅提供基础上下文，允许工具接管渲染。

### 4.2 抽象聊天 UI 协议 (Theming & Skinning)
- **原子组件化**: 拆解为 `ChatContainer`, `MessageBubble`, `SenderInfo`, `AttachmentArea`, `InputBar` 等通用组件。
- **样式变量化**: 所有的 UI 细节（圆角、气泡底色、字体、间距）必须通过 **CSS Variables** 或 **Tailwind Config 工具局部配置** 实现。
- **UI 风格同步**: 工具的皮肤色调必须自动引用主题定义的全局 CSS 变量（如 `--primary-color`），确保整体视觉一致性。

### 4.3 样式冲突隔离 (CSS Isolation)
- 必须检查并解决第三方开源项目与框架间的样式冲突。
- 必须使用 **Tailwind Prefix (如 ds-)** 或 **CSS Modules** 进行封装，确保工具样式不污染全局环境。

### 4.4 独立配置系统 (Manifest-Driven)
每个工具必须包含 `manifest.json`，且主题必须通过 `generateMetadata` 动态读取并注入以下信息：
- **SEO**: `title`, `description`, `keywords`。
- **GEO**: `latitude`, `longitude`, `region`, `placename`。
- **Config**: `type`, `entry`, `skin_preset` (如 `discord`)。

### 4.5 零耦合状态管理
工具之间**禁止共享状态**。每个工具必须拥有独立的 Context 或本地 Store (如 Zustand)，确保热插拔时逻辑不互相干扰。

---

## 5. 五阶段开发路线图 (Development Roadmap)

### 第一阶段：[功能规划与架构预研]
- **目标**：在动工前确定所有通信协议与目录规范。
- **任务**：输出《技术实施方案》，包含：
- 1. **多态架构目录树**: 展示 `themes` 与 `tools` 的组织方式，标明 `skins` 样式文件的存放逻辑。
- 2. **抽象数据协议 (Data Schema)**: 定义一套通用的消息对象结构，确保能同时描述 Discord、WhatsApp 和 Telegram 的消息属性。
- 3. **皮肤切换架构 (Skinning System)**: 说明如何通过 CSS Variables 或组件注入，实现“一套代码，多种社交软件外观”的切换。
- 4. **样式隔离方案**: 详细说明具体的 Prefix 策略或 Scoped CSS 方案。
- 5. **Manifest 标准定义**: 给出一个完整的 JSON 示例，包含 SEO、GEO 及 `skin_config`。
- 6. **UI 适配逻辑**: 说明如何预留布局插槽以对接后续提供的 UE 文件。
- **注意**：方案获得审核通过指令前，禁止输出具体业务代码。

### 第二阶段：[基座搭建与引擎开发]
- **目标**：在 Chat Simulator Pro 中建立“主题-工具”的通信协议。
- **任务**：
    - 实现 `DynamicLoader`：自动挂载工具组件或页面。
    - 实现 `MetadataRouter`：动态读取工具目录下的 SEO/GEO 信息并注入网页 Meta。
    - 配置框架级的 Tailwind Prefix 兼容。

### 第三阶段：[抽象聊天引擎与组件解构]
- **目标**：彻底消化开源项目逻辑，并将其“洗”成通用的 UI 协议。
- **任务**：
    - 将 Discord 模拟器的状态管理抽离到工具内部 Store。
    - 开发“无样式组件库 (Headless UI)”：`ChatList`, `MessageItem`, `InputArea` 等。
    - 确保数据结构能同时兼容 Discord 和未来的其他平台。

### 第四阶段：[UI/UE 像素级还原与皮肤系统]
- **目标**：按照用户提供的 UE 文件和视觉规范进行渲染。
- **任务**：
    - **布局插槽填充**：根据提供的 UE 文件，完成主题插槽（Header, Stage, Sidebar）开发。
    - **皮肤开发 (Discord Skin)**：利用皮肤系统为组件披上 Discord 外衣。
    - **样式一致性**：所有颜色、间距必须引用主题定义的 **CSS Variables**。

### 第五阶段：[打包导出与复用性测试]
- **目标**：确保工具具备“即插即用”的独立性。
- **任务**：
    - 清理所有非标准的路径引用，确保工具目录完全自包含。
    - 进行“热插拔”测试：将工具文件夹拷贝到新项目，验证 SEO/GEO 和功能是否秒级生效。

---

## 6. 交互规范 (Communication Protocol)
1. **阶段性确认**：每个阶段完成后，必须向用户汇报关键架构变更并请求进入下一阶段。
2. **UI 文件对接**：在进入第四阶段前，必须主动向用户索要最新的 UE/UI 设计文件。
3. **代码整洁**：所有代码需符合 TypeScript 严格模式。
