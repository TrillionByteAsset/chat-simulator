// src/tools/chat-simulator/components/MessageBubble.tsx
// Headless UI —— 消息气泡组件
'use client';

import React from 'react';
import { Check, ImagePlus, Pencil, Trash2, UserRound, X } from 'lucide-react';
import { useLocale } from 'next-intl';

import { getChatSimulatorUiText } from '../localization';
import { ChatMessage, Reaction } from '../types/chat';

export interface MessageBubbleProps {
  message: ChatMessage;
  className?: string;
  /** 是否是 stacked 组内的后续消息（如果是，不需要再显示 SenderInfo） */
  isStacked?: boolean;
  renderContent?: (content: string) => React.ReactNode;
  renderAttachments?: (
    attachments: NonNullable<ChatMessage['attachments']>
  ) => React.ReactNode;
  renderReactions?: (reactions: Reaction[]) => React.ReactNode;
  renderReply?: (replyToId: string) => React.ReactNode;
  isEditing?: boolean;
  editingValue?: string;
  editingTimestamp?: string;
  editingAvatarUrl?: string;
  editingAuthorName?: string;
  onEditingValueChange?: (value: string) => void;
  onEditingTimestampChange?: (value: string) => void;
  onEditingAvatarChange?: (file: File | null) => void;
  onEditingAvatarClear?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onEditSave?: () => void;
  onEditCancel?: () => void;
}

/**
 * MessageBubble: 单条消息的显示壳
 * 内容渲染（Markdown / 纯文本）、附件展示和表情反应均可通过 render props 自定义
 */
export default function MessageBubble({
  message,
  className = '',
  isStacked = false,
  renderContent,
  renderAttachments,
  renderReactions,
  renderReply,
  isEditing = false,
  editingValue = '',
  editingTimestamp = '',
  editingAvatarUrl = '',
  editingAuthorName = '',
  onEditingValueChange,
  onEditingTimestampChange,
  onEditingAvatarChange,
  onEditingAvatarClear,
  onEdit,
  onDelete,
  onEditSave,
  onEditCancel,
}: MessageBubbleProps) {
  const locale = useLocale();
  const uiText = getChatSimulatorUiText(locale);
  const fileInputId = React.useId();
  const hasTextContent = message.content.trim().length > 0;
  const renderedContent = isEditing ? null : renderContent ? (
    renderContent(message.content)
  ) : hasTextContent ? (
    <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
  ) : null;

  // 系统消息特殊处理
  if (message.isSystemMessage) {
    return (
      <div
        className={`ds-system-message py-1 text-center text-xs opacity-60 ${className}`}
      >
        {message.content}
      </div>
    );
  }

  return (
    <div
      className={`ds-message-bubble group relative ${isStacked ? 'ds-message-stacked' : ''} ${className}`}
      data-message-id={message.id}
    >
      {(onEdit || onDelete) && !isEditing && (
        <div className="ds-message-actions absolute top-0 right-0 hidden -translate-y-1/2 rounded-md border bg-[#111214] shadow-lg group-hover:flex">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex h-8 w-8 items-center justify-center text-[#b5bac1] transition hover:text-white"
              aria-label={uiText.messageBubble.editMessage}
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex h-8 w-8 items-center justify-center text-[#ed4245] transition hover:text-[#ff6b6b]"
              aria-label={uiText.messageBubble.deleteMessage}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* 引用回复 */}
      {message.replyTo && renderReply && (
        <div className="ds-message-reply mb-1">
          {renderReply(message.replyTo)}
        </div>
      )}

      {/* 消息文本内容 */}
      {isEditing ? (
        <div className="ds-message-content">
          <div className="ds-message-editor rounded-md border border-[#1f2023] bg-[#2b2d31] p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="ds-editor-avatar flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#1e1f22] text-[#b5bac1]">
                  {editingAvatarUrl ? (
                    <img
                      src={editingAvatarUrl}
                      alt={editingAuthorName || message.authorName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="ds-editor-heading text-xs font-medium tracking-[0.12em] text-[#949ba4] uppercase">
                    {uiText.messageBubble.editingAvatar}
                  </p>
                  <p className="ds-editor-author text-sm text-[#f2f3f5]">
                    {editingAuthorName || message.authorName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id={fileInputId}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) =>
                    onEditingAvatarChange?.(event.target.files?.[0] ?? null)
                  }
                />
                <label
                  htmlFor={fileInputId}
                  className="ds-editor-upload inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-[#dbdee1] transition hover:border-[#5865f2] hover:bg-white/5"
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                  {uiText.messageBubble.changeAvatar}
                </label>
                {editingAvatarUrl && (
                  <button
                    type="button"
                    onClick={onEditingAvatarClear}
                    className="ds-editor-remove inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-[#b5bac1] transition hover:bg-white/5 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                    {uiText.messageBubble.remove}
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={editingValue}
              onChange={(event) => onEditingValueChange?.(event.target.value)}
              rows={3}
              className="ds-editor-textarea w-full resize-none bg-transparent text-sm text-white outline-none"
              style={{
                backgroundColor: '#2b2d31',
                color: '#f2f3f5',
                WebkitTextFillColor: '#f2f3f5',
              }}
            />
            <div className="mt-3">
              <label className="ds-editor-time-label mb-1 block text-xs font-medium tracking-[0.12em] text-[#949ba4] uppercase">
                {uiText.messageBubble.messageTime}
              </label>
              <input
                type="datetime-local"
                value={editingTimestamp}
                onChange={(event) =>
                  onEditingTimestampChange?.(event.target.value)
                }
                className="ds-editor-time-input w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none"
              />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onEditSave}
                className="ds-editor-save flex items-center gap-1 rounded-xl bg-[#5865f2] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#4752c4]"
              >
                <Check className="h-3.5 w-3.5" />
                {uiText.messageBubble.save}
              </button>
              <button
                type="button"
                onClick={onEditCancel}
                className="ds-editor-cancel flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium text-[#b5bac1] transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
                {uiText.messageBubble.cancel}
              </button>
            </div>
          </div>
        </div>
      ) : renderedContent != null ? (
        <div className="ds-message-content">{renderedContent}</div>
      ) : null}

      {/* 附件区 */}
      {!isEditing &&
        message.attachments &&
        message.attachments.length > 0 &&
        renderAttachments && (
          <div className="ds-message-attachments mt-1">
            {renderAttachments(message.attachments)}
          </div>
        )}

      {/* 表情反应 */}
      {!isEditing &&
        message.reactions &&
        message.reactions.length > 0 &&
        renderReactions && (
          <div className="ds-message-reactions mt-1 flex gap-1">
            {renderReactions(message.reactions)}
          </div>
        )}
    </div>
  );
}
