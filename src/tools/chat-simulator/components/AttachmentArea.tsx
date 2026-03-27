// src/tools/chat-simulator/components/AttachmentArea.tsx
// Headless UI —— 附件展示区域
'use client';

import React from 'react';
import { Attachment } from '../types/chat';

export interface AttachmentAreaProps {
  attachments: Attachment[];
  className?: string;
  renderImage?: (attachment: Attachment) => React.ReactNode;
  renderVideo?: (attachment: Attachment) => React.ReactNode;
  renderAudio?: (attachment: Attachment) => React.ReactNode;
  renderFile?: (attachment: Attachment) => React.ReactNode;
}

/**
 * AttachmentArea: 根据附件类型动态选择渲染器
 * 每种媒体类型（image/video/audio/file）都可通过 render prop 注入具体表现
 */
export default function AttachmentArea({
  attachments,
  className = '',
  renderImage,
  renderVideo,
  renderAudio,
  renderFile,
}: AttachmentAreaProps) {
  const renderAttachment = (attachment: Attachment) => {
    switch (attachment.type) {
      case 'image':
        return renderImage ? renderImage(attachment) : (
          <img
            src={attachment.url}
            alt={attachment.name}
            className="ds-attachment-image max-w-xs rounded"
            loading="lazy"
          />
        );
      case 'video':
        return renderVideo ? renderVideo(attachment) : (
          <video
            src={attachment.url}
            controls
            className="ds-attachment-video max-w-xs rounded"
          />
        );
      case 'audio':
        return renderAudio ? renderAudio(attachment) : (
          <audio src={attachment.url} controls className="ds-attachment-audio w-full" />
        );
      case 'file':
        return renderFile ? renderFile(attachment) : (
          <a
            href={attachment.url}
            className="ds-attachment-file inline-flex items-center gap-2 px-3 py-2 rounded border text-sm"
            download={attachment.name}
          >
            📎 {attachment.name}
            {attachment.size && (
              <span className="text-xs opacity-60">
                ({(attachment.size / 1024).toFixed(1)} KB)
              </span>
            )}
          </a>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`ds-attachment-area flex flex-wrap gap-2 ${className}`}>
      {attachments.map((attachment) => (
        <div key={attachment.id} className="ds-attachment-item">
          {renderAttachment(attachment)}
        </div>
      ))}
    </div>
  );
}
