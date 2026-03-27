// src/tools/chat-simulator/types/chat.ts
// 通用聊天数据协议 —— 兼容 Discord / WhatsApp / Telegram 等平台的消息模型

export type PlatformType =
  | 'discord'
  | 'whatsapp'
  | 'telegram'
  | 'messenger'
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'tiktok'
  | 'default';

export type MessageSide = 'left' | 'right';

export type UserStatus = 'online' | 'offline' | 'idle' | 'dnd';

export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  status?: UserStatus;
  role?: string;       // e.g. 'Admin', 'Bot', 'Guest'
  badges?: string[];   // Discord badge icons
  color?: string;      // Name display color (Discord role color)
}

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'file' | 'audio';
  url: string;
  name: string;
  size?: number;       // bytes
  thumbnail?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];     // user IDs who reacted
}

export interface ChatMessage {
  id: string;
  sender: ChatUser;
  authorName: string;
  avatarUrl: string;
  content: string;
  timestamp: string;   // ISO 8601
  isSystemMessage?: boolean;
  attachments?: Attachment[];
  reactions?: Reaction[];
  replyTo?: string;    // reference message id
  metadata?: Record<string, unknown>; // platform-specific extensions
}

/**
 * MessageGroup: 连续同一用户发出的消息合并为一组（Discord 风格的 message stacking）
 * 这是渲染层使用的分组结构，由 Store 自动计算
 */
export interface MessageGroup {
  sender: ChatUser;
  messages: ChatMessage[];
  timestamp: string;   // group 的首条消息时间
}

/**
 * ChatChannel / ChatRoom 的抽象
 */
export interface ChatChannel {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  type?: 'text' | 'voice' | 'announcement';
}

/**
 * 聊天脚本解析入口格式定义
 * 兼容原始 DiscordChatSimulator 的 "Name: message" 文本格式
 */
export interface ChatScript {
  users: Record<string, ChatUser>;
  channel?: ChatChannel;
  messages: ChatMessage[];
}
