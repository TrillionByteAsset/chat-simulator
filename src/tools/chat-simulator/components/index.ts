// src/tools/chat-simulator/components/index.ts
// Barrel export for all headless UI components

export { default as ChatContainer } from './ChatContainer';
export { default as DiscordInputBar } from './DiscordInputBar';
export { default as MessageBubble } from './MessageBubble';
export { default as SenderInfo } from './SenderInfo';
export { default as InputBar } from './InputBar';
export { default as AttachmentArea } from './AttachmentArea';
export { default as TelegramInputBar } from './TelegramInputBar';
export { ExportDialog } from './ExportDialog';

// Re-export prop types
export type { ChatContainerProps } from './ChatContainer';
export type { DiscordInputBarProps } from './DiscordInputBar';
export type { MessageBubbleProps } from './MessageBubble';
export type { SenderInfoProps } from './SenderInfo';
export type { InputBarProps } from './InputBar';
export type { AttachmentAreaProps } from './AttachmentArea';
export type { TelegramInputBarProps } from './TelegramInputBar';
