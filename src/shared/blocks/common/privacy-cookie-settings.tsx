'use client';

import { useEffect, useState } from 'react';

type GoogleFc = {
  callbackQueue?: Array<Record<string, () => void>>;
  showRevocationMessage?: () => void;
};

declare global {
  interface Window {
    googlefc?: GoogleFc;
  }
}

export function PrivacyCookieSettings({ label }: { label: string }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    window.googlefc = window.googlefc || {};
    window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
    window.googlefc.callbackQueue.push({
      CONSENT_API_READY: () => setIsReady(true),
    });

    if (typeof window.googlefc.showRevocationMessage === 'function') {
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <button
      type="button"
      className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-150"
      onClick={() => window.googlefc?.showRevocationMessage?.()}
    >
      {label}
    </button>
  );
}
