// src/tools/chat-simulator/store/index.ts
// 工具独立的 Zustand Store —— 禁止全局共享，实现零耦合状态管理
'use client';

import { create } from 'zustand';
import { ChatMessage, ChatUser, ChatChannel, MessageGroup, PlatformType, MessageSide } from '../types/chat';

const DEFAULT_AUTHOR: ChatUser = {
  id: 'user-you',
  name: 'You',
  avatar: '',
  color: '#5865f2',
};

interface ChatSimulatorState {
  // ---- 数据 ----
  messages: ChatMessage[];
  users: Record<string, ChatUser>;
  channel: ChatChannel | null;
  activeSkin: PlatformType;

  // ---- 派生 (cached) ----
  messageGroups: MessageGroup[];

  // ---- 操作 ----
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, content: string, options?: { timestamp?: string }) => void;
  updateAuthorAvatar: (authorName: string, avatarUrl: string) => void;
  deleteMessage: (messageId: string) => void;
  setUsers: (users: Record<string, ChatUser>) => void;
  upsertUser: (user: ChatUser) => void;
  setChannel: (channel: ChatChannel) => void;
  setSkin: (skin: PlatformType) => void;
  startNewChat: (channelName?: string) => void;
  reset: () => void;
}

/**
 * 将连续同一用户的消息合并为 MessageGroup（Discord stacking 逻辑）
 */
function groupMessages(messages: ChatMessage[]): MessageGroup[] {
  const groups: MessageGroup[] = [];

  const getMessageSide = (message: ChatMessage): MessageSide => {
    const side = message.metadata?.side;
    return side === 'left' || side === 'right' ? side : message.sender.id === 'current-speaker' ? 'right' : 'left';
  };

  for (const msg of messages) {
    const lastGroup = groups[groups.length - 1];

    // 同一用户连续发送 → 合并到同一组
    if (
      lastGroup &&
      lastGroup.sender.id === msg.sender.id &&
      lastGroup.messages[lastGroup.messages.length - 1]?.authorName === msg.authorName &&
      lastGroup.messages[lastGroup.messages.length - 1]?.avatarUrl === msg.avatarUrl &&
      getMessageSide(lastGroup.messages[lastGroup.messages.length - 1]) === getMessageSide(msg) &&
      !msg.isSystemMessage
    ) {
      lastGroup.messages.push(msg);
    } else {
      groups.push({
        sender: msg.sender,
        messages: [msg],
        timestamp: msg.timestamp,
      });
    }
  }

  return groups;
}

function createWelcomeMessage(channelName = 'general', activeSkin: PlatformType = 'discord'): ChatMessage {
  const normalizedChannel = channelName.trim() || 'general';

  return {
    id: `msg-system-${Date.now()}`,
    sender: { id: 'system', name: 'System', avatar: '' },
    authorName: 'System',
    avatarUrl: '',
    content:
      activeSkin === 'whatsapp' || activeSkin === 'telegram'
        ? 'Today'
        : `Welcome to #${normalizedChannel}. Start the conversation.`,
    timestamp: new Date().toISOString(),
    isSystemMessage: true,
  };
}

const initialState = {
  messages: [],
  users: {},
  channel: null,
  activeSkin: 'discord' as PlatformType,
  messageGroups: [],
};

export const useChatSimulatorStore = create<ChatSimulatorState>((set, get) => ({
  ...initialState,

  setMessages: (messages) =>
    set({
      messages,
      messageGroups: groupMessages(messages),
    }),

  addMessage: (message) => {
    const newMessages = [...get().messages, message];
    set({
      messages: newMessages,
      messageGroups: groupMessages(newMessages),
    });
  },

  updateMessage: (messageId, content, options) => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return;
    }

    const newMessages = get().messages.map((message) => {
      if (message.id !== messageId) {
        return message;
      }

      return {
        ...message,
        content: trimmedContent,
        timestamp: options?.timestamp || message.timestamp,
        metadata: {
          ...message.metadata,
          editedAt: new Date().toISOString(),
        },
      };
    });

    set({
      messages: newMessages,
      messageGroups: groupMessages(newMessages),
    });
  },

  updateAuthorAvatar: (authorName, avatarUrl) => {
    const normalizedAuthorName = authorName.trim();
    if (!normalizedAuthorName) {
      return;
    }

    const newMessages = get().messages.map((message) => {
      if (message.authorName !== normalizedAuthorName) {
        return message;
      }

      return {
        ...message,
        sender: {
          ...message.sender,
          avatar: avatarUrl,
        },
        avatarUrl,
      };
    });

    const newUsers = Object.fromEntries(
      Object.entries(get().users).map(([userId, user]) => [
        userId,
        user.name === normalizedAuthorName
          ? {
              ...user,
              avatar: avatarUrl,
            }
          : user,
      ]),
    );

    set({
      messages: newMessages,
      users: newUsers,
      messageGroups: groupMessages(newMessages),
    });
  },

  deleteMessage: (messageId) => {
    const newMessages = get().messages.filter((message) => message.id !== messageId);
    set({
      messages: newMessages,
      messageGroups: groupMessages(newMessages),
    });
  },

  setUsers: (users) => set({ users }),

  upsertUser: (user) =>
    set((state) => ({
      users: {
        ...state.users,
        [user.id]: user,
      },
    })),

  setChannel: (channel) => set({ channel }),

  setSkin: (skin) => set({ activeSkin: skin }),

  startNewChat: (channelName) => {
    const { activeSkin, channel } = get();
    const users = {
      [DEFAULT_AUTHOR.id]: DEFAULT_AUTHOR,
    };
    const messages = [createWelcomeMessage(channelName, activeSkin)];

    set({
      ...initialState,
      activeSkin,
      channel,
      users,
      messages,
      messageGroups: groupMessages(messages),
    });
  },

  reset: () => set(initialState),
}));
