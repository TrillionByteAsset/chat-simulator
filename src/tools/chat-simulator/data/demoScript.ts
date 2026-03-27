// src/tools/chat-simulator/data/demoScript.ts
// 演示脚本 —— 英文模拟数据（符合海外面向要求）

export const DEMO_SCRIPT = `
# A compact demo conversation
Alex: Hey team, quick check-in.
Jordan: Morning! The new layout looks great.
Sam: Agreed, the Discord style feels much cleaner now.
Alex: Nice. Let's export a screenshot after one more tweak.
Jordan: Sounds good to me.
`;

export const DEMO_USERS = {
  'Alex': {
    id: 'user-alex',
    name: 'Alex',
    avatar: '/imgs/avatars/1.png',
    color: '#e91e63',
    status: 'online' as const,
    role: 'Admin',
  },
  'Jordan': {
    id: 'user-jordan',
    name: 'Jordan',
    avatar: '/imgs/avatars/2.png',
    color: '#2196f3',
    status: 'online' as const,
  },
  'Sam': {
    id: 'user-sam',
    name: 'Sam',
    avatar: '/imgs/avatars/3.png',
    color: '#4caf50',
    status: 'idle' as const,
  },
  'Taylor': {
    id: 'user-taylor',
    name: 'Taylor',
    avatar: '/imgs/avatars/4.png',
    color: '#ff9800',
    status: 'offline' as const,
  },
};
