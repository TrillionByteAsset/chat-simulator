'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Download, Loader2 } from 'lucide-react';

type ExportAspectRatioPreset = 'auto' | '9:16' | '4:5' | '1:1' | '16:9';
type ExportQualityPreset = 'standard' | 'high' | 'ultra';
type ExportLayoutPreset = 'web' | 'mobile';
type ExportFileFormat = 'png' | 'jpg';
type ExportContentPreset = 'viewport' | 'full';
type ExportOverflowMode = 'single' | 'multiple';

export function ExportDialog({
  open,
  onOpenChange,
  uiText,
  settingsInsetStyle,
  exportFileFormat,
  setExportFileFormat,
  exportLayoutPreset,
  setExportLayoutPreset,
  exportAspectRatioPreset,
  setExportAspectRatioPreset,
  exportQualityPreset,
  setExportQualityPreset,
  exportContentPreset,
  setExportContentPreset,
  exportOverflowMode,
  setExportOverflowMode,
  exportLayoutOptions,
  exportAspectRatioOptions,
  exportQualityOptions,
  exportContentOptions,
  exportOverflowOptions,
  exportLayout,
  exportQuality,
  isExportingImage,
  primaryActionLabel,
  onStartExport,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uiText: {
    exportChatImage: string;
    exportDialogDescription: string;
    fileFormat: string;
    exportMode: string;
    exportRatio: string;
    exportQuality: string;
    exportContent: string;
    exportOverflow: string;
    exportSummary: string;
    cancel: string;
    openImage: string;
    export: string;
    prepareExport: string;
    saveToPhone: string;
    phoneViewport: string;
    currentWebViewport: string;
  };
  settingsInsetStyle: Readonly<Record<string, string>>;
  exportFileFormat: ExportFileFormat;
  setExportFileFormat: (value: ExportFileFormat) => void;
  exportLayoutPreset: ExportLayoutPreset;
  setExportLayoutPreset: (value: ExportLayoutPreset) => void;
  exportAspectRatioPreset: ExportAspectRatioPreset;
  setExportAspectRatioPreset: (value: ExportAspectRatioPreset) => void;
  exportQualityPreset: ExportQualityPreset;
  setExportQualityPreset: (value: ExportQualityPreset) => void;
  exportContentPreset: ExportContentPreset;
  setExportContentPreset: (value: ExportContentPreset) => void;
  exportOverflowMode: ExportOverflowMode;
  setExportOverflowMode: (value: ExportOverflowMode) => void;
  exportLayoutOptions: ReadonlyArray<{
    value: string;
    label: string;
    description: string;
    renderWidth: number | null;
  }>;
  exportAspectRatioOptions: ReadonlyArray<{
    value: string;
    label: string;
  }>;
  exportQualityOptions: ReadonlyArray<{
    value: string;
    label: string;
    description: string;
  }>;
  exportContentOptions: ReadonlyArray<{
    value: string;
    label: string;
    description: string;
  }>;
  exportOverflowOptions: ReadonlyArray<{
    value: string;
    label: string;
    description: string;
  }>;
  exportLayout: {
    label: string;
    description: string;
    renderWidth: number | null;
  };
  exportQuality: {
    description: string;
  };
  isExportingImage: boolean;
  primaryActionLabel: string;
  onStartExport: () => Promise<void>;
}) {
  const mobileDialogStyle = {
    width: 'min(520px, calc(100vw - 1rem))',
    height:
      'min(42rem, calc(100dvh - 1rem - env(safe-area-inset-top) - env(safe-area-inset-bottom)))',
    maxHeight:
      'calc(100dvh - 1rem - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
    touchAction: 'pan-y',
  } as const;

  const mobileScrollAreaStyle = {
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    overscrollBehaviorY: 'contain',
    touchAction: 'pan-y',
  } as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-2 !flex translate-x-[-50%] translate-y-0 flex-col overflow-hidden border-white/10 bg-[#202225] p-0 text-white sm:top-[50%] sm:max-w-[520px] sm:translate-y-[-50%]"
        style={mobileDialogStyle}
        onOpenAutoFocus={(event) => {
          // Prevent Radix from auto-focusing the first select on mobile,
          // which triggers the native PNG/JPG picker immediately on iOS.
          event.preventDefault();
        }}
      >
        <DialogHeader className="shrink-0 border-b border-white/10 px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-white">
            {uiText.exportChatImage}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#9ca3af]">
            {uiText.exportDialogDescription}
          </DialogDescription>
        </DialogHeader>

        <div
          className="grid min-h-0 flex-1 gap-4 px-6 py-5"
          style={mobileScrollAreaStyle}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium tracking-[0.12em] text-[#949ba4] uppercase">
                {uiText.fileFormat}
              </span>
              <select
                value={exportFileFormat}
                onChange={(event) =>
                  setExportFileFormat(event.target.value as ExportFileFormat)
                }
                className="ds-identity-input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2.5 text-sm text-[#f2f3f5] transition outline-none focus:border-[#5865f2]"
                style={settingsInsetStyle}
              >
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium tracking-[0.12em] text-[#949ba4] uppercase">
                {uiText.exportMode}
              </span>
              <select
                value={exportLayoutPreset}
                onChange={(event) =>
                  setExportLayoutPreset(
                    event.target.value as ExportLayoutPreset
                  )
                }
                className="ds-identity-input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2.5 text-sm text-[#f2f3f5] transition outline-none focus:border-[#5865f2]"
                style={settingsInsetStyle}
              >
                {exportLayoutOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-[#949ba4]">
                {exportLayout.description}
              </p>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium tracking-[0.12em] text-[#949ba4] uppercase">
                {uiText.exportRatio}
              </span>
              <select
                value={exportAspectRatioPreset}
                onChange={(event) =>
                  setExportAspectRatioPreset(
                    event.target.value as ExportAspectRatioPreset
                  )
                }
                className="ds-identity-input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2.5 text-sm text-[#f2f3f5] transition outline-none focus:border-[#5865f2]"
                style={settingsInsetStyle}
              >
                {exportAspectRatioOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium tracking-[0.12em] text-[#949ba4] uppercase">
                {uiText.exportQuality}
              </span>
              <select
                value={exportQualityPreset}
                onChange={(event) =>
                  setExportQualityPreset(
                    event.target.value as ExportQualityPreset
                  )
                }
                className="ds-identity-input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2.5 text-sm text-[#f2f3f5] transition outline-none focus:border-[#5865f2]"
                style={settingsInsetStyle}
              >
                {exportQualityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium tracking-[0.12em] text-[#949ba4] uppercase">
                {uiText.exportContent}
              </span>
              <select
                value={exportContentPreset}
                onChange={(event) =>
                  setExportContentPreset(
                    event.target.value as ExportContentPreset
                  )
                }
                className="ds-identity-input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2.5 text-sm text-[#f2f3f5] transition outline-none focus:border-[#5865f2]"
                style={settingsInsetStyle}
              >
                {exportContentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-[#949ba4]">
                {
                  exportContentOptions.find(
                    (option) => option.value === exportContentPreset
                  )?.description
                }
              </p>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium tracking-[0.12em] text-[#949ba4] uppercase">
                {uiText.exportOverflow}
              </span>
              <select
                value={exportOverflowMode}
                onChange={(event) =>
                  setExportOverflowMode(
                    event.target.value as ExportOverflowMode
                  )
                }
                disabled={exportContentPreset !== 'full'}
                className="ds-identity-input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2.5 text-sm text-[#f2f3f5] transition outline-none focus:border-[#5865f2] disabled:cursor-not-allowed disabled:opacity-50"
                style={settingsInsetStyle}
              >
                {exportOverflowOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-[#949ba4]">
                {exportContentPreset === 'full'
                  ? exportOverflowOptions.find(
                      (option) => option.value === exportOverflowMode
                    )?.description
                  : exportContentOptions[0]?.description}
              </p>
            </label>
          </div>

          <div
            className="rounded-[24px] border border-white/8 bg-transparent p-4"
            style={settingsInsetStyle}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.12em] text-[#949ba4] uppercase">
                  {uiText.exportSummary}
                </p>
                <p className="mt-1 text-sm text-[#dbdee1]">
                  {exportQuality.description}
                </p>
              </div>
              <div className="text-right text-xs text-[#949ba4]">
                <p>{exportFileFormat.toUpperCase()}</p>
                <p>{exportLayout.label}</p>
                <p>
                  {exportLayout.renderWidth
                    ? `${exportLayout.renderWidth}px ${uiText.phoneViewport}`
                    : uiText.currentWebViewport}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 z-10 shrink-0 border-t border-white/10 bg-[#202225] px-6 py-4 sm:justify-between">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-[#d1d5db] transition hover:bg-white/5"
          >
            {uiText.cancel}
          </button>
          <button
            type="button"
            onClick={() => void onStartExport()}
            disabled={isExportingImage}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5865f2] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4752c4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExportingImage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {primaryActionLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
