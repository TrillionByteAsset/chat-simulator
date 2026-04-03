import type { ToolManifest } from '@/core/tooling-engine/types';

export function isChineseLocale(locale?: string) {
  return locale?.toLowerCase().startsWith('zh') ?? false;
}

export function getChatSimulatorLocalizedManifest(
  manifest: ToolManifest,
  locale?: string
): ToolManifest {
  if (!isChineseLocale(locale)) {
    return manifest;
  }

  return {
    ...manifest,
    seo: {
      ...manifest.seo,
      title: 'Chat Simulator | Discord、WhatsApp 与 Telegram 聊天模拟器',
      h1: 'Discord、WhatsApp 与 Telegram 聊天模拟器',
      description:
        '创建逼真的 Discord、WhatsApp 和 Telegram 聊天截图，支持身份编辑、本地上传、聊天回放，以及网页或手机导出。',
    },
    usage: {
      ...manifest.usage,
      title: '如何使用 Chat Simulator',
      description:
        '快速制作 Discord、WhatsApp、Telegram 或完全自定义的聊天截图，支持身份编辑、本地上传、聊天回放，以及网页或手机导出。',
      content: `## 快速生成逼真的聊天截图

**Chat Simulator** 可以帮你快速制作 **Discord**、**WhatsApp** 和 **Telegram** 的聊天截图，不需要设计软件，也不需要把聊天素材上传到服务器。你可以直接从案例开始，或者自己从零搭建一段对话。

## 快速开始

1. 从顶部选择 **Discord**、**WhatsApp** 或 **Telegram**。
2. 点击 **显示设置**，编辑聊天标题、群头像、背景、人物和默认消息位置。
3. 选择当前发言人，然后输入消息开始构建对话。
4. 悬停任意消息即可编辑文字、头像、时间，或直接删除。
5. 使用 **播放聊天** 预览消息逐条出现的节奏。
6. 点击 **导出** 打开导出面板，选择 **PNG / JPG**，以及 **网页 / 手机** 导出布局。

> **提示：** 上传的图片、头像和文件默认都只在浏览器本地处理，不会保存到服务器。设置面板不会出现在导出图片里。

## 支持的平台

- **Discord**：深色频道风格布局，带频道头部、身份信息、平台化操作区和附件展示。
- **WhatsApp**：移动端聊天风格，支持聊天头部、日期分隔、已读状态和附件预览。
- **Telegram**：Telegram 风格头部、背景区域、消息状态和平台特定的附件展示。

## 消息编辑与附件能力

- 添加人物、复用当前聊天中的身份，并为每个人预设默认发言位置。
- 为每个人设置单独的 **人名颜色**，让聊天里的人物标签更容易区分。
- 直接在聊天预览中编辑或删除任意消息。
- 上传临时 **人物头像**、**群头像**、**背景图**、**聊天图片** 和 **文件**，所有资源默认仅在本地浏览器处理。
- 编辑单条消息的 **日期和时间**，让不同平台按照各自规则显示时间。
- 在支持的平台中修改群组或频道名称、简介、头像等信息。

## 导出选项

- 在导出面板中选择 **PNG / JPG**、**网页 / 手机**、画面比例和清晰度。
- 使用 **手机导出** 生成真正按手机视口重排的聊天截图，而不是简单缩放桌面版。
- 在桌面端导出时直接下载文件，在移动端则尽量调用系统分享能力。
- 导出逻辑针对上传素材和复杂主题做了优化，尽量避免颜色异常或画布污染问题。

## 以隐私为优先的工作方式

- 你上传的图片、文件和头像优先在浏览器里处理，不会作为真实聊天记录或账号资料保存。
- 这个工具更适合用于演示图、内容创作、产品说明和轻量娱乐，而不是处理真实私密通信。
- 如需了解站点层面的信息，可以查看 **关于我们**、**FAQ**、**隐私政策** 和 **服务条款** 页面。`,
    },
    platformRoadmap: {
      ...manifest.platformRoadmap,
      title: '平台功能路线图',
      description:
        '这些是 Chat Simulator 未来计划扩展的聊天样式，目前仍是规划项，尚未正式上线。',
      content: `## 计划支持的平台

- **iMessage**：苹果风格的 iPhone 对话布局，包含蓝灰气泡、移动端画面比例和截图友好的聊天排版。
- **Instagram**：Instagram 私信风格聊天，适合内容创作、媒体消息和现代社交界面演示。
- **Facebook**：Facebook 聊天或评论式对话布局，可用于社交证明、评论回复和类似 Messenger 的场景。
- **Twitter / X**：X/Twitter 私信风格，用于模拟私聊截图和社交内容概念图。
- **TikTok**：TikTok 私信和创作者聊天风格，适合短视频社交场景下的消息展示。

## 后续扩展方向

未来新增平台时，会重点还原对应产品的消息行为、视觉层级、附件呈现和导出质感，尽量让每种聊天样式都更接近真实原生体验。`,
    },
  };
}

export function getChatSimulatorUiText(locale?: string) {
  const isZh = isChineseLocale(locale);

  if (isZh) {
    return {
      defaultSpeakerName: '你',
      platformButton: '平台',
      custom: '自定义',
      playChat: '播放聊天',
      stop: '停止',
      export: '导出',
      newChat: '新建聊天',
      showSettings: '显示设置',
      hideSettings: '隐藏设置',
      people: '人物',
      selectPerson: '选择人物',
      addPerson: '+ 添加人物',
      activeIdentity: '当前身份',
      activeIdentityHint: '你接下来发送的消息将使用这个名字和头像。',
      activeIdentityEmpty: '先添加一个人物，才能开始自定义聊天内容。',
      uploadAvatar: '上传头像',
      removeAvatar: '删除头像',
      addFirstPerson: '先添加一个人物',
      speakerName: '发言人名称',
      speakerColor: '人名颜色',
      messageSide: '消息位置',
      rightSide: '右侧',
      leftSide: '左侧',
      remove: '删除',
      reset: '重置',
      environmentSettings: '环境设置',
      backgroundColor: '背景颜色',
      backgroundImage: '背景图片',
      uploadBackground: '上传背景图',
      livePreview: '实时预览',
      exportChatImage: '导出聊天图片',
      exportDialogDescription: '下载前先选择导出格式和导出布局。',
      fileFormat: '文件格式',
      exportMode: '导出模式',
      exportRatio: '导出比例',
      exportQuality: '导出清晰度',
      exportContent: '导出范围',
      exportOverflow: '超长内容',
      exportSummary: '导出摘要',
      cancel: '取消',
      openImage: '打开图片',
      prepareExport: '生成图片',
      saveToPhone: '保存到手机',
      choosePlatform: '选择平台',
      currentWebViewport: '当前网页视口',
      phoneViewport: '手机视口',
      discordPlaceholderPrefix: '向 #',
      discordPlaceholderSuffix: ' 发消息',
      messagePlaceholder: '输入消息',
      telegramPlaceholder: '发送消息',
      attachFile: '上传文件',
      uploadImage: '上传图片',
      localOnly: '本地',
      exportFailed: '导出失败。',
      mobileSaveReady: '图片已生成，点击“保存到手机”即可保存到手机。',
      addPersonFirstForChat: '请先添加一个人物，再开始自定义聊天。',
      addPersonFirstForFiles: '请先添加一个人物，再在自定义模式中上传文件。',
      settingsCopy: {
        custom: {
          channelTitle: '画布设置',
          channelDescription:
            '自定义模式只保留聊天画布本身。你可以通过人物、背景和消息编辑来定义所有细节。',
          channelNameLabel: '画布标题',
          channelDescriptionLabel: '画布副标题',
          channelDescriptionPlaceholder: '可选',
          channelAvatarLabel: '画布图标',
          channelAvatarButton: '上传图标',
          environmentDescription:
            '调整纯聊天画布的背景颜色，或添加自定义背景图。',
        },
        whatsapp: {
          channelTitle: '聊天设置',
          channelDescription: '编辑 WhatsApp 头部中的聊天名称、头像和副标题。',
          channelNameLabel: '聊天名称',
          channelDescriptionLabel: '聊天副标题',
          channelDescriptionPlaceholder: '最近在线',
          channelAvatarLabel: '聊天头像',
          channelAvatarButton: '上传头像',
          environmentDescription:
            '调整 WhatsApp 风格的壁纸底色，或添加自定义背景图。',
        },
        telegram: {
          channelTitle: '群组设置',
          channelDescription:
            '编辑 Telegram 头部中的聊天标题、群头像和副标题。',
          channelNameLabel: '群组名称',
          channelDescriptionLabel: '头部副标题',
          channelDescriptionPlaceholder: '3 位成员',
          channelAvatarLabel: '群组头像',
          channelAvatarButton: '上传头像',
          environmentDescription:
            '调整 Telegram 风格的背景颜色，或添加自定义背景图。',
        },
        discord: {
          channelTitle: '群组设置',
          channelDescription: '编辑 Discord 布局中的频道名称、头像和简介文本。',
          channelNameLabel: '群组名称',
          channelDescriptionLabel: '频道简介',
          channelDescriptionPlaceholder: '告诉大家这个空间是做什么的。',
          channelAvatarLabel: '群组头像',
          channelAvatarButton: '上传图标',
          environmentDescription:
            '调整 Discord 风格的聊天背景颜色，或叠加自定义背景图。',
        },
      },
      exportLayoutOptions: [
        {
          value: 'web',
          label: '网页',
          description: '保持当前网页端的聊天排版。',
          renderWidth: null,
          renderHeight: null,
          defaultAspectRatio: null,
        },
        {
          value: 'mobile',
          label: '手机',
          description: '导出前先按手机视口重新排版聊天内容。',
          renderWidth: 430,
          renderHeight: 932,
          defaultAspectRatio: 9 / 19.5,
        },
      ],
      exportQualityOptions: [
        {
          value: 'standard',
          label: '标准',
          description: '导出更快，文件更小',
          pixelRatio: 1.5,
        },
        {
          value: 'high',
          label: '高清',
          description: '清晰度与体积更均衡',
          pixelRatio: 2,
        },
        {
          value: 'ultra',
          label: '超清',
          description: '更锐利，文件更大',
          pixelRatio: 3,
        },
      ],
      exportAspectRatioOptions: [
        { value: 'auto', label: '自动', aspectRatio: null },
        { value: '9:16', label: '9:16 竖屏', aspectRatio: 9 / 16 },
        { value: '4:5', label: '4:5 帖子', aspectRatio: 4 / 5 },
        { value: '1:1', label: '1:1 方图', aspectRatio: 1 },
        { value: '16:9', label: '16:9 横图', aspectRatio: 16 / 9 },
      ],
      exportContentOptions: [
        {
          value: 'viewport',
          label: '当前一屏',
          description: '只导出当前可视区域。',
        },
        {
          value: 'full',
          label: '完整聊天',
          description: '展开全部消息，导出完整聊天内容。',
        },
      ],
      exportOverflowOptions: [
        {
          value: 'single',
          label: '合成长图',
          description: '超过一屏时继续导出为一张长图。',
        },
        {
          value: 'multiple',
          label: '拆成多张',
          description: '超过一屏时按当前视口高度自动拆分多张图片。',
        },
      ],
      discordHeaderFallback: '在群组设置中设置频道主题。',
      whatsappHeaderFallback: '点此查看联系人信息',
      telegramMembersSuffix: ' 位成员',
      messageBubble: {
        editingAvatar: '编辑头像',
        changeAvatar: '更换头像',
        remove: '删除',
        messageTime: '消息时间',
        save: '保存',
        cancel: '取消',
        editMessage: '编辑消息',
        deleteMessage: '删除消息',
      },
    };
  }

  return {
    defaultSpeakerName: 'You',
    platformButton: 'Platforms',
    custom: 'Custom',
    playChat: 'Play chat',
    stop: 'Stop',
    export: 'Export',
    newChat: 'New chat',
    showSettings: 'Show settings',
    hideSettings: 'Hide settings',
    people: 'People',
    selectPerson: 'Select a person',
    addPerson: '+ Add person',
    activeIdentity: 'Active identity',
    activeIdentityHint: 'Messages you send next will use this name and avatar.',
    activeIdentityEmpty: 'Add a person to start customizing the chat.',
    uploadAvatar: 'Upload avatar',
    removeAvatar: 'Remove avatar',
    addFirstPerson: 'Add first person',
    speakerName: 'Speaker name',
    speakerColor: 'Name color',
    messageSide: 'Message side',
    rightSide: 'Right side',
    leftSide: 'Left side',
    remove: 'Remove',
    reset: 'Reset',
    environmentSettings: 'Environment settings',
    backgroundColor: 'Background color',
    backgroundImage: 'Background image',
    uploadBackground: 'Upload background',
    livePreview: 'Live preview',
    exportChatImage: 'Export chat image',
    exportDialogDescription:
      'Choose the output format and layout before downloading the final image.',
    fileFormat: 'File format',
    exportMode: 'Export mode',
    exportRatio: 'Export ratio',
    exportQuality: 'Export quality',
    exportContent: 'Export content',
    exportOverflow: 'Long content',
    exportSummary: 'Export summary',
    cancel: 'Cancel',
    openImage: 'Open image',
    prepareExport: 'Prepare image',
    saveToPhone: 'Save to phone',
    choosePlatform: 'Choose platform',
    currentWebViewport: 'Current web viewport',
    phoneViewport: 'phone viewport',
    discordPlaceholderPrefix: 'Message #',
    discordPlaceholderSuffix: '',
    messagePlaceholder: 'Type a message',
    telegramPlaceholder: 'Message',
    attachFile: 'Upload file',
    uploadImage: 'Upload image',
    localOnly: 'Local',
    exportFailed: 'Export failed.',
    mobileSaveReady: 'Your image is ready. Tap “Save to phone” to save it to your device.',
    addPersonFirstForChat: 'Add a person first to start the custom chat.',
    addPersonFirstForFiles:
      'Add a person first to upload files in custom mode.',
    settingsCopy: {
      custom: {
        channelTitle: 'Canvas settings',
        channelDescription:
          'Custom mode keeps only the chat canvas. Use people, background, and message editing to define every detail yourself.',
        channelNameLabel: 'Canvas title',
        channelDescriptionLabel: 'Canvas subtitle',
        channelDescriptionPlaceholder: 'Optional',
        channelAvatarLabel: 'Canvas icon',
        channelAvatarButton: 'Upload icon',
        environmentDescription:
          'Adjust the plain chat canvas color or add a custom background image.',
      },
      whatsapp: {
        channelTitle: 'Chat settings',
        channelDescription:
          'Edit the chat name, photo, and subtitle shown in the WhatsApp header.',
        channelNameLabel: 'Chat name',
        channelDescriptionLabel: 'Chat subtitle',
        channelDescriptionPlaceholder: 'Seen recently',
        channelAvatarLabel: 'Chat photo',
        channelAvatarButton: 'Upload photo',
        environmentDescription:
          'Tune the wallpaper with a custom image or a softer WhatsApp-like background color.',
      },
      telegram: {
        channelTitle: 'Group settings',
        channelDescription:
          'Edit the Telegram chat title, group photo, and subtitle shown in the header.',
        channelNameLabel: 'Group name',
        channelDescriptionLabel: 'Header subtitle',
        channelDescriptionPlaceholder: '3 members',
        channelAvatarLabel: 'Group photo',
        channelAvatarButton: 'Upload photo',
        environmentDescription:
          'Adjust the Telegram wallpaper color or add a custom background image.',
      },
      discord: {
        channelTitle: 'Group settings',
        channelDescription:
          'Edit the channel name, avatar, and intro text shown in the Discord layout.',
        channelNameLabel: 'Group name',
        channelDescriptionLabel: 'Channel intro',
        channelDescriptionPlaceholder: 'Tell people what this space is about.',
        channelAvatarLabel: 'Group avatar',
        channelAvatarButton: 'Upload icon',
        environmentDescription:
          'Tune the chat background with a custom image overlay or a Discord-like color.',
      },
    },
    exportLayoutOptions: [
      {
        value: 'web',
        label: 'Web',
        description: 'Keep the desktop/web composition.',
        renderWidth: null,
        renderHeight: null,
        defaultAspectRatio: null,
      },
      {
        value: 'mobile',
        label: 'Mobile',
        description: 'Render the chat in a phone-sized viewport before export.',
        renderWidth: 430,
        renderHeight: 932,
        defaultAspectRatio: 9 / 19.5,
      },
    ],
    exportQualityOptions: [
      {
        value: 'standard',
        label: 'Standard',
        description: 'Faster export, smaller file',
        pixelRatio: 1.5,
      },
      {
        value: 'high',
        label: 'High',
        description: 'Balanced clarity and file size',
        pixelRatio: 2,
      },
      {
        value: 'ultra',
        label: 'Ultra',
        description: 'Sharper export, larger file',
        pixelRatio: 3,
      },
    ],
    exportAspectRatioOptions: [
      { value: 'auto', label: 'Auto', aspectRatio: null },
      { value: '9:16', label: '9:16 Story', aspectRatio: 9 / 16 },
      { value: '4:5', label: '4:5 Post', aspectRatio: 4 / 5 },
      { value: '1:1', label: '1:1 Square', aspectRatio: 1 },
      { value: '16:9', label: '16:9 Wide', aspectRatio: 16 / 9 },
    ],
    exportContentOptions: [
      {
        value: 'viewport',
        label: 'Current viewport',
        description: 'Export only the currently visible screen.',
      },
      {
        value: 'full',
        label: 'Full chat',
        description: 'Expand and export the entire conversation.',
      },
    ],
    exportOverflowOptions: [
      {
        value: 'single',
        label: 'Single long image',
        description: 'Merge overflow into one long image.',
      },
      {
        value: 'multiple',
        label: 'Split into pages',
        description: 'Split overflow into multiple screenshots by viewport height.',
      },
    ],
    discordHeaderFallback: 'Set a channel topic from the group settings panel.',
    whatsappHeaderFallback: 'tap here for contact info',
    telegramMembersSuffix: ' members',
    messageBubble: {
      editingAvatar: 'Editing avatar',
      changeAvatar: 'Change avatar',
      remove: 'Remove',
      messageTime: 'Message time',
      save: 'Save',
      cancel: 'Cancel',
      editMessage: 'Edit message',
      deleteMessage: 'Delete message',
    },
  } as const;
}
