// src/tools/chat-simulator/utils/exportToPng.ts
'use client';

const UNSUPPORTED_COLOR_FUNCTION_RE = /\b(?:oklab|oklch|lab|color-mix)\(/i;
const URL_FUNCTION_RE = /url\((['"]?)(.*?)\1\)/g;
const EXPORT_SAFE_FONT_STACK =
  '"Noto Sans","Helvetica Neue",Helvetica,Arial,sans-serif';
const TRANSPARENT_PIXEL_DATA_URL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const SAFE_STYLE_PROPERTIES = [
  'align-items',
  'align-self',
  'appearance',
  'background-attachment',
  'background-blend-mode',
  'background-clip',
  'background-color',
  'background-image',
  'background-origin',
  'background-position',
  'background-repeat',
  'background-size',
  'block-size',
  'border-bottom-color',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
  'border-bottom-style',
  'border-bottom-width',
  'border-collapse',
  'border-left-color',
  'border-left-style',
  'border-left-width',
  'border-right-color',
  'border-right-style',
  'border-right-width',
  'border-top-color',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-top-style',
  'border-top-width',
  'bottom',
  'box-shadow',
  'box-sizing',
  'color',
  'column-gap',
  'display',
  'fill',
  'flex-basis',
  'flex-direction',
  'flex-grow',
  'flex-shrink',
  'flex-wrap',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'gap',
  'grid-auto-columns',
  'grid-auto-flow',
  'grid-auto-rows',
  'grid-column-end',
  'grid-column-start',
  'grid-row-end',
  'grid-row-start',
  'grid-template-columns',
  'grid-template-rows',
  'height',
  'inline-size',
  'inset',
  'justify-content',
  'justify-self',
  'left',
  'letter-spacing',
  'line-height',
  'list-style-position',
  'list-style-type',
  'margin-bottom',
  'margin-left',
  'margin-right',
  'margin-top',
  'max-height',
  'max-width',
  'min-height',
  'min-width',
  'object-fit',
  'object-position',
  'opacity',
  'outline-color',
  'outline-offset',
  'outline-style',
  'outline-width',
  'overflow',
  'overflow-x',
  'overflow-y',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'padding-top',
  'place-content',
  'place-items',
  'pointer-events',
  'position',
  'right',
  'row-gap',
  'scrollbar-color',
  'stroke',
  'stroke-width',
  'text-align',
  'text-decoration',
  'text-decoration-color',
  'text-overflow',
  'text-shadow',
  'text-transform',
  'top',
  'transform',
  'transform-origin',
  'transition',
  'vertical-align',
  'visibility',
  'white-space',
  'width',
  'word-break',
  'word-wrap',
  'z-index',
] as const;
const COLOR_PROPERTIES = new Set([
  'background-color',
  'border-block-end-color',
  'border-block-start-color',
  'border-bottom-color',
  'border-inline-end-color',
  'border-inline-start-color',
  'border-left-color',
  'border-right-color',
  'border-top-color',
  'caret-color',
  'color',
  'fill',
  'outline-color',
  'stroke',
  'text-decoration-color',
]);
const SAFE_STYLE_PROPERTY_SET = new Set<string>(SAFE_STYLE_PROPERTIES);

export interface RenderElementToCanvasOptions {
  pixelRatio?: number;
  aspectRatio?: number | null;
  matteColor?: string;
}

const assetDataUrlCache = new Map<string, Promise<string | null>>();
let html2canvasModulePromise: Promise<typeof import('html2canvas')> | null = null;
let discordRoleBadgeMeasureContext: CanvasRenderingContext2D | null = null;

function normalizeColorValue(value: string): string {
  const probe = document.createElement('span');
  probe.style.color = value;
  document.body.appendChild(probe);
  const resolved = window.getComputedStyle(probe).color;
  probe.remove();
  return resolved || '';
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Failed to read export asset.'));
    };
    reader.onerror = () => reject(new Error('Failed to read export asset.'));
    reader.readAsDataURL(blob);
  });
}

function measureDiscordRoleBadgeWidth(label: string) {
  if (!discordRoleBadgeMeasureContext) {
    const canvas = document.createElement('canvas');
    discordRoleBadgeMeasureContext = canvas.getContext('2d');
  }

  const context = discordRoleBadgeMeasureContext;

  if (!context) {
    return 30;
  }

  context.font = '500 10px Arial, Helvetica, sans-serif';
  return Math.ceil(context.measureText(label).width);
}

function createDiscordRoleBadgeSvgElement(label: string) {
  const badgeHeight = 16;
  const badgeRadius = 4;
  const horizontalPadding = 6;
  const badgeWidth = Math.max(36, measureDiscordRoleBadgeWidth(label) + horizontalPadding * 2);
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');

  svg.setAttribute('xmlns', namespace);
  svg.setAttribute('width', `${badgeWidth}`);
  svg.setAttribute('height', `${badgeHeight}`);
  svg.setAttribute('viewBox', `0 0 ${badgeWidth} ${badgeHeight}`);
  svg.style.setProperty('display', 'block');
  svg.style.setProperty('width', `${badgeWidth}px`);
  svg.style.setProperty('height', `${badgeHeight}px`);

  const rect = document.createElementNS(namespace, 'rect');
  rect.setAttribute('x', '0');
  rect.setAttribute('y', '0');
  rect.setAttribute('width', `${badgeWidth}`);
  rect.setAttribute('height', `${badgeHeight}`);
  rect.setAttribute('rx', `${badgeRadius}`);
  rect.setAttribute('ry', `${badgeRadius}`);
  rect.setAttribute('fill', '#5865f2');

  const text = document.createElementNS(namespace, 'text');
  text.setAttribute('x', '50%');
  text.setAttribute('y', '50%');
  text.setAttribute('fill', '#ffffff');
  text.setAttribute('font-family', 'Arial, Helvetica, sans-serif');
  text.setAttribute('font-size', '10');
  text.setAttribute('font-weight', '500');
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('dominant-baseline', 'middle');
  text.textContent = label;

  svg.appendChild(rect);
  svg.appendChild(text);

  return { svg, badgeWidth, badgeHeight };
}

async function waitForImagesReady(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll<HTMLImageElement>('img'));

  if (images.length === 0) {
    return;
  }

  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete && image.naturalWidth > 0) {
            resolve();
            return;
          }

          const cleanup = () => {
            image.removeEventListener('load', handleLoad);
            image.removeEventListener('error', handleError);
          };

          const handleLoad = () => {
            cleanup();
            resolve();
          };

          const handleError = () => {
            cleanup();
            resolve();
          };

          image.addEventListener('load', handleLoad, { once: true });
          image.addEventListener('error', handleError, { once: true });

          window.setTimeout(() => {
            cleanup();
            resolve();
          }, 1500);
        })
    )
  );
}

async function convertAssetUrlToDataUrl(url: string) {
  if (!url || url.startsWith('data:') || url.startsWith('#')) {
    return url;
  }

  const cachedPromise = assetDataUrlCache.get(url);

  if (cachedPromise) {
    return cachedPromise;
  }

  const nextPromise = (async () => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to load export asset.');
      }

      const blob = await response.blob();
      return await blobToDataUrl(blob);
    } catch {
      return null;
    }
  })();

  assetDataUrlCache.set(url, nextPromise);
  return nextPromise;
}

async function inlineUrlFunctions(value: string) {
  const matches = Array.from(value.matchAll(URL_FUNCTION_RE));

  if (matches.length === 0) {
    return value;
  }

  let nextValue = value;

  for (const match of matches) {
    const rawUrl = match[2];

    if (!rawUrl) {
      continue;
    }

    const inlinedUrl = await convertAssetUrlToDataUrl(rawUrl);

    if (!inlinedUrl) {
      nextValue = nextValue.replace(match[0], 'none');
      continue;
    }

    nextValue = nextValue.replace(match[0], `url("${inlinedUrl}")`);
  }

  return nextValue;
}

async function sanitizeStyleValue(property: string, value: string) {
  let trimmed = value.trim();

  if (!trimmed || !UNSUPPORTED_COLOR_FUNCTION_RE.test(trimmed)) {
    if (trimmed.includes('url(')) {
      return await inlineUrlFunctions(trimmed);
    }

    return trimmed;
  }

  if (COLOR_PROPERTIES.has(property)) {
    trimmed = normalizeColorValue(trimmed);
  } else {
    return '';
  }

  if (trimmed.includes('url(')) {
    return await inlineUrlFunctions(trimmed);
  }

  return trimmed;
}

async function normalizeStylePropertyValue(property: string, value: string) {
  const probe = document.createElement('div');
  document.body.appendChild(probe);
  probe.style.setProperty(property, value);
  const normalizedValue = window.getComputedStyle(probe).getPropertyValue(property).trim();
  probe.remove();
  return normalizedValue;
}

async function copyComputedStyles(source: Element, clone: Element) {
  const computedStyle = window.getComputedStyle(source);
  const cloneStyle = (clone as HTMLElement | SVGElement).style;

  for (const property of SAFE_STYLE_PROPERTIES) {
    const sanitizedValue = await sanitizeStyleValue(property, computedStyle.getPropertyValue(property));

    if (!sanitizedValue) {
      continue;
    }

    cloneStyle.setProperty(property, sanitizedValue, computedStyle.getPropertyPriority(property));
  }

  cloneStyle.setProperty('box-sizing', computedStyle.boxSizing);
  cloneStyle.setProperty('font-family', EXPORT_SAFE_FONT_STACK);

  if (source instanceof HTMLElement && clone instanceof HTMLElement) {
    clone.scrollTop = source.scrollTop;
    clone.scrollLeft = source.scrollLeft;
  }

  if (source instanceof HTMLInputElement && clone instanceof HTMLInputElement) {
    clone.value = source.value;
    clone.setAttribute('value', source.value);
  }

  if (source instanceof HTMLTextAreaElement && clone instanceof HTMLTextAreaElement) {
    clone.value = source.value;
    clone.textContent = source.value;
  }

  if (source instanceof HTMLImageElement && clone instanceof HTMLImageElement) {
    const imageSrc = source.currentSrc || source.src;
    const inlinedImageSrc = await convertAssetUrlToDataUrl(imageSrc);

    if (inlinedImageSrc) {
      clone.src = inlinedImageSrc;
      clone.removeAttribute('srcset');
    } else {
      clone.src = TRANSPARENT_PIXEL_DATA_URL;
      clone.removeAttribute('srcset');
      cloneStyle.setProperty('background-color', computedStyle.backgroundColor || '#2b2d31');
    }
  }
}

async function sanitizeInlineStyles(root: HTMLElement) {
  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement | SVGElement>('*'))];

  for (const element of elements) {
    const style = (element as HTMLElement | SVGElement).style;

    for (const property of Array.from(style)) {
      if (property.startsWith('--') || !SAFE_STYLE_PROPERTY_SET.has(property)) {
        style.removeProperty(property);
        continue;
      }

      const currentValue = style.getPropertyValue(property).trim();

      if (!currentValue) {
        style.removeProperty(property);
        continue;
      }

      if (!UNSUPPORTED_COLOR_FUNCTION_RE.test(currentValue)) {
        continue;
      }

      const normalizedValue = await normalizeStylePropertyValue(property, currentValue);

      if (!normalizedValue || UNSUPPORTED_COLOR_FUNCTION_RE.test(normalizedValue)) {
        style.removeProperty(property);
        continue;
      }

      style.setProperty(property, normalizedValue, style.getPropertyPriority(property));
    }

    if (element instanceof HTMLElement) {
      element.removeAttribute('class');
    }
  }
}

function applyExportLayoutFixups(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-export-header="true"]').forEach((header) => {
    header.style.setProperty('height', 'auto');
    header.style.setProperty('min-height', 'unset');
    header.style.setProperty('padding-top', '8px');
    header.style.setProperty('padding-bottom', '8px');
    header.style.setProperty('overflow', 'visible');
  });

  root.querySelectorAll<HTMLElement>('[data-export-header-copy="true"]').forEach((copy) => {
    copy.style.setProperty('min-width', '0');
    copy.style.setProperty('overflow', 'visible');
  });

  root.querySelectorAll<HTMLElement>('[data-export-header-title="true"], [data-export-header-subtitle="true"]').forEach((textNode) => {
    textNode.style.setProperty('white-space', 'normal');
    textNode.style.setProperty('overflow', 'visible');
    textNode.style.setProperty('text-overflow', 'clip');
  });

  root.querySelectorAll<HTMLElement>('[data-export-header-subtitle="true"]').forEach((subtitle) => {
    subtitle.style.setProperty('margin-top', '2px');
    subtitle.style.setProperty('line-height', '1.3');
  });

  root.querySelectorAll<HTMLElement>('[data-export-discord-intro="true"]').forEach((intro) => {
    intro.style.setProperty('margin-top', '10px');
  });

  root.querySelectorAll<HTMLElement>('[data-export-discord-meta-row="true"]').forEach((row) => {
    row.style.setProperty('display', 'flex');
    row.style.setProperty('align-items', 'center');
    row.style.setProperty('column-gap', '8px');
    row.style.setProperty('row-gap', '0');
    row.style.setProperty('flex-wrap', 'nowrap');
    row.style.setProperty('min-height', '18px');
  });

  root.querySelectorAll<HTMLElement>('[data-export-discord-name="true"]').forEach((name) => {
    name.style.setProperty('display', 'inline-block');
  });

  root.querySelectorAll<HTMLElement>('[data-export-discord-timestamp="true"]').forEach((timestamp) => {
    timestamp.style.setProperty('display', 'inline-block');
  });

  root.querySelectorAll<HTMLElement>('[data-export-discord-role="true"]').forEach((role) => {
    const label = role.textContent?.trim();

    if (!label) {
      return;
    }

    const { svg, badgeWidth, badgeHeight } = createDiscordRoleBadgeSvgElement(label);
    const badgeWrapper = document.createElement('span');
    badgeWrapper.style.setProperty('display', 'inline-block');
    badgeWrapper.style.setProperty('width', `${badgeWidth}px`);
    badgeWrapper.style.setProperty('height', `${badgeHeight}px`);
    badgeWrapper.style.setProperty('min-width', `${badgeWidth}px`);
    badgeWrapper.style.setProperty('min-height', `${badgeHeight}px`);
    badgeWrapper.style.setProperty('align-self', 'center');
    badgeWrapper.style.setProperty('flex', '0 0 auto');
    badgeWrapper.style.setProperty('vertical-align', 'middle');
    badgeWrapper.style.setProperty('transform', 'translateY(6px)');
    badgeWrapper.appendChild(svg);

    role.replaceWith(badgeWrapper);
  });
}

async function buildStyledClone(sourceRoot: HTMLElement): Promise<HTMLElement> {
  const cloneRoot = sourceRoot.cloneNode(true) as HTMLElement;
  const sourceElements = [sourceRoot, ...Array.from(sourceRoot.querySelectorAll('*'))];
  const cloneElements = [cloneRoot, ...Array.from(cloneRoot.querySelectorAll('*'))];

  for (const [index, sourceElement] of sourceElements.entries()) {
    const cloneElement = cloneElements[index];

    if (!cloneElement) {
      continue;
    }

    await copyComputedStyles(sourceElement, cloneElement);
  }

  cloneRoot.querySelectorAll<HTMLElement>('[data-export-hide="true"]').forEach((element) => {
    element.remove();
  });

  await sanitizeInlineStyles(cloneRoot);
  applyExportLayoutFixups(cloneRoot);

  return cloneRoot;
}

async function getHtml2Canvas() {
  if (!html2canvasModulePromise) {
    html2canvasModulePromise = import('html2canvas');
  }

  const module = await html2canvasModulePromise;
  return module.default;
}

function createSandboxIframe(width: number, height: number) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.tabIndex = -1;
  iframe.style.position = 'fixed';
  iframe.style.left = '-100000px';
  iframe.style.top = '0';
  iframe.style.width = `${width}px`;
  iframe.style.height = `${height}px`;
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const iframeDocument = iframe.contentDocument;

  if (!iframeDocument) {
    iframe.remove();
    throw new Error('Failed to initialize export sandbox.');
  }

  iframeDocument.open();
  iframeDocument.write(
    '<!doctype html><html><head><meta charset="utf-8" /></head><body style="margin:0;background:transparent;overflow:hidden;"></body></html>'
  );
  iframeDocument.close();

  return iframe;
}

function applyAspectRatioToCanvas(
  sourceCanvas: HTMLCanvasElement,
  aspectRatio: number | null | undefined,
  matteColor: string
) {
  if (!aspectRatio) {
    return sourceCanvas;
  }

  const sourceRatio = sourceCanvas.width / sourceCanvas.height;

  if (Math.abs(sourceRatio - aspectRatio) < 0.01) {
    return sourceCanvas;
  }

  let targetWidth = sourceCanvas.width;
  let targetHeight = sourceCanvas.height;

  if (sourceRatio > aspectRatio) {
    targetHeight = Math.round(sourceCanvas.width / aspectRatio);
  } else {
    targetWidth = Math.round(sourceCanvas.height * aspectRatio);
  }

  const targetCanvas = document.createElement('canvas');
  targetCanvas.width = targetWidth;
  targetCanvas.height = targetHeight;
  const context = targetCanvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to initialize export ratio canvas.');
  }

  context.fillStyle = matteColor;
  context.fillRect(0, 0, targetWidth, targetHeight);

  const offsetX = Math.round((targetWidth - sourceCanvas.width) / 2);
  const offsetY = Math.round((targetHeight - sourceCanvas.height) / 2);
  context.drawImage(sourceCanvas, offsetX, offsetY, sourceCanvas.width, sourceCanvas.height);

  return targetCanvas;
}

export async function renderElementToCanvas(
  node: HTMLElement,
  options: RenderElementToCanvasOptions = {}
) {
  await document.fonts.ready;

  const rect = node.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const pixelRatio = options.pixelRatio ?? Math.max(2, window.devicePixelRatio || 1);
  const clone = await buildStyledClone(node);
  const iframe = createSandboxIframe(width, height);
  const iframeDocument = iframe.contentDocument;

  if (!iframeDocument) {
    iframe.remove();
    throw new Error('Failed to initialize export sandbox.');
  }

  try {
    iframeDocument.body.appendChild(clone);
    await waitForImagesReady(clone);
    const html2canvas = await getHtml2Canvas();
    const canvas = await html2canvas(clone, {
      backgroundColor: null,
      scale: pixelRatio,
      useCORS: true,
      allowTaint: false,
      logging: false,
      width,
      height,
      windowWidth: width,
      windowHeight: height,
    });

    return applyAspectRatioToCanvas(canvas, options.aspectRatio, options.matteColor || '#111214');
  } finally {
    iframe.remove();
  }
}

export async function exportElementToPngBlob(
  node: HTMLElement,
  options: RenderElementToCanvasOptions = {}
) {
  const canvas = await renderElementToCanvas(node, options);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create PNG blob.'));
        return;
      }

      resolve(blob);
    }, 'image/png');
  });
}
