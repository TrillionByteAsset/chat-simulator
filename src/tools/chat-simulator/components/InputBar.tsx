// src/tools/chat-simulator/components/InputBar.tsx
// Headless UI —— 输入栏组件
'use client';

import React, { useState, useCallback, useRef } from 'react';

export interface InputBarProps {
  placeholder?: string;
  className?: string;
  shellClassName?: string;
  shellStyle?: React.CSSProperties;
  textareaClassName?: string;
  textareaStyle?: React.CSSProperties;
  disabled?: boolean;
  onSend: (content: string) => void;
  renderPrefix?: () => React.ReactNode;  // 附件按钮、表情按钮等前缀插槽
  renderSuffix?: () => React.ReactNode;  // 发送按钮等后缀插槽
  renderAfterInput?: () => React.ReactNode;
}

/**
 * InputBar: 消息输入栏
 * 支持 Enter 发送和 Shift+Enter 换行
 * 前缀/后缀插槽可注入平台特有的操作按钮
 */
export default function InputBar({
  placeholder = 'Type a message...',
  className = '',
  shellClassName = '',
  shellStyle,
  textareaClassName = '',
  textareaStyle,
  disabled = false,
  onSend,
  renderPrefix,
  renderSuffix,
  renderAfterInput,
}: InputBarProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
    // 重置 textarea 高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // 自动增长高度
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  return (
    <div className={`ds-input-bar flex items-end gap-3 ${className}`}>
      <div
        className={`ds-input-shell flex min-w-0 flex-1 items-end gap-2 rounded-xl border border-black/10 bg-[#2b2d31] px-4 py-2 text-white shadow-sm ${shellClassName}`}
        style={shellStyle}
      >
        {renderPrefix && (
          <div className="ds-input-prefix flex flex-shrink-0 items-center">
            {renderPrefix()}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={`ds-input-textarea min-h-[36px] max-h-[120px] flex-1 resize-none border-0 bg-transparent text-sm leading-5 text-[#f2f3f5] outline-none placeholder:text-[#9ca3af] ${textareaClassName}`}
          style={{
            backgroundColor: 'transparent',
            color: '#f2f3f5',
            WebkitTextFillColor: '#f2f3f5',
            ...textareaStyle,
          }}
        />

        {renderSuffix && (
          <div className="ds-input-suffix flex flex-shrink-0 items-center">
            {renderSuffix()}
          </div>
        )}
      </div>

      {renderAfterInput && (
        <div className="ds-input-after flex flex-shrink-0 items-center">
          {renderAfterInput()}
        </div>
      )}
    </div>
  );
}
