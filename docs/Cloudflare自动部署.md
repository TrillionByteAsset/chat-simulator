# Cloudflare 自动部署

这份文档针对当前仓库，目标是：

- 部署到 `Cloudflare Workers`
- 通过连接 GitHub / GitLab 仓库实现自动部署
- 当前阶段不接数据库

## 为什么选 Workers，不选 Pages

这是一个完整的 `Next.js` 应用，不只是静态页面。

对这类 SSR / App Router 项目，推荐方案是：

- `Cloudflare Workers`
- `OpenNext`
- `Workers Builds`

参考：

- [Cloudflare Next.js on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- [OpenNext Cloudflare Get Started](https://opennext.js.org/cloudflare/get-started)

## 当前仓库现状

仓库已经具备这些基础项：

- 已有 `wrangler.toml` 和 `wrangler.toml.example`
- 已有 `.dev.vars`
- 已有 Cloudflare 相关脚本：
  - `pnpm run cf:preview`
  - `pnpm run cf:deploy`
  - `pnpm run cf:upload`
  - `pnpm run cf:typegen`

当前还缺一项依赖：

- `@opennextjs/cloudflare`

也就是说，如果现在直接执行 `pnpm run cf:preview`，大概率会报找不到 `opennextjs-cloudflare`。

## 不接数据库时，本地需要准备什么

### 1. 安装 Cloudflare 适配器

```bash
pnpm add -D @opennextjs/cloudflare
```

### 2. 准备 `wrangler.toml`

当前仓库根目录已经有 `wrangler.toml` 模板，你至少需要确认这些字段：

- `name`
  - 改成你真实的 Worker 名称
- `main = ".open-next/worker.js"`
  - 保持不变
- `[assets].directory = ".open-next/assets"`
  - 保持不变
- `[vars]`
  - 填写应用运行需要的变量

如果你当前不接数据库，可以按“最小变量集”来配：

```toml
[vars]
NEXT_PUBLIC_APP_URL = "https://your-domain.com"
NEXT_PUBLIC_APP_NAME = "Your App Name"
NEXT_PUBLIC_THEME = "tools"
NEXT_PUBLIC_DEFAULT_TOOL = "chat-simulator"
NEXT_PUBLIC_APPEARANCE = "system"
```

按需再补：

- `AUTH_SECRET`
  - 只有你启用登录 / 鉴权时再配

当前阶段可以不配：

- `DATABASE_PROVIDER`
- `DATABASE_URL`
- `[[hyperdrive]]`

如果你确定不会接数据库，建议把 `wrangler.toml` 里的 `[[hyperdrive]]` 和数据库变量删掉，避免后面误以为它们是必填项。

### 3. 准备本地 `.env`

本地 `.env` 建议和 Cloudflare 变量保持一致。

不接数据库时，最小配置可以是：

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Your App Name"
NEXT_PUBLIC_THEME="tools"
NEXT_PUBLIC_DEFAULT_TOOL="chat-simulator"
NEXT_PUBLIC_APPEARANCE="system"
```

如果你会用到登录，再补：

```env
AUTH_SECRET="replace-me"
```

如果你不会访问登录、用户、订单、支付、配置中心这类依赖数据库的功能，就不需要先补数据库环境变量。

## 本地验证顺序

在接入 Cloudflare 自动部署前，建议本地至少跑通这三个命令：

### 1. Next.js 生产构建

```bash
pnpm build
```

作用：

- 确认项目在生产模式下能构建成功

### 2. 生成 Cloudflare 类型

```bash
pnpm run cf:typegen
```

作用：

- 根据 `wrangler.toml` 生成 Cloudflare 环境类型
- 检查当前 Worker 配置有没有明显问题

### 3. 用 Workers 运行时预览

```bash
pnpm run cf:preview
```

作用：

- 用更接近 Cloudflare 线上环境的方式本地运行
- 比 `pnpm dev` 更容易提前暴露兼容性问题

## Git 自动部署怎么配

### 1. 先把项目放进 Git 仓库

如果你要“提交代码后自动部署”，前提是项目已经在 GitHub 或 GitLab 上。

你至少需要：

- 本地是一个 Git 仓库
- 已经推送到 GitHub / GitLab
- 确认生产分支，例如 `main`

### 2. 注意 `wrangler.toml` 是否会被提交

当前模板里默认忽略了 `wrangler.toml`。

这意味着：

- 如果你继续保持忽略，Git 仓库里可能没有 Worker 配置文件
- Cloudflare 自动构建时就只能依赖平台侧配置

更推荐的做法是：

- 提交一个不包含密钥的 `wrangler.toml`
- 把真正敏感的信息放到 Cloudflare Dashboard 的变量或 secrets 中

不要提交到 Git 的内容：

- `AUTH_SECRET`
- 各类 API Key
- 数据库连接串

### 3. 在 Cloudflare 连接仓库

在 Cloudflare Dashboard 中：

1. 打开 `Workers & Pages`
2. 选择创建 / 导入项目
3. 连接 GitHub 或 GitLab 仓库
4. 选择生产分支

Cloudflare 官方文档：

- [Workers CI/CD](https://developers.cloudflare.com/workers/ci-cd/)
- [Workers Builds Configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)

说明：

- Git 自动部署能力本身是 Cloudflare 的标准能力
- 对这个 Next.js 项目，实际运行平台仍然建议使用 `Workers`

### 4. 配置 Build / Deploy 命令

根据 OpenNext 官方文档，在 `Workers Builds` 里建议这样配：

Build command:

```bash
npx @opennextjs/cloudflare build
```

Deploy command:

```bash
npx @opennextjs/cloudflare deploy
```

参考：

- [OpenNext Dev / Deploy](https://opennext.js.org/cloudflare/howtos/dev-deploy)
- [OpenNext CLI](https://opennext.js.org/cloudflare/cli)

### 5. 配置环境变量

这一点很重要。

当你使用 `Workers Builds` 时，环境变量最好分两层理解：

- `Build variables and secrets`
  - 提供给构建阶段使用
- 运行时变量 / Secrets
  - 提供给 Worker 运行时使用

至少这些 `NEXT_PUBLIC_*` 变量应该在构建阶段可用：

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_THEME`
- `NEXT_PUBLIC_DEFAULT_TOOL`
- `NEXT_PUBLIC_APPEARANCE`

如果你启用了登录，再补：

- `AUTH_SECRET`

OpenNext 官方说明里特别提到：

- `Workers Builds` 下，环境变量要在 `Build variables and secrets` 中配置
- 因为 `Next build` 需要在构建时读取它们，尤其是 `NEXT_PUBLIC_*`

参考：

- [OpenNext Env Vars](https://opennext.js.org/cloudflare/howtos/env-vars)

## 推荐上线流程

如果你现在是“不接数据库的工具站版本”，推荐按这个顺序：

1. 本地填好最小 `.env`
2. 安装 `@opennextjs/cloudflare`
3. 跑通 `pnpm build`
4. 跑通 `pnpm run cf:typegen`
5. 跑通 `pnpm run cf:preview`
6. 把仓库推到 GitHub / GitLab
7. 在 Cloudflare 连接仓库
8. 配置 Build command / Deploy command
9. 配置 `Build variables and secrets`
10. 推送到生产分支触发自动部署

## 常见问题

### 为什么本地 `pnpm dev` 正常，但 Cloudflare 上构建失败？

因为：

- `pnpm dev` 运行在 Next.js 本地开发环境
- Cloudflare 线上部署跑的是 `OpenNext + Workers` 流程

所以更应该以这三个命令为准：

```bash
pnpm build
pnpm run cf:typegen
pnpm run cf:preview
```

### 为什么推了代码，Cloudflare 没有拿到我的 Worker 配置？

先检查：

- `wrangler.toml` 是否真的提交进 Git 了
- 它是不是还被 `.gitignore` 忽略
- Cloudflare 项目是否连对了仓库和分支

### 不接数据库时，`DATABASE_URL` 一定要填吗？

不一定。

如果你当前上线的是不依赖数据库的页面和工具展示能力，可以先不接数据库。

但如果你要启用这些能力，就要补数据库：

- 登录 / 注册
- 用户系统
- 订单 / 订阅 / 支付
- 持久化配置

### `AUTH_SECRET` 一定要填吗？

只有启用登录 / 鉴权时才需要优先补。

如果当前只是一个公开可访问的工具站，且没有启用鉴权流程，可以先不作为上线阻塞项。
