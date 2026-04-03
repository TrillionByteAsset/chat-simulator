// src/tools/chat-simulator/utils/exportDelivery.ts
'use client';

function isTabletOrMobileUserAgent(userAgent: string) {
  return /android|iphone|ipad|ipod|mobile|tablet|silk|kindle/i.test(userAgent);
}

function getPageLanguage() {
  if (
    typeof document !== 'undefined' &&
    typeof document.documentElement.lang === 'string'
  ) {
    return document.documentElement.lang.toLowerCase();
  }

  return 'en';
}

export function isHandheldDevice() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || '';
  const isTouchMac =
    navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

  return isTabletOrMobileUserAgent(userAgent) || isTouchMac;
}

function triggerDownload(file: File) {
  const objectUrl = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = file.name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function openPreviewPage(files: File[]) {
  if (typeof window === 'undefined') {
    return;
  }

  const pageLanguage = getPageLanguage();
  const isZh = pageLanguage.startsWith('zh');
  const previewItems = files.map((file) => ({
    name: file.name,
    type: file.type,
    url: URL.createObjectURL(file),
  }));

  if (previewItems.length === 1 && previewItems[0]?.type.startsWith('image/')) {
    window.location.assign(previewItems[0].url);
    return;
  }

  const objectUrlsJson = JSON.stringify(previewItems.map((item) => item.url));
  const previewHtml = `<!doctype html>
<html lang="${escapeHtml(pageLanguage)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${isZh ? '导出图片预览' : 'Exported Image Preview'}</title>
    <style>
      :root {
        color-scheme: light;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #0f172a;
        color: #e2e8f0;
      }
      .page {
        min-height: 100vh;
        padding: 18px 16px calc(28px + env(safe-area-inset-bottom));
      }
      .header {
        position: sticky;
        top: 0;
        z-index: 10;
        margin: -18px -16px 16px;
        padding: calc(14px + env(safe-area-inset-top)) 16px 14px;
        background: rgba(15, 23, 42, 0.92);
        backdrop-filter: blur(18px);
        border-bottom: 1px solid rgba(148, 163, 184, 0.18);
      }
      .title {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
      }
      .note {
        margin: 6px 0 0;
        font-size: 13px;
        line-height: 1.45;
        color: #cbd5e1;
      }
      .back {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-top: 12px;
        border: 0;
        border-radius: 999px;
        background: #2563eb;
        color: #fff;
        padding: 10px 14px;
        font-size: 14px;
        font-weight: 600;
      }
      .list {
        display: grid;
        gap: 16px;
      }
      .item {
        display: grid;
        gap: 10px;
      }
      .name {
        font-size: 13px;
        color: #cbd5e1;
        word-break: break-word;
      }
      img {
        display: block;
        width: 100%;
        height: auto;
        border-radius: 18px;
        background: #fff;
        box-shadow: 0 20px 48px rgba(15, 23, 42, 0.35);
      }
      a {
        color: #93c5fd;
        text-decoration: none;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <main class="page">
      <header class="header">
        <h1 class="title">${isZh ? '导出图片已生成' : 'Your export is ready'}</h1>
        <p class="note">${isZh ? '当前页面已经打开导出的图片。长按图片即可保存到手机。' : 'The exported image is now open on this page. Long-press any image to save it to your phone.'}</p>
        <button class="back" type="button" onclick="history.back()">${isZh ? '返回编辑器' : 'Back to editor'}</button>
      </header>
      <section class="list">
        ${previewItems
          .map(
            (item) => `<article class="item">
              <div class="name">${escapeHtml(item.name)}</div>
              ${
                item.type.startsWith('image/')
                  ? `<img src="${item.url}" alt="${escapeHtml(item.name)}" />`
                  : `<a href="${item.url}" download="${escapeHtml(item.name)}">${escapeHtml(item.name)}</a>`
              }
            </article>`
          )
          .join('')}
      </section>
    </main>
    <script>
      const objectUrls = ${objectUrlsJson};
      window.addEventListener('pagehide', () => {
        objectUrls.forEach((url) => URL.revokeObjectURL(url));
      });
    </script>
  </body>
</html>`;
  const previewBlob = new Blob([previewHtml], { type: 'text/html' });
  const previewUrl = URL.createObjectURL(previewBlob);
  window.location.assign(previewUrl);
}

export async function deliverExportedFile(file: File) {
  return deliverExportedFiles([file]);
}

export async function deliverExportedFiles(files: File[]) {
  if (files.length === 0) {
    return 'skipped';
  }

  if (isHandheldDevice()) {
    openPreviewPage(files);
    return 'opened';
  }

  for (const file of files) {
    triggerDownload(file);
    await new Promise((resolve) => window.setTimeout(resolve, 150));
  }

  return 'downloaded';
}
