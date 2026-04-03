// src/tools/chat-simulator/components/DiscordInputBar.tsx
'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Plus, Smile, Sparkles } from 'lucide-react';
import { useLocale } from 'next-intl';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

import { getChatSimulatorUiText } from '../localization';

export interface DiscordInputBarProps {
  placeholder?: string;
  disabled?: boolean;
  onSend: (content: string) => void;
  onUploadImages: () => void;
  onUploadFiles: () => void;
}

function DiscordGifBadge() {
  return (
    <span className="ds-discord-compose-gif-badge" aria-hidden="true">
      GIF
    </span>
  );
}

function DiscordStickerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="ds-discord-compose-action-icon ds-discord-compose-sticker-icon"
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M7 3.25h8.25A4.5 4.5 0 0 1 19.75 7.75V14a4.03 4.03 0 0 1-1.18 2.84l-1.73 1.73A4.03 4.03 0 0 1 14 19.75H7A3.75 3.75 0 0 1 3.25 16V7A3.75 3.75 0 0 1 7 3.25Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M14.85 11.25c0 1.45-1.24 2.38-2.85 2.38-1.61 0-2.85-.93-2.85-2.38"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="8.85" cy="8.8" r="1.15" fill="currentColor" />
      <circle cx="15.15" cy="8.8" r="1.15" fill="currentColor" />
      <path
        d="M13.75 4.25v2.5a1.5 1.5 0 0 0 1.5 1.5h2.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DiscordInputBar({
  placeholder = 'Message #general',
  disabled = false,
  onSend,
  onUploadImages,
  onUploadFiles,
}: DiscordInputBarProps) {
  const locale = useLocale();
  const uiText = getChatSimulatorUiText(locale);
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resetHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.scrollTop = 0;
    }
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    onSend(trimmed);
    setValue('');
    resetHeight();
  }, [onSend, resetHeight, value]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleInput = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(event.target.value);
      const textarea = event.target;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`;
    },
    []
  );

  return (
    <div className="ds-discord-compose">
      <div className="ds-discord-compose-shell">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="ds-discord-compose-trigger"
              aria-label="Open attachment menu"
              disabled={disabled}
            >
              <Plus className="ds-discord-compose-trigger-icon" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            side="top"
            sideOffset={10}
            className="ds-discord-compose-menu"
          >
            <DropdownMenuItem
              className="ds-discord-compose-menu-item"
              onSelect={onUploadImages}
            >
              <span className="ds-discord-compose-menu-label">
                {uiText.uploadImage}
              </span>
              <DropdownMenuShortcut className="ds-discord-compose-menu-shortcut">
                {uiText.localOnly}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="ds-discord-compose-menu-item"
              onSelect={onUploadFiles}
            >
              <span className="ds-discord-compose-menu-label">
                {uiText.attachFile}
              </span>
              <DropdownMenuShortcut className="ds-discord-compose-menu-shortcut">
                {uiText.localOnly}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder=""
          disabled={disabled}
          rows={1}
          className="ds-discord-compose-input"
        />

        {!value ? (
          <span className="ds-discord-compose-placeholder" aria-hidden="true">
            {placeholder}
          </span>
        ) : null}

        <div className="ds-discord-compose-actions" aria-hidden="true">
          <button
            type="button"
            className="ds-discord-compose-action-button ds-discord-compose-action-button-line"
            aria-label="Browse GIFs"
            disabled={disabled}
          >
            <DiscordGifBadge />
          </button>
          <button
            type="button"
            className="ds-discord-compose-action-button ds-discord-compose-action-button-line"
            aria-label="Open sticker picker"
            disabled={disabled}
          >
            <DiscordStickerIcon />
          </button>
          <button
            type="button"
            className="ds-discord-compose-action-button ds-discord-compose-action-button-line"
            aria-label="Open emoji picker"
            disabled={disabled}
          >
            <Smile className="ds-discord-compose-action-icon" />
          </button>
          <button
            type="button"
            className="ds-discord-compose-action-button ds-discord-compose-action-button-line"
            aria-label="Open apps"
            disabled={disabled}
          >
            <Sparkles className="ds-discord-compose-action-icon" />
          </button>
        </div>
      </div>
    </div>
  );
}
