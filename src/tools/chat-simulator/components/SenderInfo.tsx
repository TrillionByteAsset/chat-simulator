// src/tools/chat-simulator/components/SenderInfo.tsx
// Headless UI —— 发送者信息组件（头像 + 用户名 + 时间戳）
'use client';

import React from 'react';
import { ChatUser } from '../types/chat';

export interface SenderInfoProps {
  user: ChatUser;
  timestamp?: string;
  className?: string;
  renderAvatar?: (user: ChatUser) => React.ReactNode;
  renderBadges?: (badges: string[]) => React.ReactNode;
}

/**
 * SenderInfo: 显示发送者头像、用户名、角色标识和时间戳
 * 所有视觉细节（颜色、字体、间距）由外部 CSS Variable 控制
 */
export default function SenderInfo({
  user,
  timestamp,
  className = '',
  renderAvatar,
  renderBadges,
}: SenderInfoProps) {
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`ds-sender-info flex items-center gap-2 ${className}`}>
      {/* 头像 */}
      <div className="ds-sender-avatar flex-shrink-0">
        {renderAvatar ? (
          renderAvatar(user)
        ) : (
          <div
            className="ds-avatar-default w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-sm"
            title={user.name}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* 名称 + 徽章 + 时间 */}
      <div className="ds-sender-meta flex items-baseline gap-2">
        <span
          className="ds-sender-name font-semibold text-sm"
          style={user.color ? { color: user.color } : undefined}
        >
          {user.name}
        </span>

        {user.role && (
          <span className="ds-sender-role text-xs px-1 rounded">
            {user.role}
          </span>
        )}

        {user.badges && user.badges.length > 0 && renderBadges && (
          <span className="ds-sender-badges flex gap-1">
            {renderBadges(user.badges)}
          </span>
        )}

        {formattedTime && (
          <span className="ds-sender-timestamp text-xs opacity-60">
            {formattedTime}
          </span>
        )}
      </div>
    </div>
  );
}
