// src/tools/chat-simulator/utils/exportDelivery.ts
'use client';

function isTabletOrMobileUserAgent(userAgent: string) {
  return /android|iphone|ipad|ipod|mobile|tablet|silk|kindle/i.test(userAgent);
}

export function isHandheldDevice() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || '';
  const isTouchMac = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

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

export async function deliverExportedFile(file: File) {
  return deliverExportedFiles([file]);
}

export async function deliverExportedFiles(files: File[]) {
  if (files.length === 0) {
    return 'skipped';
  }

  if (isHandheldDevice() && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    const sharePayload = {
      files,
      title: files.length === 1 ? files[0]?.name : `${files.length} chat exports`,
    };

    if (typeof navigator.canShare !== 'function' || navigator.canShare(sharePayload)) {
      try {
        await navigator.share(sharePayload);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new Error('Share canceled.');
        }

        throw error;
      }
      return 'shared';
    }
  }

  for (const file of files) {
    triggerDownload(file);
    await new Promise((resolve) => window.setTimeout(resolve, 150));
  }

  return 'downloaded';
}
