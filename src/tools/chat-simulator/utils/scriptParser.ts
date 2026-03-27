// src/tools/chat-simulator/utils/scriptParser.ts
// 脚本解析器 —— 将原始 "Name: message" 文本格式解析为通用 ChatScript 结构
// 兼容 lukepolson/DiscordChatSimulator 的输入格式

import { ChatMessage, ChatUser, ChatScript } from '../types/chat';

const DEFAULT_AVATARS = [
  '/imgs/avatars/1.png',
  '/imgs/avatars/2.png',
  '/imgs/avatars/3.png',
  '/imgs/avatars/4.png',
  '/imgs/avatars/5.png',
];

const NAME_COLORS = [
  '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
  '#2196f3', '#00bcd4', '#009688', '#4caf50',
  '#ff9800', '#ff5722', '#795548', '#607d8b',
];

/**
 * 解析纯文本脚本为 ChatScript
 * 
 * 格式: `Name: message text`
 * 以 `#` 开头的行为注释，会被忽略
 * 以 `---` 开头的行为系统消息
 * 空行会被忽略
 * 
 * @example
 * ```
 * Jim: Hey Bob
 * Jim: What kind of chocolate...
 * Jim: Do you find in airports?
 * Bob: idk Jim what kind?
 * # this is a comment
 * Jim: Plain chocolate!
 * --- Jim joined the chat
 * ```
 */
export function parseScript(rawText: string, presetUsers: Record<string, ChatUser> = {}): ChatScript {
  const lines = rawText.split('\n');
  const users: Record<string, ChatUser> = { ...presetUsers };
  const messages: ChatMessage[] = [];
  let userIndex = Object.keys(users).length;
  let messageId = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // 跳过空行和注释
    if (!trimmed || trimmed.startsWith('#')) continue;

    // 系统消息
    if (trimmed.startsWith('---')) {
      const systemContent = trimmed.replace(/^-{3,}\s*/, '');
      if (systemContent) {
        messages.push({
          id: `msg-${++messageId}`,
          sender: { id: 'system', name: 'System', avatar: '' },
          authorName: 'System',
          avatarUrl: '',
          content: systemContent,
          timestamp: new Date(Date.now() + messageId * 1000).toISOString(),
          isSystemMessage: true,
        });
      }
      continue;
    }

    // 解析 "Name: message" 格式
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex <= 0) continue;

    const name = trimmed.substring(0, colonIndex).trim();
    const content = trimmed.substring(colonIndex + 1).trim();
    if (!content) continue;

    // 如果用户还不存在，自动注册
    if (!users[name]) {
      users[name] = {
        id: `user-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name,
        avatar: DEFAULT_AVATARS[userIndex % DEFAULT_AVATARS.length],
        color: NAME_COLORS[userIndex % NAME_COLORS.length],
      };
      userIndex++;
    }

    messages.push({
      id: `msg-${++messageId}`,
      sender: users[name],
      authorName: users[name].name,
      avatarUrl: users[name].avatar,
      content,
      timestamp: new Date(Date.now() + messageId * 1000).toISOString(),
    });
  }

  return { users, messages };
}

/**
 * 从 JSON 对象直接加载 ChatScript
 * 用于已经预处理好的消息数据
 */
export function loadScriptFromJSON(data: ChatScript): ChatScript {
  return data;
}
