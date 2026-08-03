import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { getCliClient } from 'sanity/cli';

const client = getCliClient({ apiVersion: '2026-04-07' }).withConfig({
  perspective: 'raw',
  useCdn: false,
});

const authorId = 'bdae8db0-573b-4b90-bb55-23886e9452bb';
const categoryId = '2c8e79c2-51d6-45b3-8009-a23e75e81a0d';
const siteUrl = 'https://www.chat-simulator.top';
const key = () => randomUUID().replaceAll('-', '').slice(0, 12);

function block(text, style = 'normal', listItem) {
  return {
    _key: key(),
    _type: 'block',
    children: [{ _key: key(), _type: 'span', marks: [], text }],
    markDefs: [],
    ...(listItem ? { level: 1, listItem } : {}),
    style,
  };
}

function linkedBlock(prefix, label, href, suffix = '') {
  const markKey = key();
  return {
    _key: key(),
    _type: 'block',
    children: [
      { _key: key(), _type: 'span', marks: [], text: prefix },
      { _key: key(), _type: 'span', marks: [markKey], text: label },
      { _key: key(), _type: 'span', marks: [], text: suffix },
    ],
    markDefs: [{ _key: markKey, _type: 'link', href }],
    style: 'normal',
  };
}

function portableBody({ intro, internalLink, sections }) {
  const result = intro.map((text) => block(text));
  if (internalLink) result.push(linkedBlock(...internalLink));
  for (const section of sections) {
    result.push(block(section.heading, 'h2'));
    for (const paragraph of section.paragraphs || [])
      result.push(block(paragraph));
    for (const item of section.bullets || [])
      result.push(block(item, 'normal', 'bullet'));
    for (const item of section.steps || [])
      result.push(block(item, 'normal', 'number'));
  }
  return result;
}

const posts = [
  {
    id: 'post-customer-support-training-scenario',
    image: 'public/blog/covers/customer-support-training-scenario.png',
    publishedAt: '2026-07-12T06:30:00.000Z',
    slug: {
      en: 'customer-support-training-scenario-chat-simulator',
      zh: 'customer-support-training-scenario-guide',
    },
    title: {
      en: 'How to Plan a Customer Support Training Scenario with a Chat Simulator',
      zh: '如何用聊天模拟器设计客服培训场景',
    },
    excerpt: {
      en: 'Build useful customer-support practice scenarios with clear learning goals, realistic decision points, safe fictional data, facilitator notes, and measurable review criteria.',
      zh: '从学习目标、脚本分支、虚构数据到复盘标准，系统设计清晰、安全、可衡量的客服培训对话场景。',
    },
    seoTitle: {
      en: 'Customer Support Training Scenario Guide | Chat Simulator',
      zh: '客服培训对话场景设计指南 | Chat Simulator',
    },
    seoDescription: {
      en: 'Plan customer-support training conversations with realistic context, decision branches, privacy safeguards, facilitator notes, and practical scoring criteria.',
      zh: '学习规划客服培训对话：设置真实情境、决策分支、隐私保护、讲师提示与可执行评分标准。',
    },
    alt: {
      en: 'Support team reviewing a branching training conversation and checklist',
      zh: '客服团队检查分支式培训对话和审核清单',
    },
    body: {
      en: {
        intro: [
          'A useful support-training scenario is more than a polished screenshot. It gives a learner enough context to make a decision, shows the consequence of that decision, and creates a repeatable way for a coach to discuss what happened. A chat simulator is helpful because it turns an abstract policy into a sequence of messages that feels concrete without exposing a real customer conversation.',
          'This guide explains how to design original practice material for onboarding, quality calibration, escalation training, and product-change preparation. The goal is not to imitate a private record. Every identity, order number, account detail, and outcome should be fictional or safely anonymized, and the exercise should be labeled as training material.',
        ],
        internalLink: [
          'Before building the exercise, review the ',
          'Chat Simulator editor',
          `${siteUrl}/`,
          ' so the script matches the available identity, timestamp, playback, and export controls.',
        ],
        sections: [
          {
            heading: '1. Start with one observable learning objective',
            paragraphs: [
              'Write the objective as a behavior that a coach can see. “Improve empathy” is too broad; “acknowledge the customer’s concern before requesting diagnostic information” is observable. A focused objective keeps the script short and makes feedback fair.',
              'One scenario should normally assess one primary skill and, at most, one supporting skill. If it tries to test tone, policy recall, technical troubleshooting, billing judgment, and escalation at the same time, a learner cannot tell which decision mattered.',
            ],
            bullets: [
              'Identify the target role and experience level.',
              'Name the decision the learner must make.',
              'Define what a successful response contains.',
              'Choose evidence the reviewer will record.',
            ],
          },
          {
            heading: '2. Build a believable but fictional customer context',
            paragraphs: [
              'Give the customer a clear goal, a small amount of relevant history, and an emotional state that fits the situation. Include only facts the support representative would genuinely know at that point. Missing information can become part of the exercise, but it should be intentional.',
              'Use invented names, non-routable addresses, impossible account identifiers, and fictional products when practical. Never paste a real ticket into a public or shared simulator. Even after names are removed, combinations of dates, locations, purchases, and unusual events can identify someone.',
            ],
          },
          {
            heading: '3. Map the conversation before writing dialogue',
            paragraphs: [
              'Outline the opening, information-gathering step, decision point, resolution, and closing. This simple map prevents the script from becoming a long exchange with no instructional purpose. It also makes it easier to create alternative versions for different skill levels.',
              'A branch should represent a meaningful choice, not a trick. For example, the learner may troubleshoot, ask a clarifying question, explain a limitation, or escalate. Each branch should have a plausible customer response and a clear coaching point.',
            ],
            steps: [
              'Opening: establish the request and tone.',
              'Discovery: reveal only the information needed for the decision.',
              'Decision: present the moment where the learner chooses an action.',
              'Consequence: show how the customer or system responds.',
              'Close: confirm the next step and ownership.',
            ],
          },
          {
            heading:
              '4. Write messages that sound natural and remain teachable',
            paragraphs: [
              'Keep each message focused on one idea. Real support conversations contain fragments and pauses, but adding every hesitation can make training material difficult to scan. Use enough realism to support the decision while removing noise that does not affect the lesson.',
              'Avoid creating an obviously unreasonable customer merely to make the correct answer easy. Good practice material respects the customer’s perspective and separates a legitimate concern from abusive behavior. When a boundary is required, explain what the representative can offer next.',
            ],
          },
          {
            heading: '5. Use timestamps and pacing as evidence',
            paragraphs: [
              'Timestamps can show whether the representative allowed time for a step, followed up after an interruption, or left the customer waiting without an update. Set them deliberately and keep them chronological. Do not claim that simulated response times represent actual service performance.',
              'During playback, check whether important instructions remain visible long enough to read. If the learner needs to compare several details, divide the information across messages or provide a separate reference card instead of shrinking the text.',
            ],
          },
          {
            heading: '6. Create facilitator notes and a scoring rubric',
            paragraphs: [
              'The visible chat is only the learner-facing layer. A facilitator also needs the objective, expected evidence, common mistakes, optional prompts, and a debrief question. Without these notes, two coaches may grade the same response very differently.',
              'Use a short rubric with observable criteria. A simple scale such as missing, partial, and complete is often more useful than a ten-point score. Record why a response met the standard so later calibration discussions use evidence rather than preference.',
            ],
            bullets: [
              'Accuracy: advice matches the current policy or product.',
              'Clarity: the next step and owner are explicit.',
              'Tone: language acknowledges the concern without making unsupported promises.',
              'Safety: personal data and sensitive details are handled correctly.',
              'Closure: the customer knows what will happen and when.',
            ],
          },
          {
            heading: '7. Pilot the scenario before using it at scale',
            paragraphs: [
              'Ask one experienced representative and one person closer to the target learner level to complete the exercise. If both misunderstand the setup, revise the context rather than treating confusion as failure. Time the exercise and note where participants request information the script never provides.',
              'Pilot feedback should improve the learning design, not make the simulated chat look more like a real private record. Check accessibility, reading order, terminology, and export size alongside instructional accuracy.',
            ],
          },
          {
            heading: '8. Review results and maintain the material',
            paragraphs: [
              'After a session, compare which decisions caused difficulty and whether the rubric captured them. Repeated failure may reveal a training gap, but it can also indicate outdated documentation, unclear product behavior, or an unrealistic scenario.',
              'Assign an owner and review date. Update or retire scenarios when policies, interfaces, prices, or escalation paths change. A smaller library of current, well-explained exercises is more valuable than a large archive of stale examples.',
            ],
          },
          {
            heading: 'Frequently asked questions',
            paragraphs: [
              'Can a simulated conversation replace supervised practice? No. It is a structured rehearsal tool. Sensitive or high-impact support work still needs current documentation, qualified supervision, and appropriate system training.',
              'Should learners see every branch? Usually not during the first attempt. Reveal alternatives during the debrief so the learner can compare consequences without turning the exercise into a guessing game.',
              'Can real tickets be adapted? Only with proper authorization and strong anonymization. Rewriting a common pattern from scratch is often safer and produces clearer teaching material.',
            ],
          },
          {
            heading: 'Final review checklist',
            bullets: [
              'The objective is observable and limited in scope.',
              'All people, identifiers, and events are fictional or safely authorized.',
              'The decision point and consequence are understandable.',
              'Messages, timestamps, and layout are easy to read.',
              'The rubric uses evidence rather than personal preference.',
              'The asset is labeled as a training simulation.',
              'An owner and review date are recorded.',
            ],
          },
        ],
      },
      zh: {
        intro: [
          '有效的客服培训场景不只是一张好看的聊天截图。它需要给学员足够背景，让学员做出明确决定，再展示决定带来的结果，并为讲师提供可重复的复盘依据。聊天模拟器能把抽象制度转换成具体消息顺序，同时避免公开真实客户记录。',
          '本文适用于新人入职、质检校准、升级处理和产品变更培训。所有姓名、账号、订单、地址和结果都应使用虚构或经过授权的脱敏信息，并清楚标注为“培训模拟”，不能把练习包装成真实客户对话。',
        ],
        internalLink: [
          '开始编写前，可以先了解 ',
          'Chat Simulator 编辑器',
          `${siteUrl}/zh`,
          ' 的角色、时间戳、播放与导出功能，再决定脚本结构。',
        ],
        sections: [
          {
            heading: '一、先确定一个可观察的学习目标',
            paragraphs: [
              '“提升同理心”过于宽泛，“在索取诊断信息前先确认用户的担忧”才是可以观察和复盘的行为。目标越具体，脚本越短，评分也越公平。',
              '一个场景通常只考察一个主要技能，最多附带一个次要技能。不要同时测试语气、政策、技术排查、账单判断和升级流程。',
            ],
            bullets: [
              '明确培训对象和经验水平。',
              '写出学员必须做出的关键决定。',
              '定义合格回答必须包含的证据。',
              '确定讲师要记录的观察结果。',
            ],
          },
          {
            heading: '二、建立可信但完全虚构的客户背景',
            paragraphs: [
              '为客户设置清楚目标、少量相关历史和符合情境的情绪，只提供客服在当时真正能够知道的信息。缺失信息可以成为练习的一部分，但必须经过设计。',
              '优先使用虚构姓名、不可用地址和明显无效的账号编号。不要直接复制真实工单；即使删除姓名，日期、地点、购买记录和特殊事件的组合仍可能识别个人。',
            ],
          },
          {
            heading: '三、先画流程，再写对话',
            paragraphs: [
              '先列出开场、信息收集、决策点、结果和结束语，避免脚本变成长篇闲聊。分支必须对应有意义的选择，例如继续排查、提出澄清问题、解释限制或升级处理。',
              '每个分支都要有合理的客户回应和明确的教学点，不要用故意刁钻的陷阱考学员。',
            ],
            steps: [
              '开场：说明请求和情绪。',
              '发现：逐步给出决定所需的信息。',
              '决策：让学员选择下一步。',
              '结果：展示客户或系统的反馈。',
              '收尾：确认负责人、时间和后续动作。',
            ],
          },
          {
            heading: '四、让消息自然且便于教学',
            paragraphs: [
              '每条消息只表达一个意思。真实聊天可能有大量停顿和碎片，但培训素材只需保留影响判断的细节。',
              '不要为了让答案明显而把客户写得不讲道理。好的场景尊重客户视角；需要设置边界时，也要说明客服还能提供哪些选择。',
            ],
          },
          {
            heading: '五、让时间戳成为流程证据',
            paragraphs: [
              '时间戳可以表现等待、跟进和中断后的恢复。所有时间必须按顺序递增，并且不能把模拟响应时间宣传成真实服务表现。',
              '播放时检查关键信息是否停留足够时间。需要比较多项资料时，应拆分消息或提供参考卡，不要单纯缩小字号。',
            ],
          },
          {
            heading: '六、准备讲师说明和评分标准',
            paragraphs: [
              '学员看到的是聊天，讲师还需要目标、正确证据、常见错误、提示方式和复盘问题。没有这些说明，不同讲师会给出不一致评价。',
              '评分应基于可观察行为。使用“缺失、部分完成、完整完成”通常比十分制更清楚。',
            ],
            bullets: [
              '准确：建议符合当前政策和产品。',
              '清晰：下一步和负责人明确。',
              '语气：承认问题，但不做无法验证的承诺。',
              '安全：正确处理个人和敏感信息。',
              '闭环：客户知道接下来会发生什么。',
            ],
          },
          {
            heading: '七、在规模使用前做小范围试运行',
            paragraphs: [
              '邀请一名资深客服和一名接近目标水平的学员完成练习。如果两人都误解背景，应修改脚本，而不是把困惑当作学员失败。',
              '记录完成时间、缺失信息、术语问题、阅读顺序和导出尺寸。试运行的目标是改进教学设计，而不是让画面更像真实私人记录。',
            ],
          },
          {
            heading: '八、根据结果维护培训素材',
            paragraphs: [
              '复盘困难点时，也要检查文档是否过期、产品行为是否改变、场景是否不现实。重复错误不一定只来自学员。',
              '为每个场景指定负责人和复查日期。政策、价格、界面或升级路径改变后及时更新或下线。少量准确、可解释的练习比大量过期资料更有价值。',
            ],
          },
          {
            heading: '常见问题',
            paragraphs: [
              '模拟对话不能替代监督实践。高风险客服工作仍需要当前文档、合格讲师和真实系统培训。',
              '第一次练习通常不展示全部分支，复盘时再比较不同决定的后果。真实工单只有在获得授权并充分脱敏后才能改编；从常见问题重新写一份虚构脚本往往更安全。',
            ],
          },
          {
            heading: '最终检查清单',
            bullets: [
              '目标具体且范围单一。',
              '人物、编号和事件均为虚构或已获授权。',
              '决策点和结果容易理解。',
              '消息、时间戳和版式清晰可读。',
              '评分依据是证据而不是个人偏好。',
              '素材明确标注为培训模拟。',
              '已记录负责人和复查日期。',
            ],
          },
        ],
      },
    },
  },
  {
    id: 'post-conversation-script-chat-mockup',
    image: 'public/blog/covers/conversation-script-chat-mockup.png',
    publishedAt: '2026-07-13T06:30:00.000Z',
    slug: {
      en: 'turn-conversation-script-into-clear-chat-mockup',
      zh: 'conversation-script-to-chat-mockup-guide',
    },
    title: {
      en: 'How to Turn a Conversation Script into a Clear Chat Mockup',
      zh: '如何把对话脚本制作成清晰的聊天演示图',
    },
    excerpt: {
      en: 'A practical workflow for converting a written conversation into a readable chat mockup with defined roles, concise messages, coherent timestamps, playback review, and responsible disclosure.',
      zh: '从角色、消息拆分、时间戳、播放检查到透明标注，把文字对话脚本转换成清晰易读的聊天演示图。',
    },
    seoTitle: {
      en: 'Conversation Script to Chat Mockup Guide | Chat Simulator',
      zh: '对话脚本转聊天演示图教程 | Chat Simulator',
    },
    seoDescription: {
      en: 'Convert a conversation script into a readable chat mockup by refining roles, message length, timestamps, pacing, export settings, and disclosure.',
      zh: '学习整理角色、消息长度、时间戳、节奏、导出设置和模拟说明，制作清晰的聊天演示图。',
    },
    alt: {
      en: 'Conversation script cards flowing into a clean chat mockup preview',
      zh: '对话脚本卡片转换成清晰聊天演示图的流程插画',
    },
    body: {
      en: {
        intro: [
          'A written dialogue and a readable chat mockup are not the same thing. A document can rely on headings, stage directions, and long paragraphs; a chat interface reveals information one message at a time. Converting the script therefore requires editorial decisions about context, identity, pacing, and what the reader can see on each screen.',
          'This workflow is suitable for product concepts, tutorials, training examples, classroom material, research prototypes, and clearly labeled fictional stories. It is not a recipe for fabricating private records. Use fictional identities, remove sensitive data, and explain that the result is simulated whenever a viewer could misunderstand its origin.',
        ],
        internalLink: [
          'Open the ',
          'Chat Simulator workspace',
          `${siteUrl}/`,
          ' only after the script has a clear purpose and message order; the editor is most effective when it receives a deliberate plan.',
        ],
        sections: [
          {
            heading: '1. Define the reader and the single takeaway',
            paragraphs: [
              'Write one sentence describing who will view the mockup and what that person should understand. A product manager reviewing a proposed flow needs different detail from a new user following a tutorial.',
              'Remove any exchange that does not support the takeaway. A realistic conversation may include greetings, jokes, and repeated confirmation, but a teaching asset needs enough context without unnecessary noise.',
            ],
          },
          {
            heading: '2. Separate dialogue from production notes',
            paragraphs: [
              'Keep spoken messages in one column and visual directions in another. Notes such as “pause here,” “show an attachment,” or “switch to mobile view” should not accidentally appear as character dialogue.',
              'Record each speaker’s role, goal, tone, and knowledge. This prevents one identity from explaining facts they could not reasonably know and keeps voice consistent across revisions.',
            ],
          },
          {
            heading: '3. Break long paragraphs into message-sized units',
            paragraphs: [
              'A message should usually carry one action, question, fact, or reaction. Split a paragraph when the speaker changes purpose or when the reader needs time to process a step.',
              'Do not create dozens of tiny bubbles merely for visual activity. Combine fragments that belong together, and read the sequence aloud to find unnatural breaks.',
            ],
            bullets: [
              'One question per message when an answer is required.',
              'Put critical limitations in their own visible message.',
              'Keep numbered procedures in a short sequence.',
              'Move background detail to the surrounding article when it is not needed on screen.',
            ],
          },
          {
            heading: '4. Establish identities without implying a real person',
            paragraphs: [
              'Use short names and visually distinct avatars. For a public example, choose fictional names, abstract portraits, initials, or original illustrations. Avoid copying a real person’s profile image, handle, verified badge, or organization role.',
              'If an identity represents a bot, support team, teacher, or organizer, label that function clearly. The reader should understand who is responsible for each statement.',
            ],
          },
          {
            heading: '5. Assign timestamps from the event logic',
            paragraphs: [
              'Start with the event order, then add times. A rapid clarification may take seconds; a task that requires reading, travel, or approval needs a larger gap. Time references in the dialogue must agree with the displayed date.',
              'Timestamps should improve comprehension, not manufacture authenticity. Do not use them to suggest that a fictional promise, purchase, or response actually occurred.',
            ],
          },
          {
            heading: '6. Build the first version with minimal styling',
            paragraphs: [
              'Enter identities and messages before spending time on colors or decorative details. Select Web or Mobile layout according to the destination, then check whether the script fits comfortably at the intended size.',
              'A neutral first pass makes structural problems visible. If the reader cannot follow the exchange without custom styling, colors will not solve the missing context.',
            ],
          },
          {
            heading: '7. Use playback as an editorial test',
            paragraphs: [
              'Watch the conversation without referring to the original script. Note where a reply appears before its question is understood, where a role changes tone, or where the viewer needs information that never appeared.',
              'Ask a second person to describe the scenario after one viewing. Their summary is a better clarity test than asking whether the image looks attractive. Revise one issue at a time and replay the sequence.',
            ],
          },
          {
            heading: '8. Export for the actual publishing context',
            paragraphs: [
              'Use a Mobile composition for phone feeds and vertical tutorials; use Web for documentation and desktop demonstrations. PNG is useful for small text and sharp interface details. JPG may be smaller, but compression can damage pale text and avatar edges.',
              'Preview the exported file at its real display width. Check cropping, safe margins, contrast, file size, alt text, and whether a simulation label remains visible.',
            ],
          },
          {
            heading: '9. Add context and responsible disclosure',
            paragraphs: [
              'The surrounding title, caption, and article should state the purpose of the mockup. Labels such as “simulated conversation,” “fictional example,” “training scenario,” or “product concept” are short and clear.',
              'Do not present a fictional exchange as a testimonial, private leak, payment proof, support commitment, or third-party endorsement. Clear disclosure protects the audience and makes the asset easier to reuse.',
            ],
          },
          {
            heading: 'Frequently asked questions',
            paragraphs: [
              'How many messages should one mockup contain? There is no universal number. Use the fewest messages that preserve the decision or lesson, and split a long flow into several images rather than shrinking everything.',
              'Should the mockup copy a familiar messaging platform? A familiar structure can help orientation, but an independent visual style and no official logos reduce confusion. The content and teaching purpose matter more than pixel-level imitation.',
              'Can AI write the script? It can assist with a draft, but a person must verify facts, rights, tone, duplication, and privacy before publication.',
            ],
          },
          {
            heading: 'Final production checklist',
            bullets: [
              'The audience and takeaway are defined.',
              'Every message supports the purpose.',
              'Identities are fictional, authorized, and clearly differentiated.',
              'Timestamps follow the event logic.',
              'Playback works without missing context.',
              'The final size remains readable and accessible.',
              'The simulated nature is clearly disclosed.',
            ],
          },
        ],
      },
      zh: {
        intro: [
          '文字对话和可读的聊天演示图并不是同一种内容。文档可以依赖标题、舞台说明和长段落，聊天界面却会一条一条呈现信息。因此，转换过程需要重新决定背景、身份、节奏以及每个屏幕上能够看到的内容。',
          '这套流程适合产品概念、教程、培训案例、课堂材料、研究原型和明确标注的虚构故事，不适合伪造私人记录。公开发布时应使用虚构身份、删除敏感信息，并在可能引起误解时说明内容为模拟。',
        ],
        internalLink: [
          '建议先确定目的和消息顺序，再打开 ',
          'Chat Simulator 工作区',
          `${siteUrl}/zh`,
          ' 进行角色、时间戳、播放和导出设置。',
        ],
        sections: [
          {
            heading: '一、确定读者和唯一核心信息',
            paragraphs: [
              '用一句话写清楚谁会看这张图，以及看完后应理解什么。产品经理评审流程需要的细节，与新用户阅读教程完全不同。',
              '删除不能支持核心信息的交流。真实聊天会有寒暄、玩笑和重复确认，但教学素材只需保留必要背景。',
            ],
          },
          {
            heading: '二、把台词与制作说明分开',
            paragraphs: [
              '把角色真正说出的消息放在一列，把“这里暂停”“展示附件”“切换移动端”等制作指令放在另一列，避免说明误入对话。',
              '记录每个角色的职责、目标、语气和已知信息，防止角色说出不可能知道的内容，也能让多次修改后的声音保持一致。',
            ],
          },
          {
            heading: '三、把长段落拆成消息单元',
            paragraphs: [
              '每条消息通常只承担一个动作、问题、事实或反应。说话目的改变、读者需要停顿或操作步骤切换时，就应拆分。',
              '不要为了热闹而制造几十个过短气泡。属于同一意思的碎片可以合并，并通过朗读发现不自然的断点。',
            ],
            bullets: [
              '需要回答时，每条消息只问一个主要问题。',
              '重要限制单独成条，避免被忽略。',
              '操作步骤使用简短编号序列。',
              '不影响屏幕流程的背景信息放到文章正文。',
            ],
          },
          {
            heading: '四、建立清楚但不冒充真人的身份',
            paragraphs: [
              '使用简短名称和容易区分的头像。公开示例应选择虚构姓名、抽象头像、字母头像或原创插画，不复制真实个人的头像、账号、认证标志和组织身份。',
              '机器人、客服、教师和活动组织者都要明确标注职责，让读者知道每句话由谁负责。',
            ],
          },
          {
            heading: '五、根据事件逻辑设置时间戳',
            paragraphs: [
              '先确定事件顺序，再填写时间。快速澄清可能只需几十秒，需要阅读、出行或审批的步骤应留出更大间隔。',
              '时间戳用于帮助理解，而不是制造真实感。不要用模拟时间暗示虚构承诺、购买或客服响应真实发生过。',
            ],
          },
          {
            heading: '六、先做最少样式的第一版',
            paragraphs: [
              '先输入角色和消息，再处理颜色和装饰。根据发布渠道选择 Web 或 Mobile，并检查脚本能否在目标尺寸自然容纳。',
              '中性第一版最容易暴露结构问题。如果没有配色就无法理解，说明缺失的是背景或顺序，而不是视觉效果。',
            ],
          },
          {
            heading: '七、用播放功能做编辑检查',
            paragraphs: [
              '不看原稿播放整段对话，记录哪些回复在问题尚未清楚时出现、哪些角色突然改变语气、哪些信息根本没有展示。',
              '让未参与编写的人看一次并复述情境。对方的复述比“是否好看”更能衡量清晰度。一次只改一个问题，再重新播放。',
            ],
          },
          {
            heading: '八、为真实发布环境导出',
            paragraphs: [
              '手机信息流和竖屏教程适合 Mobile，文档和桌面演示适合 Web。小字号和界面细节较多时优先 PNG；使用 JPG 时要检查压缩后的浅色文字和头像边缘。',
              '按最终显示宽度预览文件，检查裁剪、安全边距、对比度、文件大小、替代文字和模拟标签。',
            ],
          },
          {
            heading: '九、补充上下文和透明说明',
            paragraphs: [
              '标题、说明文字和文章正文应说明演示图用途。“模拟对话”“虚构示例”“培训场景”和“产品概念”都简短清楚。',
              '不要把虚构交流当作客户评价、私人泄露、付款证明、客服承诺或第三方推荐。透明说明能保护读者，也方便素材长期复用。',
            ],
          },
          {
            heading: '常见问题',
            paragraphs: [
              '消息数量没有固定答案。保留完成教学目标所需的最少消息；内容过长时拆成多张图，不要不断缩小文字。',
              '熟悉的界面结构有助于理解，但不必像素级复制某个平台。使用独立视觉、不放官方标志并清楚说明用途更稳妥。AI 可以辅助起草，但发布前仍需人工核对事实、版权、语气、重复度和隐私。',
            ],
          },
          {
            heading: '最终制作清单',
            bullets: [
              '读者和核心信息已经明确。',
              '每条消息都服务于内容目的。',
              '身份为虚构或已获授权，并容易区分。',
              '时间戳符合事件逻辑。',
              '播放时没有缺失背景。',
              '最终尺寸清晰且具有可访问性。',
              '模拟属性已经清楚说明。',
            ],
          },
        ],
      },
    },
  },
  {
    id: 'post-chat-screenshot-accessibility',
    image: 'public/blog/covers/chat-screenshot-accessibility.png',
    publishedAt: '2026-07-14T06:30:00.000Z',
    slug: {
      en: 'chat-screenshot-accessibility-checklist',
      zh: 'chat-screenshot-accessibility-checklist',
    },
    title: {
      en: 'Chat Screenshot Accessibility Checklist: Text, Contrast, Order, and Alt Text',
      zh: '聊天截图无障碍检查清单：文字、对比度、顺序与替代文本',
    },
    excerpt: {
      en: 'Make chat mockups easier to read with practical checks for font size, contrast, color-independent identities, reading order, captions, alt text, motion, and mobile export.',
      zh: '通过字号、对比度、非颜色身份区分、阅读顺序、字幕、替代文本、动画和移动端导出检查，让聊天演示图更易阅读。',
    },
    seoTitle: {
      en: 'Chat Screenshot Accessibility Checklist | Chat Simulator',
      zh: '聊天截图无障碍检查清单 | Chat Simulator',
    },
    seoDescription: {
      en: 'Review chat screenshots for readable text, sufficient contrast, clear identity cues, logical order, useful alt text, captions, and accessible export.',
      zh: '检查聊天截图的文字、对比度、身份提示、阅读顺序、替代文本、字幕和导出效果。',
    },
    alt: {
      en: 'Accessibility review of a chat mockup across desktop and mobile screens',
      zh: '在桌面和手机屏幕上检查聊天演示图的无障碍表现',
    },
    body: {
      en: {
        intro: [
          'A chat mockup can look clear on a designer’s large monitor and still be difficult to understand in a phone feed, presentation, or screen magnifier. Small timestamps, pale bubbles, color-only speaker cues, and rapid playback are common barriers. Accessibility review should therefore happen before export, not after someone reports a problem.',
          'This checklist focuses on practical improvements that benefit people with low vision, color-vision differences, reading or attention difficulties, motor limitations, hearing loss, and temporary constraints such as glare or a small screen. It does not replace testing with users, but it provides a consistent first review.',
        ],
        internalLink: [
          'Create a draft in the ',
          'Chat Simulator editor',
          `${siteUrl}/`,
          ', then inspect the exported asset at the exact size and in the context where readers will encounter it.',
        ],
        sections: [
          {
            heading: '1. Test the final display size, not only the editor',
            paragraphs: [
              'Export one representative frame and place it in the intended blog column, slide, mobile feed, or course page. If a reader must zoom before understanding names and messages, increase the size or reduce the amount of content.',
              'Avoid solving overflow by shrinking every element. Split a long conversation into a sequence and keep a stable header or short context line so each part remains understandable.',
            ],
          },
          {
            heading: '2. Use readable typography and line length',
            paragraphs: [
              'Choose a font size that survives export and compression. Thin weights and tight line spacing often disappear on small screens. Keep message lines short enough to scan without creating a very tall column of one- or two-word fragments.',
              'Do not use decorative letterforms for essential information. Names, timestamps, status text, and labels should remain distinguishable when the image is reduced.',
            ],
          },
          {
            heading: '3. Check contrast in every message state',
            paragraphs: [
              'Measure the relationship between text and its bubble, not only text and the page background. Check incoming and outgoing messages, timestamps, muted notes, links, selected elements, and any text placed over an image.',
              'A bright accent color can still produce poor contrast with white text. If exact conformance matters, use an established contrast checker with the final color values rather than judging by eye.',
            ],
          },
          {
            heading: '4. Do not identify speakers by color alone',
            paragraphs: [
              'People with color-vision differences may not distinguish two similar bubbles or avatar rings. Combine color with a visible name, avatar shape, alignment, icon, or consistent position.',
              'Keep the cue stable across every frame. If one participant changes color during the sequence without explanation, the reader may interpret that as a new person.',
            ],
            bullets: [
              'Display a name when several identities participate.',
              'Use distinct avatar silhouettes or initials.',
              'Keep alignment and bubble treatment consistent.',
              'Explain status changes with text or shape as well as color.',
            ],
          },
          {
            heading: '5. Preserve a logical reading order',
            paragraphs: [
              'Messages should appear in chronological order, and timestamps should increase accordingly. Avoid decorative side panels that look like part of the conversation but are intended to be read later.',
              'For multi-image sequences, number the parts in the surrounding page and give each image a descriptive caption. Do not rely on a collage layout whose reading direction changes between desktop and mobile.',
            ],
          },
          {
            heading: '6. Write useful alt text and nearby context',
            paragraphs: [
              'Alt text should communicate the purpose and important information of the image, not list every visual detail. If the complete dialogue is essential, provide it as selectable text near the image instead of forcing a very long alt attribute.',
              'Do not begin with “image of” unless the format itself matters. Mention that the conversation is simulated when that context is important. Decorative covers can use concise alt text while instructional screenshots need a more informative description.',
            ],
          },
          {
            heading: '7. Add captions and transcripts for motion',
            paragraphs: [
              'A chat video or playback export should not require audio to understand it. Caption spoken or sound-based information, and provide a transcript when the exact conversation matters.',
              'Give viewers enough time to read each message and avoid rapid flashing, constant typing indicators, or movement that competes with the content. When possible, offer a static alternative.',
            ],
          },
          {
            heading: '8. Review keyboard and control accessibility on the page',
            paragraphs: [
              'An exported image is only one part of the experience. The page around it should have visible focus states, descriptive links, keyboard-reachable controls, and buttons with clear names.',
              'Do not place an essential explanation only in a hover tooltip. On touch devices and for keyboard users, hover-only content may be unavailable.',
            ],
          },
          {
            heading: '9. Test across light, dark, and compressed contexts',
            paragraphs: [
              'A mockup designed for a light page may lose its boundary on a white background; a dark version may create glare or weak muted text. Preview the actual theme combinations used by the destination.',
              'Social networks and content platforms may resize or recompress uploads. Inspect the uploaded preview before publishing, especially around small text, thin icons, gradients, and avatar edges.',
            ],
          },
          {
            heading: '10. Include people with disabilities in review',
            paragraphs: [
              'Automated checks can find some contrast and markup problems, but they cannot decide whether a conversation is cognitively clear or whether the reading pace is comfortable. User feedback provides that missing evidence.',
              'Document what was tested, on which device and size, and what remains uncertain. Accessibility is an ongoing quality practice rather than a one-time badge.',
            ],
          },
          {
            heading: 'Frequently asked questions',
            paragraphs: [
              'Is alt text enough? No. It cannot repair unreadable text, confusing order, inaccessible playback, or controls that cannot be reached. Use it as one part of an accessible presentation.',
              'Should every message be copied into alt text? Usually not. When the transcript is essential, publish it as normal text next to the image and keep the alt text focused on purpose and summary.',
              'Does high contrast mean black and white only? No. Many palettes can work when measured carefully and combined with non-color cues.',
            ],
          },
          {
            heading: 'Pre-publication accessibility checklist',
            bullets: [
              'Text remains readable at the actual display size.',
              'Message text, timestamps, and labels have sufficient contrast.',
              'Speakers are distinguishable without relying only on color.',
              'Reading order is chronological and predictable.',
              'Alt text describes purpose and essential information.',
              'Important dialogue is available as selectable text when needed.',
              'Motion has captions, readable timing, and a static alternative.',
              'The surrounding page works with keyboard navigation.',
            ],
          },
        ],
      },
      zh: {
        intro: [
          '聊天演示图在设计师的大屏幕上可能很清楚，放进手机信息流、演示文稿或放大工具后却难以理解。过小的时间戳、浅色气泡、只靠颜色区分角色和过快播放，都是常见障碍。因此，无障碍检查应在导出前进行。',
          '下面的清单关注低视力、色觉差异、阅读或注意困难、行动限制、听力障碍，以及眩光和小屏幕等临时限制。它不能替代真实用户测试，但能建立一致的第一轮审核。',
        ],
        internalLink: [
          '可以先在 ',
          'Chat Simulator 编辑器',
          `${siteUrl}/zh`,
          ' 制作草稿，再按最终展示尺寸和发布环境检查导出文件。',
        ],
        sections: [
          {
            heading: '一、按最终显示尺寸测试',
            paragraphs: [
              '导出一张代表性画面，放进真实的博客栏宽、幻灯片、手机信息流或课程页面。如果读者必须放大才能看清姓名和消息，应增加尺寸或减少内容。',
              '不要用缩小全部元素解决溢出。长对话可以拆成连续图片，并保留稳定标题或简短背景。',
            ],
          },
          {
            heading: '二、使用清晰字号和合理行长',
            paragraphs: [
              '选择经过导出和压缩后仍然清楚的字号。过细字重和过紧行距在小屏幕上容易消失。',
              '姓名、时间、状态和标签不能使用难以辨认的装饰字体。消息行既不能太长，也不要被拆成大量一两个词的碎片。',
            ],
          },
          {
            heading: '三、检查每一种消息状态的对比度',
            paragraphs: [
              '检查文字与气泡之间的对比，而不只是文字与页面背景。收到和发出的消息、时间戳、弱化说明、链接、选中状态以及图片上的文字都要单独检查。',
              '鲜艳颜色配白字也可能不达标。需要满足明确标准时，应使用对比度工具核对最终颜色值，而不是只凭肉眼判断。',
            ],
          },
          {
            heading: '四、不要只靠颜色区分角色',
            paragraphs: [
              '色觉差异用户可能无法分辨相近的气泡或头像边框。应把颜色与姓名、头像形状、对齐方式、图标或固定位置结合。',
              '提示方式在每一帧都要保持稳定，不要无原因改变同一角色的颜色。',
            ],
            bullets: [
              '多角色场景显示名称。',
              '使用容易区分的头像轮廓或字母头像。',
              '保持对齐方向和气泡样式一致。',
              '状态变化同时使用文字或形状说明。',
            ],
          },
          {
            heading: '五、保持可预测的阅读顺序',
            paragraphs: [
              '消息按时间顺序出现，时间戳也应递增。不要让装饰面板看起来像对话的一部分，却要求读者最后再看。',
              '多图序列应在页面中编号并提供说明，不要依赖桌面端和移动端顺序不同的拼贴布局。',
            ],
          },
          {
            heading: '六、编写有用的替代文本和上下文',
            paragraphs: [
              '替代文本应说明图片用途和关键信息，不必罗列所有视觉细节。如果完整对话非常重要，应在图片附近提供可选择的文字版本，而不是写成超长 alt。',
              '需要时说明这是模拟对话。装饰性封面可以简短，教程截图则要提供更具体的内容摘要。',
            ],
          },
          {
            heading: '七、为动态内容提供字幕和文字稿',
            paragraphs: [
              '聊天视频或播放导出不能依赖声音才能理解。声音信息需要字幕，精确对话重要时还应提供文字稿。',
              '给读者足够时间阅读消息，避免快速闪烁、持续输入动画或干扰内容的运动，并尽可能提供静态版本。',
            ],
          },
          {
            heading: '八、检查页面上的键盘和控件体验',
            paragraphs: [
              '图片只是体验的一部分。周围页面应具有清楚的焦点状态、描述性链接、可由键盘访问的控件和明确的按钮名称。',
              '不要把必要说明只放在悬停提示里；触屏和键盘用户可能无法获得这些内容。',
            ],
          },
          {
            heading: '九、在明暗主题和压缩后复查',
            paragraphs: [
              '浅色演示图可能在白色页面上失去边界，深色版本也可能眩光或弱化文字。应按实际主题组合预览。',
              '社交平台通常会缩放和重新压缩图片。发布前检查上传预览，重点观察小字、细图标、渐变和头像边缘。',
            ],
          },
          {
            heading: '十、让残障用户参与审核',
            paragraphs: [
              '自动工具能发现部分对比度和标记问题，却无法判断对话是否容易理解、播放节奏是否舒适。真实用户反馈可以补足这些证据。',
              '记录测试的设备、尺寸、方法和仍不确定的地方。无障碍是持续的质量实践，不是一次性标签。',
            ],
          },
          {
            heading: '常见问题',
            paragraphs: [
              '替代文本不能修复小字、错误顺序、过快播放和无法操作的控件，它只是完整体验的一部分。',
              '通常不应把全部消息塞进 alt；关键文字应作为普通正文提供。高对比度也不等于只能用黑白，经过测量并配合非颜色提示的多种配色都可以使用。',
            ],
          },
          {
            heading: '发布前无障碍清单',
            bullets: [
              '最终尺寸下文字仍然清楚。',
              '消息、时间戳和标签具有足够对比度。',
              '不依赖颜色也能区分角色。',
              '阅读顺序符合时间和逻辑。',
              '替代文本说明用途和关键信息。',
              '必要对话提供可选择的文字版本。',
              '动态内容有字幕、合理速度和静态替代。',
              '周围页面支持键盘访问。',
            ],
          },
        ],
      },
    },
  },
];

function textOf(blockValue) {
  return (blockValue.children || [])
    .map((child) => child.text || '')
    .join('')
    .trim();
}

function normalizeExistingBody(body) {
  const headings = {
    en: /^(?:\d+\.\s+|FAQ$|Frequently asked questions$|Common problems|Appropriate use cases$|Final checklist$|Content review checklist$|Conclusion$)/i,
    zh: /^(?:[一二三四五六七八九十]+、|常见问题|适用场景|最终检查清单|内容审核清单|发布前检查清单|总结|结论)/,
  };
  const next = {};
  for (const locale of ['en', 'zh']) {
    next[locale] = (body?.[locale] || []).map((item, index) => {
      if (item._type !== 'block' || index === 0 || item.style !== 'normal')
        return item;
      return headings[locale].test(textOf(item))
        ? { ...item, style: 'h2' }
        : item;
    });
  }
  return { ...body, ...next };
}

async function publishCategory() {
  const draftId = `drafts.${categoryId}`;
  const existing = await client.getDocument(categoryId);
  if (existing) return;
  const draft = await client.getDocument(draftId);
  const category = draft || {
    _id: categoryId,
    _type: 'category',
    title: { _type: 'localizedString', en: 'Guides', zh: '使用指南' },
    slug: {
      _type: 'object',
      en: { _type: 'slug', current: 'guides' },
      zh: { _type: 'slug', current: 'guides' },
    },
    description: {
      _type: 'localizedText',
      en: 'Original tutorials for creating, refining, and exporting chat mockups with Chat Simulator.',
      zh: '关于使用 Chat Simulator 创建、整理和导出聊天演示图的原创教程。',
    },
    orderRank: 10,
  };
  const { _rev, _createdAt, _updatedAt, ...clean } = category;
  await client
    .transaction()
    .createOrReplace({ ...clean, _id: categoryId })
    .delete(draftId)
    .commit();
}

async function upgradeExistingPosts() {
  const existingPosts = await client.fetch(
    `*[_type == "post" && !(_id in path("drafts.**"))]{_id,body,categories}`
  );
  for (const post of existingPosts) {
    const categories = [
      ...(post.categories || []).filter((ref) => ref?._ref !== categoryId),
      { _key: key(), _type: 'reference', _ref: categoryId },
    ];
    await client
      .patch(post._id)
      .set({ body: normalizeExistingBody(post.body), categories })
      .commit();
  }
  return existingPosts.length;
}

async function uploadCover(path, filename) {
  return client.assets.upload('image', readFileSync(path), { filename });
}

async function publishPost(post) {
  const asset = await uploadCover(post.image, post.image.split('/').at(-1));
  const document = {
    _id: post.id,
    _type: 'post',
    author: { _type: 'reference', _ref: authorId },
    body: {
      _type: 'localizedBody',
      en: portableBody(post.body.en),
      zh: portableBody(post.body.zh),
    },
    categories: [{ _key: key(), _type: 'reference', _ref: categoryId }],
    coverImage: {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
    },
    coverImageAlt: { _type: 'localizedString', ...post.alt },
    excerpt: { _type: 'localizedText', ...post.excerpt },
    featured: true,
    noindex: false,
    publishedAt: post.publishedAt,
    seoDescription: { _type: 'localizedText', ...post.seoDescription },
    seoTitle: { _type: 'localizedString', ...post.seoTitle },
    slug: {
      _type: 'object',
      en: { _type: 'slug', current: post.slug.en },
      zh: { _type: 'slug', current: post.slug.zh },
    },
    title: { _type: 'localizedString', ...post.title },
    updatedAt: new Date().toISOString(),
  };
  await client
    .transaction()
    .createOrReplace(document)
    .delete(`drafts.${post.id}`)
    .commit();
  return {
    id: post.id,
    imageAsset: asset._id,
    publishedAt: post.publishedAt,
    slug: post.slug,
  };
}

async function revalidate(post, type = 'post') {
  const response = await fetch(`${siteUrl}/api/revalidate/sanity`, {
    body: JSON.stringify({ slugs: post.slug, type }),
    headers: {
      'content-type': 'application/json',
      'x-webhook-secret': process.env.SANITY_REVALIDATE_SECRET,
    },
    method: 'POST',
  });
  if (!response.ok) throw new Error(`Revalidation failed: ${response.status}`);
}

await publishCategory();
const upgraded = await upgradeExistingPosts();
const published = [];
for (const post of posts) {
  published.push(await publishPost(post));
  await revalidate(post);
}
await revalidate({ slug: { en: 'guides', zh: 'guides' } }, 'category');
console.log(
  JSON.stringify({ upgradedExistingPosts: upgraded, published }, null, 2)
);
