// src/tools/chat-simulator/components/TelegramInputBar.tsx
'use client';

import React, { useCallback, useState } from 'react';
import { Flame, Mic, Paperclip, Smile } from 'lucide-react';

export interface TelegramInputBarProps {
  disabled?: boolean;
  placeholder?: string;
  onAttachFile?: () => void;
  onSend: (content: string) => void;
}

export default function TelegramInputBar({
  disabled = false,
  placeholder = 'Message',
  onAttachFile,
  onSend,
}: TelegramInputBarProps) {
  const [value, setValue] = useState('');

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    onSend(trimmed);
    setValue('');
  }, [onSend, value]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="tg-compose-bar">
      <button
        type="button"
        className="tg-compose-icon-button tg-compose-attach"
        aria-label="Attach file"
        onClick={onAttachFile}
        disabled={disabled}
      >
        <Paperclip className="tg-compose-attach-icon" />
      </button>

      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="tg-compose-input"
      />

      <div className="tg-compose-actions">
        <span className="tg-compose-timer" aria-hidden="true">
          <Flame className="tg-compose-timer-icon" />
          <span className="tg-compose-timer-copy">
            <span className="tg-compose-timer-line">0</span>
            <span className="tg-compose-timer-line">min</span>
          </span>
        </span>

        <button
          type="button"
          className="tg-compose-icon-button tg-compose-emoji"
          aria-label="Emoji"
          disabled={disabled}
        >
          <Smile className="tg-compose-action-icon" />
        </button>

        <button
          type="button"
          className="tg-compose-icon-button tg-compose-mic"
          aria-label="Voice message"
          disabled={disabled}
        >
          <Mic className="tg-compose-action-icon" />
        </button>
      </div>
    </div>
  );
}
