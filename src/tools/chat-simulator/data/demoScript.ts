// src/tools/chat-simulator/data/demoScript.ts
// 演示脚本 —— 默认展示用的趣味英文群聊

export const DEMO_SCRIPT = `
# A playful default conversation
--- Taylor renamed the channel to snack-crisis-room
Alex: Emergency update: somebody ate the office birthday cake before the candles even arrived.
Jordan: I need everyone to stay calm and immediately define "somebody."
Sam: The evidence is not looking great for Alex. There is frosting on your sleeve and also somehow on your eyebrow.
Alex: That frosting is unrelated and frankly very judgmental.
Taylor: I just checked the fridge. The cake box now contains one lonely strawberry and what I can only describe as regret.
Jordan: This is now an official internal investigation.
Sam: I volunteer to lead forensics. Step one: everyone send a photo of their plate from the last 20 minutes.
Alex: Absolutely not. That feels anti-creative.
Taylor: New clue: there is a plastic fork in the meeting room labeled "for emotional support."
Jordan: That handwriting is literally yours, Alex.
Alex: I can explain that. I was preparing the fork for a future emergency and then the emergency happened to be cake-shaped.
Sam: Incredible. We solved the case and also somehow learned nothing.
Taylor: Final ruling: Alex owes the team replacement cake, plus one dramatic apology in the style of a royal announcement.
Alex: Fine. I will return with cake, candles, and dignity, though maybe not in that order.
`;

export const DEMO_USERS = {
  Alex: {
    id: 'user-alex',
    name: 'Alex',
    avatar: '/imgs/avatars/1.png',
    color: '#e91e63',
    status: 'online' as const,
    role: 'Admin',
  },
  Jordan: {
    id: 'user-jordan',
    name: 'Jordan',
    avatar: '/imgs/avatars/2.png',
    color: '#2196f3',
    status: 'online' as const,
  },
  Sam: {
    id: 'user-sam',
    name: 'Sam',
    avatar: '/imgs/avatars/3.png',
    color: '#4caf50',
    status: 'idle' as const,
  },
  Taylor: {
    id: 'user-taylor',
    name: 'Taylor',
    avatar: '/imgs/avatars/4.png',
    color: '#ff9800',
    status: 'offline' as const,
  },
};
