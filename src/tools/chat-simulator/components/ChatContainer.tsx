// src/tools/chat-simulator/components/ChatContainer.tsx
// Headless UI —— 聊天容器组件（无样式骨架）
'use client';

import React from 'react';

import { MessageGroup } from '../types/chat';

export interface ChatContainerProps {
  messageGroups: MessageGroup[];
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  intro?: React.ReactNode;
  messageListClassName?: string;
  messageListStyle?: React.CSSProperties;
  renderGroup: (group: MessageGroup, index: number) => React.ReactNode;
  renderSystemMessage?: (
    message: MessageGroup,
    index: number
  ) => React.ReactNode;
}

/**
 * ChatContainer: 聊天消息列表的顶层容器
 * 负责滚动区域管理和消息组的迭代渲染，不包含任何视觉样式
 */
export default function ChatContainer({
  messageGroups,
  className = '',
  header,
  footer,
  intro,
  messageListClassName = '',
  messageListStyle,
  renderGroup,
  renderSystemMessage,
}: ChatContainerProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const previousStateRef = React.useRef<{
    userMessageCount: number;
    lastUserMessageId: string | null;
  } | null>(null);

  const nonSystemMessages = messageGroups.flatMap((group) =>
    group.messages.filter((message) => !message.isSystemMessage)
  );
  const userMessageCount = nonSystemMessages.length;
  const lastUserMessageId =
    nonSystemMessages[nonSystemMessages.length - 1]?.id ?? null;

  React.useEffect(() => {
    const previousState = previousStateRef.current;
    const hasNewMessages =
      !previousState ||
      userMessageCount > previousState.userMessageCount ||
      (lastUserMessageId !== previousState.lastUserMessageId &&
        userMessageCount > previousState.userMessageCount);

    if (scrollRef.current && hasNewMessages) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    previousStateRef.current = {
      userMessageCount,
      lastUserMessageId,
    };
  }, [lastUserMessageId, userMessageCount]);

  const systemMessageCount = messageGroups.reduce(
    (total, group) =>
      total +
      group.messages.filter((message) => message.isSystemMessage).length,
    0
  );

  return (
    <div
      className={`ds-chat-container flex h-full min-h-0 flex-col ${className}`}
      data-export-chat-container="true"
    >
      {header && <div className="ds-chat-header flex-shrink-0">{header}</div>}

      <div
        ref={scrollRef}
        className={`ds-chat-messages min-h-0 flex-1 overflow-y-auto ${messageListClassName}`}
        style={messageListStyle}
        data-system-message-count={systemMessageCount}
        data-export-message-list="true"
      >
        {intro && <div className="ds-chat-intro">{intro}</div>}
        {messageGroups.map((group, index) => {
          // 系统消息使用独有的渲染器
          if (group.messages[0]?.isSystemMessage && renderSystemMessage) {
            return (
              <React.Fragment key={`sys-${index}`}>
                {renderSystemMessage(group, index)}
              </React.Fragment>
            );
          }
          return (
            <React.Fragment key={`grp-${index}`}>
              {renderGroup(group, index)}
            </React.Fragment>
          );
        })}
      </div>

      {footer && <div className="ds-chat-footer flex-shrink-0">{footer}</div>}
    </div>
  );
}
