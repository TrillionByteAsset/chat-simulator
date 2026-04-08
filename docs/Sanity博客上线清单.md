# Sanity博客上线清单

这份文档对应当前仓库已经完成的 `Sanity + 博客 + SEO + sitemap + 发布联动` 实现。

适用范围：

- 使用 `Vercel` 部署本站
- 使用 `Sanity` 作为文章后台
- 文章前台展示在你自己的站点域名下

## 1. 当前已完成的代码能力

仓库中已经完成这些能力：

- 嵌入式 Sanity Studio：`/studio`
- 博客列表页：`/blog`
- 博客详情页：`/blog/[slug]`
- 博客分类页：`/blog/category/[slug]`
- 中英双语 canonical 与 `hreflang`
- `BlogPosting` / `BreadcrumbList` / `CollectionPage` 结构化数据
- 动态 `sitemap.xml`
- Sanity 发布后自动刷新站点的 webhook 接口
- 博客文章页、分类页、列表页和 sitemap 已固定为 `useCdn: false`，依赖 Next/Vercel 页面缓存与 revalidate

## 2. 需要配置的环境变量

本地 `.env` 和 Vercel 项目环境变量都需要补齐以下字段：

```env
SANITY_PROJECT_ID=
SANITY_DATASET=production
SANITY_API_TOKEN=
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_REVALIDATE_SECRET=
```

另外建议确认这些基础变量已经正确：

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Your Site Name
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

如果你希望“英文是默认语言，中文必须带 `/zh` 才能访问”，这项一定要设成：

```env
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

设置后：

- 英文首页：`/`
- 英文博客：`/blog/...`
- 中文首页：`/zh`
- 中文博客：`/zh/blog/...`

修改后需要重启本地开发服务，并重新部署线上环境。

说明：

- `SANITY_PROJECT_ID`
  Sanity 项目 ID
- `SANITY_DATASET`
  一般用 `production`
- `SANITY_API_TOKEN`
  服务端读取和后续预览/联动使用的 token
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
  前端和 Studio 需要读取
- `NEXT_PUBLIC_SANITY_DATASET`
  前端和 Studio 需要读取
- `SANITY_REVALIDATE_SECRET`
  用于保护发布 webhook

## 3. Sanity 侧需要做什么

### 3.1 创建项目

在 Sanity 后台创建项目，拿到：

- Project ID
- Dataset 名称

### 3.2 创建 API Token

在 Sanity 项目里创建一个 token，至少用于服务端读取和 webhook 联动。

建议：

- 先使用一个只给当前站点使用的独立 token
- 不要复用别的项目 token

### 3.3 本地开发需要的 CORS

如果你要在本地打开嵌入式 Studio：

```text
http://localhost:3000/studio
```

需要在 Sanity 项目后台的 `Settings -> API -> CORS Origins` 中添加：

```text
http://localhost:3000
```

如果你本地用的是别的端口，也要把实际端口一并加入。

### 3.4 使用当前 schema

当前代码已经包含以下 schema：

- `post`
- `category`
- `author`
- `siteSettings`

文章采用“单文档双语”设计，关键字段包括：

- `title.zh` / `title.en`
- `slug.zh` / `slug.en`
- `excerpt.zh` / `excerpt.en`
- `body.zh` / `body.en`
- `seoTitle.zh` / `seoTitle.en`
- `seoDescription.zh` / `seoDescription.en`
- `coverImage`
- `author`
- `categories`
- `publishedAt`
- `updatedAt`
- `noindex`

## 4. Vercel 侧需要做什么

### 4.1 配置环境变量

在 Vercel Project Settings -> Environment Variables 中添加：

- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_TOKEN`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_REVALIDATE_SECRET`

然后重新部署一次。

### 4.2 确认 Studio 可访问

部署成功后访问：

```text
https://your-domain.com/studio
```

如果环境变量齐全，应该能看到嵌入式 Studio。

如果页面提示 `Sanity is not configured`，说明变量没有正确生效。

## 5. 配置发布 webhook

当前代码里的 webhook 路由是：

```text
POST /api/revalidate/sanity
```

推荐把 Sanity webhook URL 配成：

```text
https://your-domain.com/api/revalidate/sanity
```

并在 webhook 请求头里加：

```text
x-webhook-secret: YOUR_SANITY_REVALIDATE_SECRET
```

建议在 Sanity webhook payload 中包含：

- `type`
- `slug`
- 或中英 slug 字段

当前代码会根据 payload 尝试刷新：

- `/blog`
- `/en/blog`
- `/blog/[slug]`
- `/en/blog/[slug]`
- `/blog/category/[slug]`
- `/en/blog/category/[slug]`
- `/sitemap.xml`

如果你后面想让 webhook 刷新更精确，可以再按 Sanity 实际 payload 结构微调。

### 5.0 当前项目的缓存策略

当前博客链路已经按下面的分层执行：

- 文章页：`useCdn: false`
- 博客列表与分类页：`useCdn: false`
- `sitemap.xml`：`useCdn: false`
- 页面缓存：交给 Next.js / Vercel 的 `revalidate` 和 `tags`
- 发布、更新、删除：交给 Sanity webhook 触发 `revalidateTag` / `revalidatePath`

这样做的目的：

- 避免 Sanity API CDN 在发布/删除后短时间返回旧数据
- 让文章页和 sitemap 在 webhook 后更快反映最新状态
- 仍然依赖 Next/Vercel 页面缓存来承接访问量，而不是每个访客都直接穿透到 Sanity

### 5.1 推荐的 webhook 过滤和 payload

建议在 Sanity webhook 中这样设置：

- Trigger on:
  `Create`
  `Update`
  `Delete`
- Filter:

```groq
_type in ["post", "category", "siteSettings"]
```

- Projection:

```groq
{
  "type": _type,
  "slugs": {
    "zh": slug.zh.current,
    "en": slug.en.current
  }
}
```

这样当前项目的 revalidate 路由就能拿到中英文 slug，精准刷新对应文章页和分类页。

## 6. 首篇文章上线流程

建议按下面顺序做：

1. 在 Sanity 里创建 1 个 `author`
2. 创建 1 个 `category`
3. 创建 1 篇 `post`
4. 填写：
   `title.zh / title.en`
   `slug.zh / slug.en`
   `excerpt.zh / excerpt.en`
   `body.zh / body.en`
   `seoTitle.zh / seoTitle.en`
   `seoDescription.zh / seoDescription.en`
5. 上传封面图
6. 选择分类和作者
7. 设置 `publishedAt`
8. 保持 `noindex = false`
9. 点击 Publish

### 6.1 本地第一篇测试文章建议内容

你可以先建一篇最小测试文章：

- `title.zh`
  `测试文章`
- `title.en`
  `Test Post`
- `slug.zh`
  `ce-shi-wen-zhang`
- `slug.en`
  `test-post`
- `excerpt.zh`
  `这是一篇用于验证 Sanity 联动和 SEO 的测试文章。`
- `excerpt.en`
  `This is a test article for verifying Sanity integration and SEO.`
- `seoTitle.zh`
  `测试文章 SEO 标题`
- `seoTitle.en`
  `Test Post SEO Title`
- `seoDescription.zh`
  `用于验证博客详情页、sitemap 和 webhook 的测试文章。`
- `seoDescription.en`
  `A test article for verifying the blog detail page, sitemap, and webhook.`
- `body.zh`
  至少写一个标题和两段正文
- `body.en`
  至少写一个标题和两段正文
- `publishedAt`
  当前时间
- `noindex`
  `false`

然后检查这些页面：

- `http://localhost:3000/blog/ce-shi-wen-zhang`
- `http://localhost:3000/en/blog/test-post`
- `http://localhost:3000/sitemap.xml`

### 6.2 本地如何测试 webhook

Sanity 云端 webhook 不能直接请求你的本地 `localhost`，所以本地测试建议二选一：

1. 手动调用本地 revalidate 接口
2. 用隧道工具把本地服务暴露到公网后，再把 webhook 指向那个公网地址

最简单的是先手动调用：

```bash
curl -X POST "http://localhost:3000/api/revalidate/sanity" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: 你的SANITY_REVALIDATE_SECRET" \
  -d '{
    "type": "post",
    "slugs": {
      "zh": "ce-shi-wen-zhang",
      "en": "test-post"
    }
  }'
```

如果是分类，也可以这样测：

```bash
curl -X POST "http://localhost:3000/api/revalidate/sanity" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: 你的SANITY_REVALIDATE_SECRET" \
  -d '{
    "type": "category",
    "slugs": {
      "zh": "ce-shi-fen-lei",
      "en": "test-category"
    }
  }'
```

如果返回 `ok: true`，说明本地 webhook 路由已经通了。

### 6.3 线上如何测试 webhook

当你部署到线上后，把 Sanity webhook URL 配成：

```text
https://www.chat-simulator.top/api/revalidate/sanity
```

Header:

```text
x-webhook-secret: 你的SANITY_REVALIDATE_SECRET
```

然后在 Sanity 中更新一篇文章，再检查：

- `/blog`
- `/en/blog`
- 中文文章详情页
- 英文文章详情页
- `/sitemap.xml`

是否在刷新后出现最新内容。

## 7. 发布后要检查什么

### 7.1 页面可访问

检查这些 URL：

- 中文文章页：`/blog/你的中文slug`
- 英文文章页：`/en/blog/你的英文slug`
- 中文分类页：`/blog/category/分类slug`
- 英文分类页：`/en/blog/category/category-slug`

### 7.2 页面源码

打开文章页源码，确认：

- HTML 里直接有正文
- 不是只剩空壳容器

### 7.3 Metadata

检查：

- `title`
- `meta description`
- canonical
- `hreflang`
- og tags

### 7.4 结构化数据

文章详情页应包含：

- `BlogPosting`
- `BreadcrumbList`

列表页和分类页应包含：

- `CollectionPage`

### 7.5 Sitemap

访问：

```text
https://your-domain.com/sitemap.xml
```

确认：

- 新文章 URL 已出现
- 中英版本 URL 都存在
- 没有草稿、404、noindex 页面

### 7.6 Webhook 是否生效

在 Sanity 发布或更新文章后检查：

- `/blog` 是否刷新
- 详情页是否刷新
- `sitemap.xml` 是否更新

## 8. Google 收录前的建议动作

完成首篇文章后，建议做这些动作：

1. 在 Google Search Console 添加并验证域名
2. 提交 `sitemap.xml`
3. 用 URL Inspection 检查首篇文章 URL
4. 确认 canonical 指向自己站内 URL
5. 确认中文页和英文页互相带有 `hreflang`

## 9. 常见问题

### 9.1 为什么文章能在 Sanity 看到，但前台没有更新？

常见原因：

- Vercel 环境变量未生效
- webhook 没配
- webhook secret 不一致
- 发布的是 draft，不是 published

### 9.2 为什么 `/studio` 打不开？

常见原因：

- `NEXT_PUBLIC_SANITY_PROJECT_ID` 未配置
- `NEXT_PUBLIC_SANITY_DATASET` 未配置
- 部署后没有重新构建

### 9.3 为什么文章不在 sitemap 里？

常见原因：

- `noindex = true`
- 文章没有发布
- slug 缺失
- webhook 未刷新，或还在缓存期内

## 10. 现在这套方案的边界

当前实现已经适合上线使用，但还有几项是后续可以继续增强的：

- Sanity webhook payload 精细匹配
- draft preview
- RSS
- 相关文章推荐
- 作者页
- 专题页
- Search Console 提交自动化

如果后面继续扩展，建议优先顺序是：

1. Draft Preview
2. RSS
3. 作者页 / 专题页
4. 更细的内部链接策略
