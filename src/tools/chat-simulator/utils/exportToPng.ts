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
  renderWidth?: number | null;
  renderHeight?: number | null;
  captureFullContent?: boolean;
}

const assetDataUrlCache = new Map<string, Promise<string | null>>();
let html2canvasModulePromise: Promise<typeof import('html2canvas')> | null =
  null;
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
  const badgeWidth = Math.max(
    36,
    measureDiscordRoleBadgeWidth(label) + horizontalPadding * 2
  );
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
  const normalizedValue = window
    .getComputedStyle(probe)
    .getPropertyValue(property)
    .trim();
  probe.remove();
  return normalizedValue;
}

async function copyComputedStyles(source: Element, clone: Element) {
  const computedStyle = window.getComputedStyle(source);
  const cloneStyle = (clone as HTMLElement | SVGElement).style;

  for (const property of SAFE_STYLE_PROPERTIES) {
    const sanitizedValue = await sanitizeStyleValue(
      property,
      computedStyle.getPropertyValue(property)
    );

    if (!sanitizedValue) {
      continue;
    }

    cloneStyle.setProperty(
      property,
      sanitizedValue,
      computedStyle.getPropertyPriority(property)
    );
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

  if (
    source instanceof HTMLTextAreaElement &&
    clone instanceof HTMLTextAreaElement
  ) {
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
      cloneStyle.setProperty(
        'background-color',
        computedStyle.backgroundColor || '#2b2d31'
      );
    }
  }
}

async function sanitizeInlineStyles(root: HTMLElement) {
  const elements = [
    root,
    ...Array.from(root.querySelectorAll<HTMLElement | SVGElement>('*')),
  ];

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

      const normalizedValue = await normalizeStylePropertyValue(
        property,
        currentValue
      );

      if (
        !normalizedValue ||
        UNSUPPORTED_COLOR_FUNCTION_RE.test(normalizedValue)
      ) {
        style.removeProperty(property);
        continue;
      }

      style.setProperty(
        property,
        normalizedValue,
        style.getPropertyPriority(property)
      );
    }

    if (element instanceof HTMLElement) {
      element.removeAttribute('class');
    }
  }
}

function applyExportLayoutFixups(root: HTMLElement) {
  root
    .querySelectorAll<HTMLElement>('[data-export-header="true"]')
    .forEach((header) => {
      const platform = header.dataset.exportPlatform;

      header.style.setProperty('overflow', 'visible');

      if (platform === 'discord') {
        header.style.setProperty('height', 'auto');
        header.style.setProperty('min-height', '60px');
        header.style.setProperty('max-height', 'none');
        header.style.setProperty('display', 'flex');
        header.style.setProperty('justify-content', 'space-between');
        header.style.setProperty('align-items', 'center');
        header.style.setProperty('padding-top', '6px');
        header.style.setProperty('padding-bottom', '6px');
        return;
      }

      header.style.setProperty('height', 'auto');
      header.style.setProperty('min-height', '60px');
      header.style.setProperty('max-height', 'none');
      header.style.setProperty('align-items', 'center');
      header.style.setProperty('padding-top', '10px');
      header.style.setProperty('padding-bottom', '10px');
    });

  root
    .querySelectorAll<HTMLElement>('[data-export-header-copy="true"]')
    .forEach((copy) => {
      copy.style.setProperty('min-width', '0');
      copy.style.setProperty('height', 'auto');
      copy.style.setProperty('min-height', '0');
      copy.style.setProperty('max-height', 'none');
      copy.style.setProperty('overflow-x', 'hidden');
      copy.style.setProperty('overflow-y', 'visible');
      copy.style.setProperty('flex', '1 1 auto');
    });

  root
    .querySelectorAll<HTMLElement>('[data-export-discord-header-row="true"]')
    .forEach((row) => {
      row.style.setProperty('display', 'grid');
      row.style.setProperty('grid-template-columns', 'auto auto minmax(0, 1fr)');
      row.style.setProperty('align-items', 'center');
      row.style.setProperty('flex-wrap', 'nowrap');
      row.style.setProperty('min-width', '0');
      row.style.setProperty('width', '100%');
      row.style.setProperty('height', 'auto');
      row.style.setProperty('min-height', '0');
      row.style.setProperty('max-height', 'none');
      row.style.setProperty('column-gap', '8px');
      row.style.setProperty('overflow', 'visible');
    });

  root
    .querySelectorAll<HTMLElement>('[data-export-header-title="true"]')
    .forEach((title) => {
      const isDiscordHeader = getExportHeaderPlatform(title) === 'discord';
      title.style.setProperty('display', 'block');
      title.style.setProperty('min-width', '0');
      title.style.setProperty('height', 'auto');
      title.style.setProperty('min-height', '0');
      title.style.setProperty('max-height', 'none');
      title.style.setProperty('overflow', 'hidden');
      title.style.setProperty('white-space', 'nowrap');
      title.style.setProperty('text-overflow', 'ellipsis');
      title.style.setProperty('line-height', isDiscordHeader ? '1.2' : '1.35');
      if (isDiscordHeader) {
        title.style.setProperty('display', 'inline-flex');
        title.style.setProperty('align-items', 'center');
        title.style.setProperty('flex', '0 1 auto');
        title.style.setProperty('max-width', 'min(48%, 320px)');
        title.style.setProperty('padding-top', '2px');
        title.style.setProperty('padding-bottom', '2px');

        const hash = title.querySelector<HTMLElement>('span');

        if (hash) {
          hash.style.setProperty('display', 'inline-flex');
          hash.style.setProperty('align-items', 'center');
          hash.style.setProperty('line-height', '1.2');
        }
      }
    });

  root
    .querySelectorAll<HTMLElement>('[data-export-header-subtitle="true"]')
    .forEach((subtitle) => {
      const isDiscordHeader = getExportHeaderPlatform(subtitle) === 'discord';
      subtitle.style.setProperty('display', 'block');
      subtitle.style.setProperty('min-width', '0');
      subtitle.style.setProperty('height', 'auto');
      subtitle.style.setProperty('min-height', '0');
      subtitle.style.setProperty('max-height', 'none');
      subtitle.style.setProperty('overflow', 'hidden');
      subtitle.style.setProperty('white-space', 'nowrap');
      subtitle.style.setProperty('text-overflow', 'ellipsis');
      subtitle.style.setProperty('line-height', isDiscordHeader ? '1.2' : '1.35');
      subtitle.style.setProperty('margin-top', isDiscordHeader ? '0' : '2px');
      if (isDiscordHeader) {
        subtitle.style.setProperty('flex', '1 1 auto');
        subtitle.style.setProperty('align-self', 'center');
        subtitle.style.setProperty('max-width', '100%');
        subtitle.style.setProperty('padding-top', '2px');
        subtitle.style.setProperty('padding-bottom', '2px');
      }
    });

  root
    .querySelectorAll<HTMLElement>('[data-export-discord-intro="true"]')
    .forEach((intro) => {
      intro.style.setProperty('margin-top', '10px');
    });

  root
    .querySelectorAll<HTMLElement>('[data-export-discord-meta-row="true"]')
    .forEach((row) => {
      row.style.setProperty('display', 'flex');
      row.style.setProperty('align-items', 'center');
      row.style.setProperty('column-gap', '8px');
      row.style.setProperty('row-gap', '0');
      row.style.setProperty('flex-wrap', 'nowrap');
      row.style.setProperty('min-height', '18px');
    });

  root
    .querySelectorAll<HTMLElement>('[data-export-discord-name="true"]')
    .forEach((name) => {
      name.style.setProperty('display', 'inline-block');
    });

  root
    .querySelectorAll<HTMLElement>('[data-export-discord-timestamp="true"]')
    .forEach((timestamp) => {
      timestamp.style.setProperty('display', 'inline-block');
    });

  root
    .querySelectorAll<HTMLElement>('[data-export-discord-role="true"]')
    .forEach((role) => {
      const label = role.textContent?.trim();

      if (!label) {
        return;
      }

      const { svg, badgeWidth, badgeHeight } =
        createDiscordRoleBadgeSvgElement(label);
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

function expandCloneForFullContent(root: HTMLElement) {
  root
    .querySelectorAll<HTMLElement>('[data-export-capture-root="true"]')
    .forEach((element) => {
      element.style.setProperty('height', 'auto');
      element.style.setProperty('min-height', '0');
      element.style.setProperty('max-height', 'none');
      element.style.setProperty('overflow', 'visible');
      element.scrollTop = 0;
    });

  root
    .querySelectorAll<HTMLElement>('[data-export-chat-container="true"]')
    .forEach((element) => {
      element.style.setProperty('height', 'auto');
      element.style.setProperty('min-height', '0');
      element.style.setProperty('max-height', 'none');
      element.style.setProperty('overflow', 'visible');
      element.style.setProperty('flex', 'none');
      element.scrollTop = 0;
    });

  root
    .querySelectorAll<HTMLElement>('[data-export-message-list="true"]')
    .forEach((element) => {
      element.style.setProperty('height', 'auto');
      element.style.setProperty('min-height', '0');
      element.style.setProperty('max-height', 'none');
      element.style.setProperty('overflow', 'visible');
      element.style.setProperty('overflow-y', 'visible');
      element.style.setProperty('flex', 'none');
      element.scrollTop = 0;
    });
}

function getExpandedCloneHeight(root: HTMLElement, fallbackHeight: number) {
  const candidates = [
    fallbackHeight,
    root.scrollHeight,
    root.offsetHeight,
    Math.ceil(root.getBoundingClientRect().height),
  ].filter((value) => Number.isFinite(value) && value > 0);

  root
    .querySelectorAll<HTMLElement>('[data-export-message-list="true"]')
    .forEach((element) => {
      candidates.push(
        element.scrollHeight,
        element.offsetHeight,
        Math.ceil(element.getBoundingClientRect().height)
      );
    });

  return Math.max(...candidates);
}

function truncateTextToFitSingleLine(element: HTMLElement) {
  const originalText = element.textContent?.trim();

  if (!originalText) {
    return;
  }

  element.textContent = originalText;

  const availableWidth = Math.floor(
    element.clientWidth ||
      element.getBoundingClientRect().width ||
      element.parentElement?.clientWidth ||
      0
  );

  if (availableWidth <= 0 || element.scrollWidth <= availableWidth + 1) {
    return;
  }

  let low = 0;
  let high = originalText.length;
  let best = '...';

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate =
      mid <= 0 ? '...' : `${originalText.slice(0, mid).trimEnd()}...`;

    element.textContent = candidate;

    if (element.scrollWidth <= availableWidth + 1) {
      best = candidate;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  element.textContent = best;
}

function getExportHeaderPlatform(node: HTMLElement) {
  return (
    node.closest<HTMLElement>('[data-export-header="true"]')?.dataset
      .exportPlatform ?? ''
  );
}

function getDiscordHeaderTitleText(titleSource: HTMLElement) {
  const explicitLabel = titleSource.querySelector<HTMLElement>(
    '[data-export-discord-header-label="true"]'
  );

  if (explicitLabel) {
    return explicitLabel.textContent?.trim().replace(/^#+\s*/, '') ?? '';
  }

  const clone = titleSource.cloneNode(true) as HTMLElement;
  const firstChild = clone.firstElementChild;

  if (firstChild) {
    firstChild.remove();
  }

  return clone.textContent?.trim().replace(/^#+\s*/, '') ?? '';
}

function rebuildDiscordExportHeader(header: HTMLElement) {
  if (header.dataset.exportHeaderRebuilt === 'true') {
    return;
  }

  const copy = header.querySelector<HTMLElement>('[data-export-header-copy="true"]');
  const titleSource = header.querySelector<HTMLElement>(
    '[data-export-header-title="true"]'
  );
  const subtitleSource = header.querySelector<HTMLElement>(
    '[data-export-header-subtitle="true"]'
  );

  if (!copy || !titleSource) {
    return;
  }

  const titleText = getDiscordHeaderTitleText(titleSource);
  const subtitleText = subtitleSource?.textContent?.trim() ?? '';
  const documentRef = header.ownerDocument;
  const row = documentRef.createElement('div');
  const title = documentRef.createElement('span');
  const hash = documentRef.createElement('span');
  const dot = documentRef.createElement('span');
  const titleTextNode = documentRef.createElement('span');
  const subtitle = documentRef.createElement('span');

  row.setAttribute('data-export-discord-header-row', 'true');
  row.style.setProperty('display', 'flex');
  row.style.setProperty('align-items', 'center');
  row.style.setProperty('column-gap', '8px');
  row.style.setProperty('width', '100%');
  row.style.setProperty('min-width', '0');
  row.style.setProperty('min-height', '52px');
  row.style.setProperty('height', 'auto');

  title.setAttribute('data-export-header-title', 'true');
  title.style.setProperty('display', 'inline-flex');
  title.style.setProperty('align-items', 'center');
  title.style.setProperty('min-width', '0');
  title.style.setProperty('flex', '0 1 auto');
  title.style.setProperty('max-width', 'min(48%, 320px)');
  title.style.setProperty('font-size', '1rem');
  title.style.setProperty('font-weight', '700');
  title.style.setProperty('line-height', '1.2');
  title.style.setProperty('color', '#f2f3f5');
  title.style.setProperty('white-space', 'nowrap');
  title.style.setProperty('overflow-x', 'hidden');
  title.style.setProperty('overflow-y', 'visible');
  title.style.setProperty('text-overflow', 'ellipsis');
  title.style.setProperty('padding-top', '2px');
  title.style.setProperty('padding-bottom', '2px');

  hash.style.setProperty('display', 'inline-flex');
  hash.style.setProperty('align-items', 'center');
  hash.style.setProperty('margin-right', '6px');
  hash.style.setProperty('font-size', '1rem');
  hash.style.setProperty('font-weight', '500');
  hash.style.setProperty('line-height', '1.2');
  hash.style.setProperty('color', '#949ba4');
  hash.textContent = '#';

  dot.style.setProperty('display', 'inline-flex');
  dot.style.setProperty('align-items', 'center');
  dot.style.setProperty('flex', '0 0 auto');
  dot.style.setProperty('font-size', '1.1rem');
  dot.style.setProperty('font-weight', '900');
  dot.style.setProperty('line-height', '1');
  dot.style.setProperty('color', '#7b7d86');
  dot.textContent = '·';

  titleTextNode.className = 'ds-discord-header-title-text';
  titleTextNode.style.setProperty('display', 'block');
  titleTextNode.style.setProperty('min-width', '0');
  titleTextNode.style.setProperty('max-width', '100%');
  titleTextNode.style.setProperty('overflow-x', 'hidden');
  titleTextNode.style.setProperty('overflow-y', 'visible');
  titleTextNode.style.setProperty('text-overflow', 'ellipsis');
  titleTextNode.style.setProperty('white-space', 'nowrap');
  titleTextNode.style.setProperty('line-height', '1.2');
  titleTextNode.textContent = titleText;

  subtitle.setAttribute('data-export-header-subtitle', 'true');
  subtitle.style.setProperty('display', 'block');
  subtitle.style.setProperty('min-width', '0');
  subtitle.style.setProperty('flex', '1 1 auto');
  subtitle.style.setProperty('max-width', '100%');
  subtitle.style.setProperty('font-size', '0.75rem');
  subtitle.style.setProperty('font-weight', '400');
  subtitle.style.setProperty('line-height', '1.2');
  subtitle.style.setProperty('color', '#949ba4');
  subtitle.style.setProperty('white-space', 'nowrap');
  subtitle.style.setProperty('overflow-x', 'hidden');
  subtitle.style.setProperty('overflow-y', 'visible');
  subtitle.style.setProperty('text-overflow', 'ellipsis');
  subtitle.style.setProperty('padding-top', '2px');
  subtitle.style.setProperty('padding-bottom', '2px');
  subtitle.textContent = subtitleText;

  title.appendChild(hash);
  title.appendChild(titleTextNode);
  row.appendChild(title);
  row.appendChild(dot);
  row.appendChild(subtitle);

  copy.style.setProperty('display', 'flex');
  copy.style.setProperty('align-items', 'center');
  copy.style.setProperty('min-width', '0');
  copy.style.setProperty('flex', '1 1 auto');
  copy.style.setProperty('width', '100%');
  copy.style.setProperty('overflow-x', 'hidden');
  copy.style.setProperty('overflow-y', 'visible');
  copy.replaceChildren(row);
  header.dataset.exportHeaderRebuilt = 'true';
}

function rebuildStackedExportHeader(
  header: HTMLElement,
  options: {
    titleColor: string;
    subtitleColor: string;
    titleFontSize: string;
    subtitleFontSize: string;
    minHeight: string;
  }
) {
  if (header.dataset.exportHeaderRebuilt === 'true') {
    return;
  }

  const copy = header.querySelector<HTMLElement>('[data-export-header-copy="true"]');
  const titleSource = header.querySelector<HTMLElement>(
    '[data-export-header-title="true"]'
  );
  const subtitleSource = header.querySelector<HTMLElement>(
    '[data-export-header-subtitle="true"]'
  );

  if (!copy || !titleSource) {
    return;
  }

  const titleText = titleSource.textContent?.trim() ?? '';
  const subtitleText = subtitleSource?.textContent?.trim() ?? '';
  const documentRef = header.ownerDocument;
  const stack = documentRef.createElement('div');
  const title = documentRef.createElement('span');
  const subtitle = documentRef.createElement('span');

  stack.style.setProperty('display', 'flex');
  stack.style.setProperty('flex-direction', 'column');
  stack.style.setProperty('justify-content', 'center');
  stack.style.setProperty('row-gap', '2px');
  stack.style.setProperty('min-width', '0');
  stack.style.setProperty('width', '100%');
  stack.style.setProperty('min-height', options.minHeight);

  title.setAttribute('data-export-header-title', 'true');
  title.style.setProperty('display', 'block');
  title.style.setProperty('min-width', '0');
  title.style.setProperty('font-size', options.titleFontSize);
  title.style.setProperty('font-weight', '700');
  title.style.setProperty('line-height', '1.2');
  title.style.setProperty('color', options.titleColor);
  title.style.setProperty('white-space', 'nowrap');
  title.textContent = titleText;

  subtitle.setAttribute('data-export-header-subtitle', 'true');
  subtitle.style.setProperty('display', 'block');
  subtitle.style.setProperty('min-width', '0');
  subtitle.style.setProperty('font-size', options.subtitleFontSize);
  subtitle.style.setProperty('font-weight', '400');
  subtitle.style.setProperty('line-height', '1.2');
  subtitle.style.setProperty('color', options.subtitleColor);
  subtitle.style.setProperty('white-space', 'nowrap');
  subtitle.textContent = subtitleText;

  stack.appendChild(title);
  stack.appendChild(subtitle);

  copy.style.setProperty('display', 'flex');
  copy.style.setProperty('align-items', 'center');
  copy.style.setProperty('min-width', '0');
  copy.style.setProperty('flex', '1 1 auto');
  copy.replaceChildren(stack);
  header.dataset.exportHeaderRebuilt = 'true';
}

function finalizeExportHeaderText(root: HTMLElement) {
  root
    .querySelectorAll<HTMLElement>('[data-export-header="true"]')
    .forEach((header) => {
      const platform = header.dataset.exportPlatform;

      if (platform === 'discord') {
        return;
      }

      if (platform === 'whatsapp') {
        rebuildStackedExportHeader(header, {
          titleColor: '#111b21',
          subtitleColor: '#667781',
          titleFontSize: '1rem',
          subtitleFontSize: '0.75rem',
          minHeight: '40px',
        });
        return;
      }

      if (platform === 'telegram') {
        rebuildStackedExportHeader(header, {
          titleColor: '#0f1721',
          subtitleColor: '#97a3ae',
          titleFontSize: '1.05rem',
          subtitleFontSize: '0.9rem',
          minHeight: '48px',
        });
      }
    });

  root
    .querySelectorAll<HTMLElement>('[data-export-header-subtitle="true"]')
    .forEach((subtitle) => {
      truncateTextToFitSingleLine(subtitle);
    });

  root
    .querySelectorAll<HTMLElement>('[data-export-header-title="true"]')
    .forEach((title) => {
      if (getExportHeaderPlatform(title) !== 'discord') {
        truncateTextToFitSingleLine(title);
      }
    });
}

async function buildStyledClone(sourceRoot: HTMLElement): Promise<HTMLElement> {
  const cloneRoot = sourceRoot.cloneNode(true) as HTMLElement;
  const sourceElements = [
    sourceRoot,
    ...Array.from(sourceRoot.querySelectorAll('*')),
  ];
  const cloneElements = [
    cloneRoot,
    ...Array.from(cloneRoot.querySelectorAll('*')),
  ];

  for (const [index, sourceElement] of sourceElements.entries()) {
    const cloneElement = cloneElements[index];

    if (!cloneElement) {
      continue;
    }

    await copyComputedStyles(sourceElement, cloneElement);
  }

  cloneRoot
    .querySelectorAll<HTMLElement>('[data-export-hide="true"]')
    .forEach((element) => {
      element.remove();
    });

  await sanitizeInlineStyles(cloneRoot);
  applyExportLayoutFixups(cloneRoot);

  return cloneRoot;
}

async function createLayoutSource(
  sourceRoot: HTMLElement,
  width: number,
  height: number
) {
  const wrapper = document.createElement('div');
  const themeRoot = sourceRoot.closest<HTMLElement>(
    '.tool-root-chat-simulator'
  );
  const themeShell = document.createElement('div');
  wrapper.style.setProperty('position', 'fixed');
  wrapper.style.setProperty('left', '-100000px');
  wrapper.style.setProperty('top', '0');
  wrapper.style.setProperty('width', `${width}px`);
  wrapper.style.setProperty('height', `${height}px`);
  wrapper.style.setProperty('overflow', 'hidden');
  wrapper.style.setProperty('opacity', '0');
  wrapper.style.setProperty('pointer-events', 'none');
  wrapper.style.setProperty('z-index', '-1');
  wrapper.style.setProperty('contain', 'layout paint style');
  themeShell.className = themeRoot?.className || '';
  themeShell.style.setProperty('width', `${width}px`);
  themeShell.style.setProperty('height', `${height}px`);
  themeShell.style.setProperty('overflow', 'hidden');

  const layoutSource = sourceRoot.cloneNode(true) as HTMLElement;
  layoutSource.style.setProperty('width', `${width}px`);
  layoutSource.style.setProperty('min-width', `${width}px`);
  layoutSource.style.setProperty('max-width', `${width}px`);
  layoutSource.style.setProperty('height', `${height}px`);
  layoutSource.style.setProperty('min-height', `${height}px`);
  layoutSource.style.setProperty('max-height', `${height}px`);
  layoutSource.style.setProperty('flex', 'none');

  themeShell.appendChild(layoutSource);
  wrapper.appendChild(themeShell);
  document.body.appendChild(wrapper);
  await waitForImagesReady(layoutSource);
  await new Promise((resolve) =>
    window.requestAnimationFrame(() => resolve(null))
  );
  await new Promise((resolve) =>
    window.requestAnimationFrame(() => resolve(null))
  );

  return {
    layoutSource,
    cleanup: () => wrapper.remove(),
  };
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
  context.drawImage(
    sourceCanvas,
    offsetX,
    offsetY,
    sourceCanvas.width,
    sourceCanvas.height
  );

  return targetCanvas;
}

function isTransparentBackground(value: string) {
  return (
    !value ||
    value === 'transparent' ||
    value === 'rgba(0, 0, 0, 0)' ||
    value === 'rgba(0,0,0,0)'
  );
}

function getExportBackdropColor(node: HTMLElement) {
  let current: HTMLElement | null = node.parentElement;

  while (current) {
    const backgroundColor = window.getComputedStyle(current).backgroundColor;

    if (!isTransparentBackground(backgroundColor)) {
      return backgroundColor;
    }

    current = current.parentElement;
  }

  return '#ffffff';
}

function getNodeCornerRadius(node: HTMLElement) {
  const computed = window.getComputedStyle(node);
  const radiusValues = [
    computed.borderTopLeftRadius,
    computed.borderTopRightRadius,
    computed.borderBottomRightRadius,
    computed.borderBottomLeftRadius,
  ]
    .map((value) => Number.parseFloat(value))
    .filter((value) => Number.isFinite(value));

  return radiusValues.length > 0 ? Math.max(...radiusValues) : 0;
}

function addRoundedRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const clampedRadius = Math.max(0, Math.min(radius, width / 2, height / 2));

  context.beginPath();
  context.moveTo(x + clampedRadius, y);
  context.lineTo(x + width - clampedRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + clampedRadius);
  context.lineTo(x + width, y + height - clampedRadius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - clampedRadius,
    y + height
  );
  context.lineTo(x + clampedRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - clampedRadius);
  context.lineTo(x, y + clampedRadius);
  context.quadraticCurveTo(x, y, x + clampedRadius, y);
  context.closePath();
}

function applyOpaqueExportSurface(
  sourceCanvas: HTMLCanvasElement,
  node: HTMLElement,
  matteColor: string
) {
  const targetCanvas = document.createElement('canvas');
  targetCanvas.width = sourceCanvas.width;
  targetCanvas.height = sourceCanvas.height;
  const context = targetCanvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to initialize opaque export canvas.');
  }

  const backdropColor = getExportBackdropColor(node);
  const cornerRadius = getNodeCornerRadius(node);

  context.fillStyle = backdropColor;
  context.fillRect(0, 0, targetCanvas.width, targetCanvas.height);

  if (cornerRadius > 0) {
    context.save();
    addRoundedRectPath(
      context,
      0,
      0,
      targetCanvas.width,
      targetCanvas.height,
      cornerRadius
    );
    context.clip();
  }

  context.fillStyle = matteColor;
  context.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
  context.drawImage(sourceCanvas, 0, 0);

  if (cornerRadius > 0) {
    context.restore();
  }

  return targetCanvas;
}

export async function renderElementToCanvas(
  node: HTMLElement,
  options: RenderElementToCanvasOptions = {}
) {
  await document.fonts.ready;

  const rect = node.getBoundingClientRect();
  const width = Math.max(1, Math.round(options.renderWidth ?? rect.width));
  const requestedHeight = Math.max(
    1,
    Math.round(options.renderHeight ?? rect.height)
  );
  const pixelRatio =
    options.pixelRatio ?? Math.max(2, window.devicePixelRatio || 1);
  const useAltLayout =
    width !== Math.round(rect.width) ||
    requestedHeight !== Math.round(rect.height) ||
    options.captureFullContent === true;
  const { layoutSource, cleanup } = useAltLayout
    ? await createLayoutSource(node, width, requestedHeight)
    : { layoutSource: node, cleanup: () => {} };
  const clone = await buildStyledClone(layoutSource);
  clone.style.setProperty('width', `${width}px`);
  clone.style.setProperty('min-width', `${width}px`);
  clone.style.setProperty('max-width', `${width}px`);
  clone.style.setProperty('height', `${requestedHeight}px`);
  clone.style.setProperty('min-height', `${requestedHeight}px`);
  clone.style.setProperty('max-height', `${requestedHeight}px`);
  clone.style.setProperty('flex', 'none');
  const iframe = createSandboxIframe(width, requestedHeight);
  const iframeDocument = iframe.contentDocument;

  if (!iframeDocument) {
    iframe.remove();
    throw new Error('Failed to initialize export sandbox.');
  }

  try {
    iframeDocument.body.appendChild(clone);
    await waitForImagesReady(clone);
    await new Promise((resolve) =>
      window.requestAnimationFrame(() => resolve(null))
    );
    let renderHeight = requestedHeight;

    if (options.captureFullContent) {
      expandCloneForFullContent(clone);
      await new Promise((resolve) =>
        window.requestAnimationFrame(() => resolve(null))
      );
      await new Promise((resolve) =>
        window.requestAnimationFrame(() => resolve(null))
      );
      renderHeight = Math.max(
        requestedHeight,
        getExpandedCloneHeight(clone, requestedHeight)
      );
      clone.style.setProperty('height', `${renderHeight}px`);
      clone.style.setProperty('min-height', `${renderHeight}px`);
      clone.style.setProperty('max-height', `${renderHeight}px`);
      iframe.style.height = `${renderHeight}px`;
    }

    finalizeExportHeaderText(clone);
    await new Promise((resolve) =>
      window.requestAnimationFrame(() => resolve(null))
    );
    const html2canvas = await getHtml2Canvas();
    const canvas = await html2canvas(clone, {
      backgroundColor: null,
      scale: pixelRatio,
      useCORS: true,
      allowTaint: false,
      logging: false,
      width,
      height: renderHeight,
      windowWidth: width,
      windowHeight: renderHeight,
    });

    return applyAspectRatioToCanvas(
      canvas,
      options.aspectRatio,
      options.matteColor || '#111214'
    );
  } finally {
    cleanup();
    iframe.remove();
  }
}

export async function exportElementToPngBlob(
  node: HTMLElement,
  options: RenderElementToCanvasOptions = {}
) {
  return exportElementToImageBlob(node, 'image/png', options);
}

export async function exportElementToImageBlob(
  node: HTMLElement,
  mimeType: 'image/png' | 'image/jpeg',
  options: RenderElementToCanvasOptions = {}
) {
  const canvas = await renderElementToCanvas(node, options);
  return canvasToImageBlob(canvas, node, mimeType, options);
}

export async function canvasToImageBlob(
  canvas: HTMLCanvasElement,
  node: HTMLElement,
  mimeType: 'image/png' | 'image/jpeg',
  options: Pick<RenderElementToCanvasOptions, 'matteColor'> = {}
) {
  const outputCanvas =
    mimeType === 'image/jpeg'
      ? applyOpaqueExportSurface(canvas, node, options.matteColor || '#111214')
      : canvas;

  return await new Promise<Blob>((resolve, reject) => {
    outputCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create exported image.'));
          return;
        }

        resolve(blob);
      },
      mimeType,
      mimeType === 'image/jpeg' ? 0.92 : undefined
    );
  });
}

export function splitCanvasIntoPages(
  canvas: HTMLCanvasElement,
  pageHeight: number
) {
  const safePageHeight = Math.max(1, Math.floor(pageHeight));

  if (canvas.height <= safePageHeight) {
    return [canvas];
  }

  const pages: HTMLCanvasElement[] = [];
  let offsetY = 0;

  while (offsetY < canvas.height) {
    const sliceHeight = Math.min(safePageHeight, canvas.height - offsetY);
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;
    const context = pageCanvas.getContext('2d');

    if (!context) {
      break;
    }

    context.drawImage(
      canvas,
      0,
      offsetY,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight
    );

    pages.push(pageCanvas);
    offsetY += sliceHeight;
  }

  return pages;
}
