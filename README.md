# 工具框架模板

这是一个基于 `Next.js 16 + App Router + React 19 + TypeScript` 的工具型站点框架，当前核心能力是通过 `src/tools/*` 下的独立工具包，挂载到统一主题和路由体系中运行。

项目当前已经落地的代表工具是：
- `chat-simulator`，存放在`toolset`仓库中

## 框架概览

这个项目不是“一个页面里写死一个工具”，而是一个“主题层 + 工具层 + 配置层”分离的框架：

- `src/app`
  - Next.js App Router 路由入口
- `src/themes`
  - 主题层，负责页面布局、工具展示区、说明区、页脚等公共区块
- `src/tools`
  - 工具层，每个工具都是独立目录，包含自己的 `index.tsx`、`manifest.json`、状态管理、皮肤样式和组件
- `src/core/tooling-engine`
  - 工具引擎层，负责动态加载工具、读取 `manifest.json`、注入 SEO/GEO metadata
- `public`
  - 静态资源，例如 `logo.png`、`favicon.ico`、图片素材

你可以把它理解成：

1. 主题负责外壳
2. 工具负责具体功能
3. `manifest.json` 负责声明工具的 SEO、GEO、使用说明、支持功能和路线图

## 关键目录说明

```text
src/
  app/                       # App Router 路由
  core/
    tooling-engine/          # DynamicLoader + metadata 注入
    theme/                   # 主题区块加载
    auth/ db/ i18n/          # 鉴权、数据库、国际化等基础设施
  themes/
    tools/                   # 当前工具站主题
    default/                 # 默认主题
  tools/
    chat-simulator/          # 已完成的多平台聊天模拟器
    example-tool/            # 工具示例
  extensions/                # 支付、存储、AI、邮件等扩展
  shared/                    # 共享组件、hooks、services、types
```

## 工具是怎么被挂载起来的

当前这套工具框架的关键链路是：

1. 每个工具放在 `src/tools/<tool-name>/`
2. 每个工具必须带一个 `manifest.json`
3. `src/core/tooling-engine/DynamicLoader.tsx` 会根据工具名读取 `manifest.json`，再从注册表里加载对应工具组件
4. `src/app/[locale]/tools/[toolName]/page.tsx` 会调用 metadata 生成函数，把工具自己的 SEO/GEO 注入页面
5. 主题区块会统一渲染：
   - 工具运行区
   - 使用说明区
   - 其他工具推荐区

这意味着：
- 工具功能是独立的
- SEO/GEO 是工具级的
- 主题只是外壳，不和具体工具强耦合

## 本地快速开始

1. 复制 `.env.example` 为 `.env`
2. 修改 `.env` 里的这些基础配置：
   - 必填：
     - `NEXT_PUBLIC_APP_URL`
     - `NEXT_PUBLIC_APP_NAME`
     - `NEXT_PUBLIC_DEFAULT_TOOL`
   - 如果启用登录或鉴权：
     - `AUTH_SECRET`
   - 如果启用数据库相关功能：
     - `DATABASE_PROVIDER`
     - `DATABASE_URL`
3. 在项目根目录运行 `pnpm install`
4. 替换 `public/logo.png` 和 `public/favicon.ico`
5. 运行 `pnpm dev`

默认本地开发命令：

```bash
pnpm dev
```

本地生产构建与启动：

```bash
pnpm build
pnpm start
```

## 工具依赖安装规则

- 项目通过 `pnpm-workspace.yaml` 自动纳入 `src/tools/*` 下的工具包
- 项目通过 `.npmrc` 启用 `node-linker=hoisted`
- 新增、删除或替换工具目录后，重新在根目录执行一次 `pnpm install`
- 每个工具目录都应该有自己独立的 `package.json`
- 工具自己的第三方依赖放到 `dependencies`
- 与主应用共享的 `next`、`react`、`react-dom` 建议放到 `peerDependencies`

工具目录示例：

```text
src/tools/my-tool/
  ├─ index.tsx
  ├─ manifest.json
  └─ package.json
```

`package.json` 示例：

```json
{
  "name": "@tools/my-tool",
  "private": true,
  "version": "1.0.0",
  "dependencies": {
    "dayjs": "^1.11.13"
  },
  "peerDependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

## SEO / GEO 是怎么生效的

每个工具都可以在自己的 `manifest.json` 中声明：

- `seo.title`
- `seo.description`
- `seo.keywords`
- `seo.openGraph.images`
- `geo.latitude`
- `geo.longitude`
- `geo.region`
- `geo.placename`

当前实际生效链路：

- `src/tools/<tool-name>/manifest.json`
- `src/core/tooling-engine/metadata.ts`
- `src/app/[locale]/tools/[toolName]/page.tsx`

也就是说，工具上线后页面的标题、描述、关键词、Open Graph 以及 GEO metadata 都来自工具自身配置，而不是写死在主题里。

## Cloudflare 自动部署

这个项目更适合部署到 `Cloudflare Workers`，并通过 `OpenNext + Workers Builds` 实现“代码推到 Git，Cloudflare 自动构建并部署”。

当前仓库已经有这些基础项：

- `wrangler.toml` / `wrangler.toml.example`
- `.dev.vars`
- `cf:preview` / `cf:deploy` / `cf:upload` / `cf:typegen` 脚本

当前还需要你补的一项是：

- 安装 `@opennextjs/cloudflare`

如果你现在是不接数据库的版本，部署时可以只保留页面、工具展示和公开路由所需的环境变量，不必先接 `Hyperdrive` 或填写 `DATABASE_URL`。

建议先看完整部署指南：

- [`docs/Cloudflare自动部署.md`](./docs/Cloudflare自动部署.md)

最小上线步骤：

1. 安装 OpenNext Cloudflare 适配器

```bash
pnpm add -D @opennextjs/cloudflare
```

2. 本地确认这三个命令能通过

```bash
pnpm build
pnpm run cf:typegen
pnpm run cf:preview
```
把`wrangler.toml.example`复制一份到`wrangler.toml`，并根据实际情况来修改`wrangler.toml`文件的内容，并把该文件提交到仓库内

3. 把仓库推到 GitHub 或 GitLab
4. 在 Cloudflare Workers Builds 里连接仓库
5. 配置构建命令和部署命令：

```bash
npx @opennextjs/cloudflare build
npx @opennextjs/cloudflare deploy
```

6. 在 Cloudflare 控制台里填写 `Build variables and secrets` 与运行时变量

如果你改了工具的 `manifest.json`、品牌资源或 `NEXT_PUBLIC_*` 配置，重新推送代码后会自动触发新部署。

## 文档地址

- 工具架构文档: [`docs/ToolingEngineArchitecture.md`](./docs/ToolingEngineArchitecture.md)
- 使用手册: [`docs/使用手册.md`](./docs/使用手册.md)
- Cloudflare 自动部署: [`docs/Cloudflare自动部署.md`](./docs/Cloudflare自动部署.md)

## 参考来源

- OpenNext Cloudflare: [https://opennext.js.org/cloudflare](https://opennext.js.org/cloudflare)
- Cloudflare Wrangler: [https://developers.cloudflare.com/workers/wrangler/](https://developers.cloudflare.com/workers/wrangler/)
