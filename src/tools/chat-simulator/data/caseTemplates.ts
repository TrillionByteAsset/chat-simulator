import type {
  ChatChannel,
  ChatMessage,
  ChatUser,
  PlatformType,
} from '../types/chat';

const CURRENT_SPEAKER_ID = 'current-speaker';
export const CHAT_SIMULATOR_APPLY_TEMPLATE_EVENT =
  'chat-simulator:apply-template';

export interface ChatSimulatorCaseTemplate {
  id: string;
  platform: Extract<PlatformType, 'discord' | 'whatsapp' | 'telegram'>;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  channel: ChatChannel;
  users: Record<string, ChatUser>;
  messages: ChatMessage[];
  selectedIdentityId: string;
  preview: string[];
}

function createTimestamp(base: string, minuteOffset: number) {
  const date = new Date(base);
  date.setMinutes(date.getMinutes() + minuteOffset);
  return date.toISOString();
}

function createMessage(
  id: string,
  sender: ChatUser,
  content: string,
  timestamp: string
): ChatMessage {
  return {
    id,
    sender,
    authorName: sender.name,
    avatarUrl: sender.avatar,
    content,
    timestamp,
    metadata: {
      side:
        sender.id === CURRENT_SPEAKER_ID
          ? 'right'
          : sender.defaultSide || 'left',
      deliveryStatus: sender.id === CURRENT_SPEAKER_ID ? 'read' : 'sent',
    },
  };
}

export function getChatSimulatorCaseTemplates(locale?: string) {
  const isZh = locale?.toLowerCase().startsWith('zh');

  const discordYou: ChatUser = {
    id: CURRENT_SPEAKER_ID,
    name: isZh ? '你' : 'You',
    avatar: '/imgs/avatars/5.png',
    color: '#5865f2',
    defaultSide: 'right',
    role: isZh ? '目击者' : 'Witness',
  };
  const discordLuna: ChatUser = {
    id: 'user-luna',
    name: 'Luna',
    avatar: '/imgs/avatars/1.png',
    color: '#f472b6',
    defaultSide: 'left',
    role: isZh ? '群主' : 'Admin',
  };
  const discordMilo: ChatUser = {
    id: 'user-milo',
    name: 'Milo',
    avatar: '/imgs/avatars/2.png',
    color: '#38bdf8',
    defaultSide: 'left',
  };
  const discordPoppy: ChatUser = {
    id: 'user-poppy',
    name: 'Poppy',
    avatar: '/imgs/avatars/3.png',
    color: '#f59e0b',
    defaultSide: 'left',
  };

  const whatsappYou: ChatUser = {
    id: CURRENT_SPEAKER_ID,
    name: isZh ? '我' : 'Me',
    avatar: '/imgs/avatars/5.png',
    color: '#25d366',
    defaultSide: 'right',
  };
  const whatsappMom: ChatUser = {
    id: 'user-mom',
    name: isZh ? '妈妈' : 'Mom',
    avatar: '/imgs/avatars/3.png',
    color: '#f59e0b',
    defaultSide: 'left',
  };
  const whatsappCousin: ChatUser = {
    id: 'user-cousin',
    name: isZh ? '表弟' : 'Kai',
    avatar: '/imgs/avatars/4.png',
    color: '#a78bfa',
    defaultSide: 'left',
  };
  const whatsappAuntie: ChatUser = {
    id: 'user-auntie',
    name: isZh ? '小姨' : 'Aunt May',
    avatar: '/imgs/avatars/1.png',
    color: '#ec4899',
    defaultSide: 'left',
  };

  const telegramYou: ChatUser = {
    id: CURRENT_SPEAKER_ID,
    name: isZh ? '我' : 'Me',
    avatar: '/imgs/avatars/5.png',
    color: '#38bdf8',
    defaultSide: 'right',
  };
  const telegramNora: ChatUser = {
    id: 'user-nora',
    name: 'Nora',
    avatar: '/imgs/avatars/1.png',
    color: '#22c55e',
    defaultSide: 'left',
  };
  const telegramEzra: ChatUser = {
    id: 'user-ezra',
    name: 'Ezra',
    avatar: '/imgs/avatars/2.png',
    color: '#f97316',
    defaultSide: 'left',
  };
  const telegramJune: ChatUser = {
    id: 'user-june',
    name: 'June',
    avatar: '/imgs/avatars/4.png',
    color: '#e879f9',
    defaultSide: 'left',
  };

  return [
    {
      id: 'discord-dumpling-heist',
      platform: 'discord',
      title: isZh ? '冰箱饺子失窃案 🕵️🥟' : 'The Dumpling Heist 🕵️🥟',
      subtitle: isZh
        ? '全员熬夜侦破“最后一盒饺子到底被谁偷吃了”'
        : 'A server-wide investigation into who stole the last dumplings',
      description: isZh
        ? '整个频道都在严查冰箱重案。有人拿拖鞋当证物，有人开始给猫做笔录，还有人试图用蒜蓉辣酱洗白自己，非常非常离谱。'
        : 'The entire server is treating a missing box of dumplings like a major criminal case. There is slipper evidence, cat interrogation, and somebody trying to clear their name with garlic sauce.',
      accent: 'from-[#6d78f7]/20 via-[#f472b6]/14 to-[#38bdf8]/18',
      channel: {
        id: 'channel-dumpling-heist',
        name: isZh ? '饺子失窃专案组' : 'dumpling-heist-unit',
        description: isZh
          ? '严查冰箱重案，怀疑每一个半夜路过厨房的人。'
          : 'Solving a major fridge crime and accusing everyone who passed the kitchen.',
        type: 'text',
      },
      users: {
        [discordYou.id]: discordYou,
        [discordLuna.id]: discordLuna,
        [discordMilo.id]: discordMilo,
        [discordPoppy.id]: discordPoppy,
      },
      messages: [
        createMessage(
          'case-discord-1',
          discordLuna,
          isZh
            ? '先别说话，冰箱最后一盒饺子没了。现在全员都列为嫌疑人。'
            : 'Nobody speak. The last box of dumplings is gone. You are all now suspects.',
          createTimestamp('2026-04-01T21:08:00.000Z', 0)
        ),
        createMessage(
          'case-discord-2',
          discordMilo,
          isZh
            ? '我申请提供不在场证明：案发时我正在沙发上和薯片进行深度交流。'
            : 'I would like to submit an alibi: at the time of the crime I was on the couch in deep conversation with a bag of chips.',
          createTimestamp('2026-04-01T21:08:00.000Z', 1)
        ),
        createMessage(
          'case-discord-3',
          discordYou,
          isZh
            ? '补充线索：现场留下了一只拖鞋，还有半瓶蒜蓉辣酱。我感觉这不是普通案件。'
            : 'Additional evidence: one slipper and half a bottle of garlic chili sauce were left at the scene. This is no ordinary case.',
          createTimestamp('2026-04-01T21:08:00.000Z', 2)
        ),
        createMessage(
          'case-discord-4',
          discordPoppy,
          isZh
            ? '那只拖鞋不是我的。我只有优雅拖鞋，没有犯罪拖鞋。'
            : 'That slipper is not mine. I own elegant slippers, not criminal slippers.',
          createTimestamp('2026-04-01T21:08:00.000Z', 3)
        ),
        createMessage(
          'case-discord-5',
          discordLuna,
          isZh
            ? '我已经开始给猫做笔录了。它刚刚眨了两下眼，我理解为默认认罪。'
            : 'I have begun interrogating the cat. It blinked twice, which I am choosing to treat as a confession.',
          createTimestamp('2026-04-01T21:08:00.000Z', 4)
        ),
        createMessage(
          'case-discord-6',
          discordYou,
          isZh
            ? '不对，猫没有开冰箱的手。真正的凶手可能是会蹑手蹑脚走路的人，也就是 Milo。'
            : 'Wait, the cat cannot open a fridge. The real criminal is clearly someone who walks suspiciously quietly, which means Milo.',
          createTimestamp('2026-04-01T21:08:00.000Z', 5)
        ),
        createMessage(
          'case-discord-7',
          discordMilo,
          isZh
            ? '反对！我只是天生脚步轻，不代表我会半夜抱着饺子站在冰箱前流泪。'
            : 'Objection. I simply walk lightly by nature. That does not mean I would stand in front of the fridge crying while holding dumplings.',
          createTimestamp('2026-04-01T21:08:00.000Z', 6)
        ),
        createMessage(
          'case-discord-8',
          discordPoppy,
          isZh
            ? '最新情况：保安刚说昨晚看到 Luna 抱着蒸锅在走廊狂奔。这个群今天别想睡了。'
            : 'Breaking news: the building guard says he saw Luna sprinting through the hallway with a steamer basket last night. Nobody in this server is sleeping now.',
          createTimestamp('2026-04-01T21:08:00.000Z', 7)
        ),
        createMessage(
          'case-discord-9',
          discordLuna,
          isZh
            ? '我澄清一下，我抱着蒸锅狂奔是为了保护证据，不是为了毁灭证据。'
            : 'Let me clarify: I was running with the steamer basket to protect evidence, not destroy it.',
          createTimestamp('2026-04-01T21:08:00.000Z', 8)
        ),
        createMessage(
          'case-discord-10',
          discordYou,
          isZh
            ? '可你嘴角那一点酱油还在。这个证词的可信度现在很危险。'
            : 'You still have soy sauce at the corner of your mouth. Your credibility is in critical condition.',
          createTimestamp('2026-04-01T21:08:00.000Z', 9)
        ),
        createMessage(
          'case-discord-11',
          discordMilo,
          isZh
            ? '我提议调监控。虽然我们没有监控，但气氛上必须像有。'
            : 'I propose we review security footage. We do not have any, but emotionally we do.',
          createTimestamp('2026-04-01T21:08:00.000Z', 10)
        ),
        createMessage(
          'case-discord-12',
          discordPoppy,
          isZh
            ? '别查了，我刚看到猫从沙发底下拖出一个空饺子盒。真正的幕后黑手一直在舔爪子。'
            : 'Stop the investigation. The cat just dragged an empty dumpling box out from under the couch. The real mastermind has been grooming itself this whole time.',
          createTimestamp('2026-04-01T21:08:00.000Z', 11)
        ),
      ],
      selectedIdentityId: CURRENT_SPEAKER_ID,
      preview: isZh
        ? ['拖鞋证物', '猫被做笔录', 'Milo 成嫌疑人', '保安突然爆料']
        : [
            'slipper evidence',
            'cat interrogation',
            'Milo accused',
            'guard testimony',
          ],
    },
    {
      id: 'whatsapp-wedding-outfit-chaos',
      platform: 'whatsapp',
      title: isZh ? '婚礼穿搭灾难群 👰🕺' : 'Wedding Outfit Emergency 👰🕺',
      subtitle: isZh
        ? '一个因为龙纹西装和烟雾机而逐渐崩溃的家族群'
        : 'A family group slowly collapsing over suits and smoke machines',
      description: isZh
        ? '原本只是讨论婚礼穿什么，后来突然出现龙纹紫西装、发光头箍、补光灯和烟雾机。整个群像在排练一场家庭情景喜剧。'
        : 'This began as a normal wedding outfit discussion and somehow turned into dragon-print suits, glowing headbands, ring lights, and a smoke machine. Pure family sitcom energy.',
      accent: 'from-[#25d366]/24 via-[#f59e0b]/12 to-[#f97316]/18',
      channel: {
        id: 'channel-wedding-outfit-chaos',
        name: isZh ? '婚礼穿搭应急群' : 'Wedding Outfit SOS',
        description: isZh
          ? '目标是体面出席婚礼，不是办个人演唱会。'
          : 'The goal is to attend a wedding, not launch a solo concert tour.',
        type: 'text',
      },
      users: {
        [whatsappYou.id]: whatsappYou,
        [whatsappMom.id]: whatsappMom,
        [whatsappCousin.id]: whatsappCousin,
        [whatsappAuntie.id]: whatsappAuntie,
      },
      messages: [
        createMessage(
          'case-whatsapp-1',
          whatsappMom,
          isZh
            ? '提醒一下，周六是婚礼，不是才艺总决赛，大家穿正常一点。'
            : 'Reminder: Saturday is a wedding, not the final round of a talent show. Please dress normally.',
          createTimestamp('2026-04-01T10:20:00.000Z', 0)
        ),
        createMessage(
          'case-whatsapp-2',
          whatsappCousin,
          isZh
            ? '那我想问一下，龙纹紫色西装算不算“有精神”但不过分？'
            : 'Then quick question: does a purple suit with gold dragons count as “spirited” but not excessive?',
          createTimestamp('2026-04-01T10:20:00.000Z', 2)
        ),
        createMessage(
          'case-whatsapp-3',
          whatsappYou,
          isZh
            ? '你这个问题本身已经说明它非常过分了。'
            : 'The fact that you had to ask already answers the question.',
          createTimestamp('2026-04-01T10:20:00.000Z', 4)
        ),
        createMessage(
          'case-whatsapp-4',
          whatsappAuntie,
          isZh
            ? '我支持一点夸张，但我已经买了会发光的头箍，所以我没有立场批评任何人。'
            : 'I support tasteful drama, but I already bought a glowing headband, so morally I cannot judge anyone.',
          createTimestamp('2026-04-01T10:20:00.000Z', 6)
        ),
        createMessage(
          'case-whatsapp-5',
          whatsappMom,
          isZh
            ? '头箍也不行！婚礼现场不是夜店门口！'
            : 'The headband is also not acceptable. This is a wedding, not the entrance to a nightclub.',
          createTimestamp('2026-04-01T10:20:00.000Z', 8)
        ),
        createMessage(
          'case-whatsapp-6',
          whatsappYou,
          isZh
            ? '我有个更大的问题，谁把“补光灯 x 2、便携烟雾机 x 1”加进待办清单里的？'
            : 'I have a much bigger concern: who added “2 ring lights and 1 portable smoke machine” to the checklist?',
          createTimestamp('2026-04-01T10:20:00.000Z', 10)
        ),
        createMessage(
          'case-whatsapp-7',
          whatsappCousin,
          isZh
            ? '烟雾机是我加的。我本来想在新人入场的时候营造一点宿命感。'
            : 'The smoke machine was me. I wanted to create a sense of destiny during the couple’s entrance.',
          createTimestamp('2026-04-01T10:20:00.000Z', 11)
        ),
        createMessage(
          'case-whatsapp-8',
          whatsappAuntie,
          isZh
            ? '我投反对票。上次你在家庭聚会放干冰，外婆以为厨房着火，拿锅盖冲出来了。'
            : 'I vote no. Last time you used dry ice at a family party, grandma thought the kitchen was on fire and ran in holding a pot lid.',
          createTimestamp('2026-04-01T10:20:00.000Z', 13)
        ),
        createMessage(
          'case-whatsapp-9',
          whatsappMom,
          isZh
            ? '我现在追加一条家规：谁再带发光配件，谁坐最边上那桌。'
            : 'I am adding a family rule: whoever brings glowing accessories gets seated at the farthest possible table.',
          createTimestamp('2026-04-01T10:20:00.000Z', 15)
        ),
        createMessage(
          'case-whatsapp-10',
          whatsappCousin,
          isZh
            ? '那如果我把龙纹西装外面套一件正常外套，到现场再脱，算不算规避检查？'
            : 'If I wear a normal coat over the dragon suit and reveal it on-site, does that count as compliance?',
          createTimestamp('2026-04-01T10:20:00.000Z', 16)
        ),
        createMessage(
          'case-whatsapp-11',
          whatsappYou,
          isZh
            ? '这叫有预谋地制造惊吓，不叫规避检查。'
            : 'That is not compliance. That is premeditated visual violence.',
          createTimestamp('2026-04-01T10:20:00.000Z', 17)
        ),
        createMessage(
          'case-whatsapp-12',
          whatsappAuntie,
          isZh
            ? '我建议婚礼前先开一次彩排，主题叫《如何在人类社会中正常行走》。'
            : 'I suggest a rehearsal before the wedding. Theme: “How to move through society like a regular person.”',
          createTimestamp('2026-04-01T10:20:00.000Z', 19)
        ),
      ],
      selectedIdentityId: CURRENT_SPEAKER_ID,
      preview: isZh
        ? ['龙纹紫西装', '发光头箍', '烟雾机提案', '外婆拿锅盖灭火']
        : [
            'dragon-print suit',
            'glow headband',
            'smoke machine plan',
            'grandma with pot lid',
          ],
    },
    {
      id: 'telegram-cat-mayor',
      platform: 'telegram',
      title: isZh ? '小区猫咪竞选市长 🐱🗳️' : 'Cat Mayor Election 🐱🗳️',
      subtitle: isZh
        ? '一群人认真给流浪猫设计竞选纲领'
        : 'A chat seriously drafting a campaign for a stray cat',
      description: isZh
        ? '整个群都在认真讨论让小区流浪猫参选“楼栋市长”，还有竞选口号、金枪鱼福利和激光笔基础建设，离谱得非常完整。'
        : 'The group is sincerely planning an election for the neighborhood stray cat to become building mayor, complete with slogans, tuna welfare, and laser-pointer infrastructure.',
      accent: 'from-[#38bdf8]/24 via-[#7dd3fc]/14 to-[#f9a8d4]/18',
      channel: {
        id: 'channel-cat-mayor',
        name: isZh ? '猫咪市长竞选办' : 'Cat Mayor Office',
        description: isZh
          ? '4 位成员，1 只野心勃勃的猫'
          : '4 members, 1 wildly ambitious cat',
        type: 'text',
      },
      users: {
        [telegramYou.id]: telegramYou,
        [telegramNora.id]: telegramNora,
        [telegramEzra.id]: telegramEzra,
        [telegramJune.id]: telegramJune,
      },
      messages: [
        createMessage(
          'case-telegram-1',
          telegramNora,
          isZh
            ? '我正式提名 3 号楼那只橘猫参选“本小区市长”。它有气场，也有肚量。'
            : 'I would like to formally nominate the orange cat from Building 3 for neighborhood mayor. It has presence and also a powerful stomach.',
          createTimestamp('2026-04-01T06:32:00.000Z', 0)
        ),
        createMessage(
          'case-telegram-2',
          telegramEzra,
          isZh
            ? '我支持。它上周在垃圾桶旁边坐了二十分钟，那个领导气质不是装得出来的。'
            : 'I support this. Last week it sat by the trash cans for twenty straight minutes with the stillness of a true public servant.',
          createTimestamp('2026-04-01T06:32:00.000Z', 2)
        ),
        createMessage(
          'case-telegram-3',
          telegramYou,
          isZh
            ? '那竞选口号我先写一个：让每一只猫都吃上金枪鱼，让每一扇窗台都有阳光。'
            : 'Then I propose a slogan: tuna for every cat, sunlight for every windowsill.',
          createTimestamp('2026-04-01T06:32:00.000Z', 4)
        ),
        createMessage(
          'case-telegram-4',
          telegramJune,
          isZh
            ? '我负责海报设计，但我建议不要拍它正脸，它每次看镜头都像在藐视选民。'
            : 'I can design the posters, but maybe do not use a front-facing photo. Every time it looks at the camera it seems offended by democracy.',
          createTimestamp('2026-04-01T06:32:00.000Z', 5)
        ),
        createMessage(
          'case-telegram-5',
          telegramNora,
          isZh
            ? '还有一项重点政策：每晚 8 点统一追激光笔，促进全民运动。'
            : 'Also a key policy point: citywide laser-pointer sessions at 8 p.m. to promote fitness and morale.',
          createTimestamp('2026-04-01T06:32:00.000Z', 6)
        ),
        createMessage(
          'case-telegram-6',
          telegramYou,
          isZh
            ? '反对派是谁？是 2 号楼那只天天睡快递柜上的黑猫吗？'
            : 'Who is the opposition candidate? Is it the black cat from Building 2 that sleeps on the package locker?',
          createTimestamp('2026-04-01T06:32:00.000Z', 8)
        ),
        createMessage(
          'case-telegram-7',
          telegramEzra,
          isZh
            ? '是，而且它昨天公开吃掉了我们准备的竞选传单。这个选举已经有黑幕味了。'
            : 'Yes, and yesterday it publicly ate one of our campaign flyers. This election already has scandal energy.',
          createTimestamp('2026-04-01T06:32:00.000Z', 10)
        ),
        createMessage(
          'case-telegram-8',
          telegramJune,
          isZh
            ? '我建议今晚开第一次居民说明会。主题就叫《为什么一只橘猫比我们更适合管理电梯秩序》。'
            : 'I suggest we hold the first town hall tonight. Topic: “Why an orange cat is more qualified than us to manage elevator etiquette.”',
          createTimestamp('2026-04-01T06:32:00.000Z', 12)
        ),
        createMessage(
          'case-telegram-9',
          telegramNora,
          isZh
            ? '我已经写了竞选承诺第一条：每天中午准时躺在大厅中央，增加社区凝聚力。'
            : 'I have drafted campaign promise number one: nap in the lobby every day at noon to improve neighborhood unity.',
          createTimestamp('2026-04-01T06:32:00.000Z', 14)
        ),
        createMessage(
          'case-telegram-10',
          telegramEzra,
          isZh
            ? '第二条应该是“凡是掉在地上的火腿肠，归市长优先处理”。'
            : 'Campaign promise number two should be: any dropped sausage is immediately handled by the mayor.',
          createTimestamp('2026-04-01T06:32:00.000Z', 15)
        ),
        createMessage(
          'case-telegram-11',
          telegramYou,
          isZh
            ? '我担心唯一的问题是它会在就职演说中舔自己肚子，群众可能会过于激动。'
            : 'My only concern is that it may lick its stomach during the inaugural speech and the public may become too emotional.',
          createTimestamp('2026-04-01T06:32:00.000Z', 16)
        ),
        createMessage(
          'case-telegram-12',
          telegramJune,
          isZh
            ? '没关系，真正的领袖从不解释自己的仪态。'
            : 'That is fine. A real leader never explains its posture.',
          createTimestamp('2026-04-01T06:32:00.000Z', 18)
        ),
      ],
      selectedIdentityId: CURRENT_SPEAKER_ID,
      preview: isZh
        ? ['橘猫参选市长', '金枪鱼福利', '激光笔基础建设', '快递柜黑猫反对派']
        : [
            'orange cat for mayor',
            'tuna welfare',
            'laser-pointer policy',
            'locker-cat opposition',
          ],
    },
    {
      id: 'discord-meme-court',
      platform: 'discord',
      title: isZh
        ? '表情包法庭开庭了 ⚖️😂'
        : 'Meme Court Is Now in Session ⚖️😂',
      subtitle: isZh
        ? '有人在 17 段道歉后回了一个“👍”，全服决定立案'
        : 'Someone replied “👍” to a 17-paragraph apology and the server opened a trial',
      description: isZh
        ? '整个群都在认真审理“长文道歉后只回一个点赞表情到底算不算冷暴力”。有人提交聊天记录，有人当庭播放 reaction 证据，离谱程度很高。'
        : 'The entire server is holding a serious trial over whether replying with one thumbs-up emoji after a giant apology thread counts as emotional damage. Evidence, witnesses, and way too much confidence.',
      accent: 'from-[#8b5cf6]/22 via-[#60a5fa]/14 to-[#f472b6]/18',
      channel: {
        id: 'channel-meme-court',
        name: isZh ? '表情包最高法院' : 'meme-supreme-court',
        description: isZh
          ? '今日开庭：一个点赞，伤害了多少人。'
          : 'Today’s hearing: how much damage can one thumbs-up do?',
        type: 'text',
      },
      users: {
        [discordYou.id]: discordYou,
        [discordLuna.id]: discordLuna,
        [discordMilo.id]: discordMilo,
        [discordPoppy.id]: discordPoppy,
      },
      messages: [
        createMessage(
          'case-discord-court-1',
          discordLuna,
          isZh
            ? '现在开庭。被告 Milo，请解释你为什么在一篇 17 段的道歉长文后只回了一个 👍'
            : 'Court is now in session. Milo, please explain why you replied with one 👍 after a 17-paragraph apology post.',
          createTimestamp('2026-04-01T22:12:00.000Z', 0)
        ),
        createMessage(
          'case-discord-court-2',
          discordMilo,
          isZh
            ? '我当时的意思是“收到并理解”，不是“你的人生到此为止”。'
            : 'My intention was “received and understood,” not “your emotional journey ends here.”',
          createTimestamp('2026-04-01T22:12:00.000Z', 1)
        ),
        createMessage(
          'case-discord-court-3',
          discordPoppy,
          isZh
            ? '反对。那个 👍 的角度太冷漠了，像极了 HR 通知试用期结束。'
            : 'Objection. The angle of that 👍 was icy. It had the exact energy of an HR probation email.',
          createTimestamp('2026-04-01T22:12:00.000Z', 2)
        ),
        createMessage(
          'case-discord-court-4',
          discordYou,
          isZh
            ? '我这里有证据：他还在点赞后 14 秒内上线打了两把游戏。'
            : 'I have evidence: he was spotted playing two games within 14 seconds of sending the thumbs-up.',
          createTimestamp('2026-04-01T22:12:00.000Z', 3)
        ),
        createMessage(
          'case-discord-court-5',
          discordMilo,
          isZh
            ? '那只是缓解紧张，不构成主观恶意。'
            : 'That was stress management, not evidence of malicious intent.',
          createTimestamp('2026-04-01T22:12:00.000Z', 4)
        ),
        createMessage(
          'case-discord-court-6',
          discordLuna,
          isZh
            ? '法警，把 reaction 放大投屏。我要让陪审团看看这个点赞到底有多敷衍。'
            : 'Bailiff, enlarge the reaction on the screen. The jury needs to witness the full laziness of this thumbs-up.',
          createTimestamp('2026-04-01T22:12:00.000Z', 5)
        ),
        createMessage(
          'case-discord-court-7',
          discordPoppy,
          isZh
            ? '天哪，这个点赞甚至没有后续感叹号。它冷得像办公室饮水机。'
            : 'My god, there was not even an exclamation mark after it. This reaction is colder than an office water cooler.',
          createTimestamp('2026-04-01T22:12:00.000Z', 6)
        ),
        createMessage(
          'case-discord-court-8',
          discordYou,
          isZh
            ? '陪审团一致决定：Milo 需连续发送 8 张猫猫安慰表情包，并写“我有在乎”。'
            : 'The jury has reached a verdict: Milo must send 8 comforting cat memes in a row and type “I do care.”',
          createTimestamp('2026-04-01T22:12:00.000Z', 7)
        ),
        createMessage(
          'case-discord-court-9',
          discordMilo,
          isZh
            ? '我请求上诉，因为 8 张猫图对我的网速和尊严都是重击。'
            : 'I request an appeal because 8 cat memes in a row is an attack on both my bandwidth and dignity.',
          createTimestamp('2026-04-01T22:12:00.000Z', 8)
        ),
        createMessage(
          'case-discord-court-10',
          discordPoppy,
          isZh
            ? '上诉驳回，另外追加 2 张会眨眼的小猫 GIF。'
            : 'Appeal denied, and I am adding 2 blinking kitten GIFs for tone repair.',
          createTimestamp('2026-04-01T22:12:00.000Z', 9)
        ),
        createMessage(
          'case-discord-court-11',
          discordLuna,
          isZh
            ? '书记员记一下：被告表现出轻微悔意，但还不够热乎。'
            : 'Let the record show the defendant has displayed mild remorse, but it is still not warm enough.',
          createTimestamp('2026-04-01T22:12:00.000Z', 10)
        ),
        createMessage(
          'case-discord-court-12',
          discordYou,
          isZh
            ? '好，散庭。下一个案子是“消息只回哈哈到底是真笑还是礼貌”。'
            : 'Court dismissed. Next case on the docket: whether replying only “haha” counts as real laughter or legal politeness.',
          createTimestamp('2026-04-01T22:12:00.000Z', 11)
        ),
      ],
      selectedIdentityId: CURRENT_SPEAKER_ID,
      preview: isZh
        ? [
            '17 段道歉长文',
            '冷漠点赞',
            'reaction 投屏取证',
            '8 张猫猫表情包赔偿',
          ]
        : [
            '17-paragraph apology',
            'cold thumbs-up',
            'reaction evidence',
            '8 cat memes赔偿',
          ],
    },
    {
      id: 'whatsapp-ac16-crisis',
      platform: 'whatsapp',
      title: isZh ? '谁把空调调到 16 度 ❄️🥶' : 'Who Set the AC to 16°C ❄️🥶',
      subtitle: isZh
        ? '家庭群正在追查把客厅吹成冷库的元凶'
        : 'A family group hunts whoever turned the living room into a freezer',
      description: isZh
        ? '这是一个从“谁把空调开太低了”一路发展到“每个人都裹着被子举证”的群聊。气氛像刑侦现场，但每个人都在发抖。'
        : 'A family chat that starts with “who turned the AC down too far” and quickly becomes a freezing crime investigation featuring blankets, witnesses, and theatrical suffering.',
      accent: 'from-[#60a5fa]/22 via-[#22c55e]/10 to-[#f8fafc]/20',
      channel: {
        id: 'channel-ac16-crisis',
        name: isZh ? '空调 16 度追凶群' : 'AC 16C Investigation',
        description: isZh
          ? '客厅不是冷库，所有人请停止制造北极。'
          : 'The living room is not the Arctic. Please stop creating weather.',
        type: 'text',
      },
      users: {
        [whatsappYou.id]: whatsappYou,
        [whatsappMom.id]: whatsappMom,
        [whatsappCousin.id]: whatsappCousin,
        [whatsappAuntie.id]: whatsappAuntie,
      },
      messages: [
        createMessage(
          'case-whatsapp-ac-1',
          whatsappMom,
          isZh
            ? '请问是谁把客厅空调调到 16 度？我刚进去的那一刻以为自己在冰箱里。'
            : 'Who set the living room AC to 16 degrees? I walked in and immediately felt like produce.',
          createTimestamp('2026-04-01T14:10:00.000Z', 0)
        ),
        createMessage(
          'case-whatsapp-ac-2',
          whatsappCousin,
          isZh
            ? '不是我。我只是说“有点热”，没说要把全家吹成帝王蟹。'
            : 'Not me. I said “it’s warm,” not “please transform the family into king crab.”',
          createTimestamp('2026-04-01T14:10:00.000Z', 1)
        ),
        createMessage(
          'case-whatsapp-ac-3',
          whatsappAuntie,
          isZh
            ? '我现在裹着毛毯吃西瓜，整个画面像旅游宣传片拍错了季节。'
            : 'I am currently wrapped in a blanket eating watermelon. The visual is deeply confusing.',
          createTimestamp('2026-04-01T14:10:00.000Z', 2)
        ),
        createMessage(
          'case-whatsapp-ac-4',
          whatsappYou,
          isZh
            ? '我刚在沙发缝里找到遥控器，上面还放着一张便签：别动，我在造雪。'
            : 'I found the remote in the sofa crack with a note on top that says: do not touch, I am making winter.',
          createTimestamp('2026-04-01T14:10:00.000Z', 3)
        ),
        createMessage(
          'case-whatsapp-ac-5',
          whatsappCousin,
          isZh
            ? '那不是便签，那是我的人生宣言。'
            : 'That was not a note. That was my life philosophy.',
          createTimestamp('2026-04-01T14:10:00.000Z', 4)
        ),
        createMessage(
          'case-whatsapp-ac-6',
          whatsappMom,
          isZh
            ? '我反对。现在连电视遥控器都起雾了。'
            : 'I reject this philosophy. Even the TV remote is developing condensation.',
          createTimestamp('2026-04-01T14:10:00.000Z', 5)
        ),
        createMessage(
          'case-whatsapp-ac-7',
          whatsappAuntie,
          isZh
            ? '刚刚外卖员进门说了一句“哇你们家好高级”，然后开始搓手。'
            : 'The delivery guy just walked in, said “wow, your house is premium,” and immediately started rubbing his hands for warmth.',
          createTimestamp('2026-04-01T14:10:00.000Z', 6)
        ),
        createMessage(
          'case-whatsapp-ac-8',
          whatsappYou,
          isZh
            ? '最终决定：空调调回 26 度，表弟被罚负责给每个人泡一杯热可可。'
            : 'Final ruling: AC back to 26, and cousin has been sentenced to making hot cocoa for everybody.',
          createTimestamp('2026-04-01T14:10:00.000Z', 7)
        ),
        createMessage(
          'case-whatsapp-ac-9',
          whatsappCousin,
          isZh
            ? '我接受处罚，但我要说明，16 度让我看见了更清醒的人生。'
            : 'I accept the sentence, but I would like to note that 16 degrees gave me access to a clearer version of life.',
          createTimestamp('2026-04-01T14:10:00.000Z', 8)
        ),
        createMessage(
          'case-whatsapp-ac-10',
          whatsappMom,
          isZh
            ? '你看见的是人生，我们看见的是白气。'
            : 'You saw clarity. We saw visible breath.',
          createTimestamp('2026-04-01T14:10:00.000Z', 9)
        ),
        createMessage(
          'case-whatsapp-ac-11',
          whatsappAuntie,
          isZh
            ? '我刚把脚伸出毛毯 3 秒，现在已经失去和世界的联系。'
            : 'I just let one foot out of the blanket for 3 seconds and briefly lost contact with reality.',
          createTimestamp('2026-04-01T14:10:00.000Z', 10)
        ),
        createMessage(
          'case-whatsapp-ac-12',
          whatsappYou,
          isZh
            ? '别说了，热可可里我给大家多加一勺糖，当作从北极回来的欢迎仪式。'
            : 'Say less. I am adding extra sugar to the cocoa as a welcome-back ceremony from the Arctic.',
          createTimestamp('2026-04-01T14:10:00.000Z', 11)
        ),
      ],
      selectedIdentityId: CURRENT_SPEAKER_ID,
      preview: isZh
        ? ['客厅变冷库', '毛毯配西瓜', '我在造雪', '热可可判决']
        : [
            'living-room freezer',
            'blanket plus watermelon',
            'I am making winter',
            'hot cocoa sentence',
          ],
    },
    {
      id: 'telegram-projector-exorcism',
      platform: 'telegram',
      title: isZh ? '投影仪驱魔大会 📽️🧿' : 'Projector Exorcism Meeting 📽️🧿',
      subtitle: isZh
        ? '会议室投影连不上后，大家开始怀疑玄学比技术更有用'
        : 'A group decides mysticism may work better than IT support',
      description: isZh
        ? '这是一个本来在解决投影仪连线问题，最后却一路升级到贴符、摆水果、点名旧同事来“镇机”的群聊。非常蠢，但非常好笑。'
        : 'This starts as a normal projector troubleshooting chat and somehow escalates into rituals, fruit offerings, and summoning a former coworker as a spiritual consultant. Extremely silly, extremely funny.',
      accent: 'from-[#38bdf8]/24 via-[#f59e0b]/10 to-[#a78bfa]/18',
      channel: {
        id: 'channel-projector-exorcism',
        name: isZh ? '投影仪抢救办' : 'Projector Rescue Unit',
        description: isZh
          ? '目标是开会，不是通灵，但现在很难说。'
          : 'The goal is to start a meeting, not contact another plane, but here we are.',
        type: 'text',
      },
      users: {
        [telegramYou.id]: telegramYou,
        [telegramNora.id]: telegramNora,
        [telegramEzra.id]: telegramEzra,
        [telegramJune.id]: telegramJune,
      },
      messages: [
        createMessage(
          'case-telegram-proj-1',
          telegramNora,
          isZh
            ? '投影仪又黑屏了。我按了三次开机键，它看起来像在装睡。'
            : 'The projector is black again. I pressed power three times and it seems committed to pretending it is asleep.',
          createTimestamp('2026-04-01T09:05:00.000Z', 0)
        ),
        createMessage(
          'case-telegram-proj-2',
          telegramEzra,
          isZh
            ? '我已经拔插 HDMI 七次了。它现在的态度像是对人生失去兴趣。'
            : 'I have unplugged and replugged the HDMI seven times. It now has the energy of a machine that has seen too much.',
          createTimestamp('2026-04-01T09:05:00.000Z', 1)
        ),
        createMessage(
          'case-telegram-proj-3',
          telegramJune,
          isZh
            ? '要不先试试传统方法：轻拍两下，再对它说“今天辛苦了”。'
            : 'Let us try the traditional method: pat it twice and whisper “thank you for your service.”',
          createTimestamp('2026-04-01T09:05:00.000Z', 2)
        ),
        createMessage(
          'case-telegram-proj-4',
          telegramYou,
          isZh
            ? '我刚看到有人在机器旁边放了一根香蕉。请问这是供品还是线索？'
            : 'I just noticed someone placed a banana next to the machine. Is that an offering or a clue?',
          createTimestamp('2026-04-01T09:05:00.000Z', 3)
        ),
        createMessage(
          'case-telegram-proj-5',
          telegramNora,
          isZh
            ? '是供品。上次它吃了我的 PPT，这次至少让它先吃水果。'
            : 'That is an offering. Last time it swallowed my presentation, so this time I wanted to start with fruit.',
          createTimestamp('2026-04-01T09:05:00.000Z', 4)
        ),
        createMessage(
          'case-telegram-proj-6',
          telegramEzra,
          isZh
            ? '我建议请上个月离职的老王回来。他是唯一一个能让这台机器感到愧疚的人。'
            : 'I suggest summoning Lao Wang from accounting. He is the only person this projector has ever feared.',
          createTimestamp('2026-04-01T09:05:00.000Z', 5)
        ),
        createMessage(
          'case-telegram-proj-7',
          telegramJune,
          isZh
            ? '等等，它亮了一下。是不是香蕉真的起作用了？'
            : 'Wait, it flickered. Did the banana actually work?',
          createTimestamp('2026-04-01T09:05:00.000Z', 6)
        ),
        createMessage(
          'case-telegram-proj-8',
          telegramYou,
          isZh
            ? '最终结论：技术部没修好，玄学部修好了。请把香蕉列为固定设备。'
            : 'Final conclusion: IT failed, mysticism succeeded. Please list one banana as standard meeting-room equipment.',
          createTimestamp('2026-04-01T09:05:00.000Z', 7)
        ),
        createMessage(
          'case-telegram-proj-9',
          telegramNora,
          isZh
            ? '另外请把“轻拍两下并说谢谢”写进操作手册第一页。'
            : 'Also please add “pat twice and say thank you” to page one of the operating manual.',
          createTimestamp('2026-04-01T09:05:00.000Z', 8)
        ),
        createMessage(
          'case-telegram-proj-10',
          telegramEzra,
          isZh
            ? '我提议操作手册分成技术篇和通灵篇，方便新人快速入门。'
            : 'I propose splitting the manual into a technical section and a spiritual section for onboarding efficiency.',
          createTimestamp('2026-04-01T09:05:00.000Z', 9)
        ),
        createMessage(
          'case-telegram-proj-11',
          telegramJune,
          isZh
            ? '香蕉用完怎么办？要不要准备应急苹果，避免会议中途失去法力支持。'
            : 'What happens if we run out of bananas? We may need emergency apples to maintain ritual stability.',
          createTimestamp('2026-04-01T09:05:00.000Z', 10)
        ),
        createMessage(
          'case-telegram-proj-12',
          telegramYou,
          isZh
            ? '请别开玩笑了，我已经在采购单上认真写下“投影仪安抚水果”。'
            : 'Please stop joking. I have already written “projector comfort fruit” onto the official supply sheet.',
          createTimestamp('2026-04-01T09:05:00.000Z', 11)
        ),
      ],
      selectedIdentityId: CURRENT_SPEAKER_ID,
      preview: isZh
        ? ['投影装睡', '香蕉供品', '召唤老王', '玄学部胜利']
        : [
            'projector pretending to sleep',
            'banana offering',
            'summon Lao Wang',
            'mysticism wins',
          ],
    },
  ] satisfies ChatSimulatorCaseTemplate[];
}
