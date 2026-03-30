import type { ToolManifest } from '@/core/tooling-engine/types';

export type ToolSitePageKind = 'privacy' | 'about';

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
        seoTitle: `${displayName} 隐私政策`,
        seoDescription: `${displayName} 的隐私说明，涵盖工具本地处理原则、站点 Cookie 使用、广告与统计披露以及联系方式。`,
        content: `### 适用范围

本页面适用于 **${displayName}** 网站及其当前提供的在线工具页面。

### 工具内容如何处理

- 正常使用本工具时，你输入的文本、截图素材、上传文件以及页面内编辑内容，默认优先在浏览器或本地设备中处理。
- 站点设计目标是不以保存用户创作内容为核心能力，也不会因为你正常使用工具而主动建立聊天内容档案或个人画像。
- 但这并不代表网站完全不接触任何技术性数据。为了保证网站正常运行，服务器、托管平台和第三方服务仍可能处理访问请求中附带的必要信息。

### 网站层面可能处理的信息

- 基本访问日志，例如 IP 地址、浏览器类型、访问时间、来源页面、错误日志等
- 为维持登录状态、偏好设置、风控或站点功能所需的必要 Cookie 或类似技术信息
- 当广告、统计或托管服务启用时，这些服务在其处理范围内收集的技术数据

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

### 我们不会以此为目的主动收集的内容

- 姓名、手机号、住址、身份证号等身份资料
- 你在工具中编辑的聊天文本、截图内容、上传图片或创作素材本身
- 与工具功能无关的敏感个人信息

### 联系我们

如果你主动发送邮件到 [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})，我们仅会在处理咨询、反馈或问题回复所必需的范围内使用你的邮箱和来信内容，不会将其出售或分享给无关第三方。

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
      seoTitle: `${displayName} Privacy Policy`,
      seoDescription: `Privacy details for ${displayName}, including local-first tool handling, cookie usage, advertising disclosures, analytics, and contact information.`,
      content: `### Scope

This page applies to the **${displayName}** website and its current tool pages.

### How tool content is handled

- When you use this tool normally, your text, uploaded assets, screenshots, and editing actions are intended to be handled locally in your browser or on your device whenever possible.
- The goal of the product is not to build personal profiles from the content you create inside the tool.
- However, that does not mean the website never touches any technical data. Hosting, security, diagnostics, and third-party services may still process limited request-level information needed to run the site.

### Website-level information that may be processed

- Basic access and diagnostic data such as IP address, browser type, timestamps, referrer, and error logs
- Necessary cookies or similar technologies used for site preferences, session state, abuse prevention, or feature delivery
- Technical data processed by analytics, hosting, or advertising services when those services are enabled

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

### Information we do not intentionally collect as product content

- Identity information such as your full name, phone number, address, or government ID
- Your chat content, screenshots, images, or other creative materials created inside the tool as a product data asset
- Sensitive personal information unrelated to the website's core function

### Contact

If you voluntarily email [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}), we only use your email address and message to respond to your inquiry, feedback, or support request. We do not sell or share that information with unrelated third parties.

### Independent developer notice

**${displayName}** is independently built and maintained. The goal is to keep the website practical, transparent, and respectful of user privacy while still allowing sustainable operation.

### Updates

If the website features, processing method, or contact details change, this page will be updated accordingly. By continuing to use the website, you acknowledge the current practices described here.`,
    };
  }

  if (isZh) {
    return {
      eyebrow: '关于我们',
      title: `关于 ${displayName}`,
      description: `${displayName} 是一个由个人开发者独立维护的工具网站，重点是把功能做得直接、清晰、易用，并通过透明的产品说明和合规的广告方式支持网站持续运营。`,
      seoTitle: `关于 ${displayName}`,
      seoDescription: `${displayName} 的关于我们页面，介绍网站定位、开发者方式和产品原则。`,
      content: `### 网站定位

**${displayName}** 是一个面向真实使用场景的在线工具页面，目标是让用户打开即可使用，不需要复杂学习成本。

${summary ? `> ${summary}` : '> 我们更关注工具本身是否足够直接、稳定、好用。'}

### 开发与维护方式

- 本网站由个人开发者独立开发、运营和维护
- 功能设计会优先考虑轻量、实用和可持续维护
- 页面内容会尽量保持准确、简洁，不做夸张承诺
- 网站可能通过合规广告、联盟合作或其他轻量商业化方式支持持续更新与服务器成本

### 产品原则

- **本地优先**：能在本地完成的处理尽量不上传
- **少收集信息**：正常使用工具时，不以收集用户资料为目标
- **透明说明**：对广告、隐私和联系方式尽量明确披露
- **持续迭代**：根据实际反馈持续改进体验和细节

### 联系方式

如果你有合作、反馈或问题，可以通过邮箱 [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}) 联系我。作为个人开发者，回复时间可能会有延迟，但通常会尽快处理。

### 说明

本页面用于说明网站的基本定位与维护方式，不构成额外承诺。若后续产品范围、功能结构或服务方式发生调整，页面内容也会同步更新。`,
    };
  }

  return {
    eyebrow: 'About',
    title: `About ${displayName}`,
    description: `${displayName} is an independently maintained website focused on simple, practical tools, with a product approach built around clarity, local-first handling where possible, and transparent monetization.`,
    seoTitle: `About ${displayName}`,
    seoDescription: `About page for ${displayName}, including the site purpose, maintenance model, and product principles.`,
    content: `### What this website is for

**${displayName}** is built as a practical web tool for real usage scenarios, with an emphasis on getting people from landing page to useful result as quickly as possible.

${summary ? `> ${summary}` : '> The main priority is making the tool clear, reliable, and easy to use.'}

### How it is maintained

- The website is independently built and maintained by a solo developer
- Features are designed with simplicity, usefulness, and long-term maintainability in mind
- Content is intended to stay clear and accurate without overstating what the product does
- The website may use compliant advertising, affiliate relationships, or other lightweight revenue models to support ongoing development and operating costs

### Product principles

- **Local first**: if something can stay on the device, that is preferred
- **Minimal data touch**: normal usage is not designed around collecting user information
- **Transparent disclosures**: privacy, advertising, and contact details should be clearly explained
- **Continuous improvement**: the product evolves through practical feedback and iteration

### Contact

For support, feedback, or collaboration, please email [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}). As an independent developer, response times may vary, but messages are reviewed as promptly as possible.

### Note

This page explains the general purpose and maintenance approach of the website. If the product scope, features, or service model changes in the future, the content here will be updated as well.`,
  };
}
