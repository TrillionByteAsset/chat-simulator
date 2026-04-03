import type { ToolManifest } from '@/core/tooling-engine/types';

export type ToolSitePageKind = 'privacy' | 'about' | 'faq' | 'terms';

interface ToolSitePageContentArgs {
  kind: ToolSitePageKind;
  locale?: string;
  manifest: ToolManifest;
}

export interface ToolSitePageContent {
  eyebrow: string;
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  content: string;
}

const CONTACT_EMAIL = 'info@chat-simulator.top';
const GOOGLE_ADS_SETTINGS_URL = 'https://adssettings.google.com/';
const GOOGLE_PRIVACY_URL = 'https://policies.google.com/privacy';
const GOOGLE_COOKIES_URL = 'https://policies.google.com/technologies/cookies';

function getContactEmailMarkdown(displayName: string, isZh: boolean) {
  const title = isZh
    ? `通过邮箱联系 ${displayName}`
    : `Email ${displayName} support`;

  return `[${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL} "${title}")`;
}

function isChineseLocale(locale?: string) {
  return locale?.toLowerCase().startsWith('zh') ?? false;
}

function getDisplayName(manifest: ToolManifest) {
  return (
    manifest.name || manifest.seo?.h1 || manifest.seo?.title || 'This tool'
  );
}

export function getToolSitePageContent({
  kind,
  locale,
  manifest,
}: ToolSitePageContentArgs): ToolSitePageContent {
  const isZh = isChineseLocale(locale);
  const displayName = getDisplayName(manifest);
  const summary = manifest.seo?.description?.trim();

  if (kind === 'privacy') {
    if (isZh) {
      return {
        eyebrow: '隐私说明',
        title: `${displayName} 隐私政策`,
        description: `${displayName} 由个人开发者独立维护。工具内容默认遵循本地优先处理原则；同时，作为网站服务的一部分，站点可能使用 Cookie、日志、统计与广告服务来保障运行并支持后续商业化。`,
        seoTitle: `${displayName} 隐私政策 | Cookie、广告与数据说明`,
        seoDescription: `${displayName} 的隐私说明，涵盖工具本地处理原则、站点 Cookie 使用、广告与统计披露以及联系方式。`,
        content: `## 隐私适用范围

### 适用范围

本页面适用于 **${displayName}** 网站及其当前提供的在线工具页面。

## 工具内容与网站数据

### 工具内容如何处理

- 正常使用本工具时，你输入的文本、截图素材、上传文件以及页面内编辑内容，默认优先在浏览器或本地设备中处理。
- 站点设计目标是不以保存用户创作内容为核心能力，也不会因为你正常使用工具而主动建立聊天内容档案或个人画像。
- 但这并不代表网站完全不接触任何技术性数据。为了保证网站正常运行，服务器、托管平台和第三方服务仍可能处理访问请求中附带的必要信息。

### 网站层面可能处理的信息

- 基本访问日志，例如 IP 地址、浏览器类型、访问时间、来源页面、错误日志等
- 为维持登录状态、偏好设置、风控或站点功能所需的必要 Cookie 或类似技术信息
- 当广告、统计或托管服务启用时，这些服务在其处理范围内收集的技术数据

## Cookie、广告与第三方服务

### Cookie 与类似技术

- 本网站可能使用 Cookie、本地存储或类似技术来保存必要功能状态、改进体验、衡量访问效果以及支持广告展示。
- 不同国家或地区对 Cookie 与隐私同意的要求不同；如法律要求，我们会在相应地区增加或调整同意提示与管理方式。

### 广告服务说明

- 本网站计划接入或在未来接入 **Google AdSense** 及类似广告服务，以支持网站持续运营。
- 当广告服务启用后，Google 及其合作伙伴可能会使用 Cookie 或类似技术，根据用户访问情况展示广告、限制广告重复展示次数，并衡量广告效果。
- 如启用了个性化广告，相关服务可能会基于你的访问行为提供更相关的广告内容。
- 你可以通过 [Google Ads Settings](${GOOGLE_ADS_SETTINGS_URL}) 管理广告个性化偏好，并可查看 Google 的 [隐私政策](${GOOGLE_PRIVACY_URL}) 与 [Cookie 政策](${GOOGLE_COOKIES_URL}) 了解更多说明。

### 统计与第三方服务

- 为了解网站稳定性、访问趋势或页面表现，网站未来可能接入统计分析、性能监控、托管安全或反滥用服务。
- 这些服务通常会处理技术性标识、页面访问数据或设备相关信息，用于站点维护、诊断和优化。

## 不主动收集的内容与联系渠道

### 我们不会以此为目的主动收集的内容

- 姓名、手机号、住址、身份证号等身份资料
- 你在工具中编辑的聊天文本、截图内容、上传图片或创作素材本身
- 与工具功能无关的敏感个人信息

### 联系我们

如果你主动发送邮件到 ${getContactEmailMarkdown(displayName, true)}，我们仅会在处理咨询、反馈或问题回复所必需的范围内使用你的邮箱和来信内容，不会将其出售或分享给无关第三方。

## 维护说明与更新

### 个人开发者说明

**${displayName}** 由个人开发者独立设计和维护。站点会尽量保持说明透明、表达清晰，并在功能或第三方服务发生变化时及时更新披露内容。

### 更新说明

当网站功能、数据处理方式或联系方式发生变化时，本页面会同步调整。继续使用网站，即表示你理解当前页面中披露的处理方式。`,
      };
    }

    return {
      eyebrow: 'Privacy',
      title: `${displayName} Privacy Policy`,
      description: `${displayName} is independently maintained. Tool content is designed to be handled locally whenever possible, while the website itself may use cookies, logs, analytics, and advertising services to operate and support monetization.`,
      seoTitle: `${displayName} Privacy Policy | Cookies, Ads, and Data Use`,
      seoDescription: `Explore the Chat Simulator Privacy Policy, detailing user data handling, cookies usage, and our commitment to privacy while ensuring a smooth user experience.`,
      content: `## Privacy scope

### Scope

This page applies to the **${displayName}** website and its current tool pages.

## Tool content and website data

### How tool content is handled

- When you use this tool normally, your text, uploaded assets, screenshots, and editing actions are intended to be handled locally in your browser or on your device whenever possible.
- The goal of the product is not to build personal profiles from the content you create inside the tool.
- However, that does not mean the website never touches any technical data. Hosting, security, diagnostics, and third-party services may still process limited request-level information needed to run the site.

### Website-level information that may be processed

- Basic access and diagnostic data such as IP address, browser type, timestamps, referrer, and error logs
- Necessary cookies or similar technologies used for site preferences, session state, abuse prevention, or feature delivery
- Technical data processed by analytics, hosting, or advertising services when those services are enabled

## Cookies, advertising, and third-party services

### Cookies and similar technologies

- This website may use cookies, local storage, or similar technologies to support essential functionality, improve user experience, measure traffic, and support advertising.
- Privacy and consent requirements vary by jurisdiction. Where required by law, the site may display consent or preference controls for cookies and advertising technologies.

### Advertising disclosure

- This website may use **Google AdSense** or similar advertising services to support ongoing operation of the site.
- When advertising is enabled, Google and its partners may use cookies or similar technologies to serve ads, limit how often ads are shown, personalize ads where permitted, and measure ad performance.
- You can manage ad personalization through [Google Ads Settings](${GOOGLE_ADS_SETTINGS_URL}) and learn more from Google's [Privacy Policy](${GOOGLE_PRIVACY_URL}) and [Cookies Policy](${GOOGLE_COOKIES_URL}).

### Analytics and third-party services

- The website may also use analytics, performance monitoring, hosting, security, or anti-abuse services to understand traffic patterns, maintain stability, and improve the product.
- These services commonly process technical identifiers, device information, and page interaction data within their own service scope.

## Data we do not intentionally collect and contact

### Information we do not intentionally collect as product content

- Identity information such as your full name, phone number, address, or government ID
- Your chat content, screenshots, images, or other creative materials created inside the tool as a product data asset
- Sensitive personal information unrelated to the website's core function

### Contact

If you voluntarily email ${getContactEmailMarkdown(displayName, false)}, we only use your email address and message to respond to your inquiry, feedback, or support request. We do not sell or share that information with unrelated third parties.

## Maintenance notice and updates

### Independent developer notice

**${displayName}** is independently built and maintained. The goal is to keep the website practical, transparent, and respectful of user privacy while still allowing sustainable operation.

### Updates

If the website features, processing method, or contact details change, this page will be updated accordingly. By continuing to use the website, you acknowledge the current practices described here.`,
    };
  }

  if (kind === 'faq') {
    if (isZh) {
      return {
        eyebrow: '常见问题',
        title: `${displayName} 常见问题`,
        description: `${displayName} 的常见问题页面，集中说明这个工具站的使用方式、数据处理原则、广告说明和联系方式。`,
        seoTitle: `${displayName} 常见问题 | 使用、导出与隐私说明`,
        seoDescription: `${displayName} 常见问题页面，集中说明工具用途、本地处理、是否需要注册、导出方式、Cookie、广告说明以及联系方式等常见问题。`,
        content: `## 关于这个工具

### 1. ${displayName} 是做什么的？

**${displayName}** 是一个面向真实使用场景的在线工具站，核心目标是让用户打开页面后就能快速完成操作，而不是先经历复杂配置。

### 2. 我在工具里输入的内容会被保存吗？

正常使用工具时，页面内容默认优先在本地浏览器或本地设备中处理。站点不会以保存你的聊天内容、截图内容或创作素材为产品目标。

### 3. 使用这个网站需要注册账号吗？

当前公开工具页通常不以登录为前提。只要页面功能可直接访问，你就可以直接使用；若未来某些能力需要登录、同步或服务端处理，会在对应功能中单独说明。

## 导出与使用方式

### 4. 导出的内容是在本地完成的吗？

像预览、编辑、截图导出这类核心体验，当前设计目标是尽量在本地完成，减少不必要的上传和服务端依赖。

## 广告、Cookie 与站点说明

### 5. 网站会不会展示广告？

网站可能接入 **Google AdSense** 或其他合规广告服务，用来支持持续运营和基础成本。广告服务启用后，第三方可能会使用 Cookie 或类似技术来展示和衡量广告效果。

### 6. 网站会不会使用 Cookie？

会。站点可能使用 Cookie、本地存储或类似技术来维持必要功能、记录偏好、做基础分析，或支持广告展示。详细说明请查看隐私政策页面。

### 7. 这个网站是公司团队在运营吗？

不是。**${displayName}** 当前由个人开发者独立设计、维护和迭代，因此页面会尽量保持轻量、直接和清晰。

### 8. 我可以把生成的内容用于商业用途吗？

你需要自行确认使用场景是否合法、合规，并确保你上传或生成的素材不侵犯他人权利。网站本身只提供工具能力，不对用户的具体使用行为承担额外保证责任。

## 更新与联系

### 9. 如果页面功能调整了怎么办？

如果未来接入新的第三方服务、广告组件、统计能力或服务端功能，相关页面说明会同步更新，包括隐私政策、服务条款或 FAQ。

### 10. 如何联系站点维护者？

可以直接发送邮件到 ${getContactEmailMarkdown(displayName, true)}。如果是功能反馈、商务合作或合规问题，也建议通过邮箱联系。`,
      };
    }

    return {
      eyebrow: 'FAQ',
      title: `${displayName} FAQ`,
      description: `Frequently asked questions about ${displayName}, including how the tool works, how content is handled, whether ads may be shown, and how to get in touch.`,
      seoTitle: `${displayName} FAQ | Tool Usage, Export, and Privacy`,
      seoDescription: `Explore the Chat Simulator FAQ for answers on usage, local-first content handling, account requirements, exports, cookies, advertising, and support contact.`,
      content: `## About the tool

### 1. What is ${displayName} for?

**${displayName}** is a practical web tool built for real usage scenarios. The goal is to make the tool immediately usable without forcing users through a heavy setup flow first.

### 2. Is the content I enter stored by the website?

Under normal use, content entered into the tool is intended to be handled locally in your browser or on your device whenever possible. The product is not designed around building archives of your working content.

### 3. Do I need an account to use it?

Public tool pages are generally intended to be usable without requiring sign-in first. If a future feature depends on account access, synchronization, or server-side processing, that will be disclosed within that feature flow.

## Export and usage

### 4. Are exports handled locally?

Core interactions such as previewing, editing, and exporting are designed to stay as local as possible in order to reduce unnecessary uploads and server dependence.

## Ads, cookies, and site policies

### 5. Will the website show ads?

The site may use **Google AdSense** or other compliant advertising services to support ongoing operation and infrastructure costs. When advertising is enabled, third parties may use cookies or similar technologies to serve and measure ads.

### 6. Does the site use cookies?

Yes. The site may use cookies, local storage, or similar technologies for essential functionality, preference handling, basic analytics, and advertising support. See the privacy policy for details.

### 7. Is this operated by a company?

No. **${displayName}** is currently designed, maintained, and iterated by an independent developer, which is why the site is intentionally kept lightweight and direct.

### 8. Can I use generated results commercially?

You are responsible for making sure your use case is lawful and that any uploaded or generated material does not infringe the rights of others. The website provides tooling, but does not guarantee a specific legal outcome for user content.

## Updates and contact

### 9. What happens if features change later?

If the website later introduces new third-party services, analytics, advertising components, or server-side features, the related policy pages and FAQ content will be updated accordingly.

### 10. How can I contact the site owner?

You can email ${getContactEmailMarkdown(displayName, false)} for support, feedback, business inquiries, or compliance-related questions.`,
    };
  }

  if (kind === 'terms') {
    if (isZh) {
      return {
        eyebrow: '服务条款',
        title: `${displayName} 服务条款`,
        description: `${displayName} 的服务条款页面，说明网站的使用规则、责任边界、知识产权、广告说明与联系方式。`,
        seoTitle: `${displayName} 服务条款`,
        seoDescription: `${displayName} 的服务条款，涵盖允许使用、禁止行为、用户责任、免责声明和联系方式。`,
        content: `## 基本说明

### 1. 接受条款

访问或使用 **${displayName}**，即表示你同意按照本页面所列规则使用本网站。如果你不同意这些条款，请停止继续访问或使用相关服务。

### 2. 网站性质

**${displayName}** 是一个由个人开发者独立维护的工具网站，提供在线页面工具、功能说明以及与此相关的公开内容。网站可能根据产品迭代随时调整页面结构、功能形式或服务方式。

## 使用规则

### 3. 允许的使用方式

- 你可以在合法、合规的前提下使用网站公开提供的工具功能
- 你可以将网站用于个人项目、内容创作、演示或其他正常场景
- 你应确保自己上传、输入、编辑或导出的内容不侵犯任何第三方权利

### 4. 禁止行为

- 利用网站从事违法、侵权、骚扰、欺诈、恶意传播或其他不当行为
- 尝试攻击、绕过、破坏、滥用网站服务、接口、风控或资源限制
- 上传或传播包含恶意代码、病毒、自动化滥用脚本或其他破坏性内容
- 冒充本网站、开发者或与网站存在不存在的合作、认证或官方关系

## 用户责任与权利

### 5. 用户内容与责任

- 你对自己输入、上传、生成、导出或传播的内容承担责任
- 网站不对你使用工具后形成的具体结果、用途、合法性或商业适用性作额外保证
- 如果你使用网站生成的内容对外发布、商业使用或用于第三方平台，你应自行判断风险并承担后果

### 6. 知识产权

- 网站本身的页面结构、界面设计、文案组织和服务实现，除另有说明外，归网站维护者或相关权利人所有
- 你仍保留你自己提交内容在法律上应归属于你的权利
- 你不得复制、转售、镜像、反向利用网站核心内容或服务作为未经授权的竞争性产品

## 第三方服务与免责声明

### 7. 广告与第三方服务

- 网站可能接入 Google AdSense、统计、托管、客户服务或其他第三方服务
- 这些服务可能根据其自身规则处理必要的技术信息、Cookie 或访问数据
- 相关隐私说明请同时查看隐私政策页面

### 8. 免责声明

- 网站按“现状”提供，不承诺绝对无中断、无错误或永久可用
- 对于因网络、第三方平台、浏览器兼容性、政策变化、不可抗力或用户自身操作造成的问题，网站不承担超出法律要求之外的责任
- 站点维护者有权在必要时修改、限制、暂停或终止部分功能

## 更新与联系

### 9. 条款更新

本页面内容可能根据产品迭代、合规要求或业务变化而更新。更新后的条款会在网站上直接发布，继续使用网站即视为你接受更新后的条款。

### 10. 联系方式

如果你对本条款有疑问，可以通过 ${getContactEmailMarkdown(displayName, true)} 联系网站维护者。`,
      };
    }

    return {
      eyebrow: 'Terms',
      title: `${displayName} Terms of Service`,
      description: `${displayName} terms of service covering acceptable use, user responsibility, intellectual property, third-party services, disclaimers, and contact details.`,
      seoTitle: `${displayName} Terms of Service`,
      seoDescription: `Review the Chat Simulator terms of service outlining user responsibilities, permissible use, intellectual property, and compliance guidelines.`,
      content: `## General information

### 1. Acceptance of terms

By accessing or using **${displayName}**, you agree to use the website in accordance with the terms described on this page. If you do not agree, you should stop using the website.

### 2. Nature of the website

**${displayName}** is an independently maintained website that provides online tools, public product information, and related supporting content. The structure, feature set, and service model of the site may change over time as the product evolves.

## Usage rules

### 3. Permitted use

- You may use the publicly available features of the website for lawful purposes
- You may use the site for personal projects, creative work, demonstrations, and other ordinary use cases
- You must ensure that any content you upload, enter, edit, export, or distribute does not infringe the rights of others

### 4. Prohibited behavior

- Using the site for unlawful, infringing, harassing, fraudulent, abusive, or harmful activity
- Attempting to attack, bypass, overload, scrape abusively, disrupt, or misuse the website, its services, or technical protections
- Uploading or distributing malicious code, automated abuse scripts, or destructive content
- Misrepresenting the website, its operator, or any relationship of endorsement, partnership, or official status that does not exist

## User responsibility and rights

### 5. User content and responsibility

- You remain responsible for the content you enter, upload, generate, export, or distribute using the tool
- The website does not guarantee the legality, suitability, or business fitness of how you use generated results
- If you publish or commercialize output created with the tool, you are responsible for assessing the risks and compliance implications yourself

### 6. Intellectual property

- Unless otherwise stated, the website's interface, content structure, implementation, and branded presentation belong to the site operator or the relevant rights holders
- You retain whatever rights legally belong to you in the content you provide
- You may not copy, resell, mirror, or repurpose the website as an unauthorized competing service

## Third-party services and disclaimer

### 7. Advertising and third-party services

- The website may use Google AdSense, analytics providers, hosting services, customer support tools, or other third-party services
- Those services may process technical information, cookies, and usage data according to their own operating rules
- Please also review the privacy policy for related disclosures

### 8. Disclaimer

- The website is provided on an "as is" basis without a promise of uninterrupted availability or error-free operation
- The site operator is not responsible beyond what applicable law requires for issues caused by networks, browsers, third-party platforms, policy changes, force majeure, or user actions
- Features may be modified, limited, suspended, or discontinued when necessary

## Updates and contact

### 9. Updates to these terms

These terms may be updated as the product, compliance requirements, or service model changes. Continued use of the website after updates are published means you accept the revised terms.

### 10. Contact

If you have questions about these terms, please email ${getContactEmailMarkdown(displayName, false)}.`,
    };
  }

  if (isZh) {
    return {
      eyebrow: '关于我们',
      title: `关于 ${displayName}`,
      description: `${displayName} 是一个由个人开发者独立维护的工具网站，重点是把功能做得直接、清晰、易用，并通过透明的产品说明和合规的广告方式支持网站持续运营。`,
      seoTitle: `关于 ${displayName} | 多平台聊天创建与导出工具`,
      seoDescription: `${displayName} 关于我们页面，介绍这个工具如何覆盖网站核心流程，连接创建、编辑、预览、导出以及 FAQ、隐私、条款等配套页面。`,
      content: `## Chat Simulator 是什么

### 核心定位

**${displayName}** 是一个用于创建聊天截图和对话演示的在线工具，重点服务于 **Discord、WhatsApp、Telegram** 以及 **自定义模式** 等聊天场景。用户可以直接在网页中编辑人物、消息、时间、头像、附件和背景，并快速导出成适合展示或分享的图片。

${summary ? `> ${summary}` : '> 我们希望它能让用户不用设计软件，也能快速做出真实、清晰、可编辑的聊天画面。'}

## 这个工具能做什么

### 主要功能

- 创建多平台聊天内容，支持 Discord、WhatsApp、Telegram 和自定义模式
- 编辑消息文本、发送方、头像、时间、附件和聊天背景
- 预览完整聊天效果，减少导出前反复调整的成本
- 导出 PNG 或 JPG，用于内容展示、创意演示、产品说明或社交媒体素材

## 适合哪些使用场景

### 常见用途

- 制作聊天截图或对话式视觉内容
- 用于产品展示、营销素材、创作者内容和案例演示
- 快速搭建虚拟对话场景，用于脚本预览或创意表达
- 在不依赖复杂设计工具的情况下完成聊天样式排版

## 我们重视什么

### 产品原则

- **直接可用**：打开页面就能开始编辑，不需要复杂学习成本
- **本地优先**：能在浏览器本地完成的处理尽量不上传
- **真实可控**：尽量保留聊天界面的真实感，同时让编辑更灵活
- **透明说明**：隐私、条款、广告和联系方式都会尽量写清楚
- **持续迭代**：根据真实使用反馈持续优化导出效果和编辑体验

## 网站与工具的关系

### 页面说明

本网站的主要内容都会围绕 **${displayName}** 展开，包括工具页本身，以及 FAQ、隐私政策、服务条款和关于我们等说明页面。我们的目标不是堆很多无关页面，而是把聊天创建、编辑、导出和相关说明集中在一套清晰的体验里。

## 联系方式

### 联系我们

如果你有合作、反馈或问题，可以通过邮箱 ${getContactEmailMarkdown(displayName, true)} 联系我们。我们会尽量在合理时间内查看并处理相关信息。`,
    };
  }

  return {
    eyebrow: 'About',
    title: `About ${displayName}`,
    description: `${displayName} is an independently maintained website focused on simple, practical tools, with a product approach built around clarity, local-first handling where possible, and transparent monetization.`,
    seoTitle: `About ${displayName} | Multi-Platform Chat Tool`,
    seoDescription: `Learn how ${displayName} powers the website by connecting chat creation, editing, preview, export, and support pages like FAQ, Privacy, Terms, and About.`,
    content: `## What Chat Simulator is

### Core positioning

**${displayName}** is an online tool for creating chat screenshots and conversation mockups, with a focus on familiar messaging styles such as **Discord, WhatsApp, Telegram, and Custom mode**. It lets users edit participants, messages, timestamps, avatars, attachments, and backgrounds directly in the browser, then export the result as a polished image.

${summary ? `> ${summary}` : '> The goal is to help people create realistic, editable chat visuals quickly without relying on complex design software.'}

## What this tool helps you do

### Main features

- Build chat content for multiple styles including Discord, WhatsApp, Telegram, and Custom mode
- Edit message text, sender identity, avatars, timestamps, attachments, and chat backgrounds
- Preview the conversation before export so the final result is easier to control
- Export PNG or JPG files for presentations, marketing assets, mockups, or social content

## Common use cases

### Typical scenarios

- Creating realistic chat screenshots and conversation-based visuals
- Producing assets for product demos, marketing, creator content, and case studies
- Building scripted or fictional conversations for previews and storytelling
- Replacing heavier design workflows with a faster browser-based editing tool

## What we care about

### Product principles

- **Immediate usability**: the tool should be easy to start using right away
- **Local first**: if a task can stay in the browser, that is preferred
- **Realistic but flexible**: chat layouts should feel recognizable while still being easy to edit
- **Transparent communication**: privacy, terms, advertising, and contact details should be clearly explained
- **Continuous improvement**: export quality and editing workflows improve through real user feedback

## How the website is organized

### Page purpose

The main purpose of this website is to support **${displayName}** itself, including the editor, export flow, and the supporting pages such as FAQ, Privacy Policy, Terms of Service, and About. The goal is to keep the product experience focused and consistent rather than spreading it across unrelated pages.

## Contact

### Get in touch

For support, feedback, or collaboration, please email ${getContactEmailMarkdown(displayName, false)}. Messages are reviewed as promptly as possible.`,
  };
}
