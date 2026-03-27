// src/tools/chat-simulator/index.tsx
// Chat Simulator 工具入口 —— Discord 像素级还原版
'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  ChevronDown,
  Check,
  CheckCheck,
  Columns2,
  Download,
  Hash,
  ImagePlus,
  Loader2,
  Mic,
  MoreVertical,
  Palette,
  Paperclip,
  Phone,
  Play,
  Plus,
  Search,
  Smile,
  SlidersHorizontal,
  Square,
  UserRound,
  Video,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { AttachmentArea, ChatContainer, InputBar, MessageBubble, SenderInfo, TelegramInputBar } from './components';
import { DEMO_SCRIPT, DEMO_USERS } from './data/demoScript';
import { useChatSimulatorStore } from './store';
import { Attachment, ChatChannel, ChatMessage, ChatUser, MessageGroup, MessageSide, PlatformType } from './types/chat';
import { deliverExportedFile } from './utils/exportDelivery';
import { exportElementToPngBlob } from './utils/exportToPng';
import { parseScript } from './utils/scriptParser';

// 动态加载对应的皮肤样式
import './skins/discord.css';
import './skins/telegram.css';
import './skins/whatsapp.css';

interface ChatSimulatorProps {
  manifest: {
    name: string;
    version?: string;
    config: {
      skin_preset: string;
      [key: string]: any;
    };
    seo: {
      description: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  themeName?: string;
}

type ExportAspectRatioPreset = 'auto' | '9:16' | '4:5' | '1:1' | '16:9';
type ExportQualityPreset = 'standard' | 'high' | 'ultra';

const CURRENT_SPEAKER_ID = 'current-speaker';
const DEFAULT_SPEAKER_NAME = 'You';
const DEFAULT_MESSAGE_SIDE: MessageSide = 'right';
const DEFAULT_BACKGROUND_COLOR = '#313338';
const PLATFORM_LABELS: Record<PlatformType, string> = {
  discord: 'Discord',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  messenger: 'Messenger',
  instagram: 'Instagram',
  facebook: 'Facebook',
  twitter: 'Twitter',
  tiktok: 'TikTok',
  default: 'Default',
};
const PLATFORM_DEFAULT_BACKGROUNDS: Partial<Record<PlatformType, string>> = {
  discord: '#313338',
  telegram: '#bcd79d',
  whatsapp: '#e5ddd5',
};
const EXPORT_ASPECT_RATIO_OPTIONS: Array<{
  value: ExportAspectRatioPreset;
  label: string;
  aspectRatio: number | null;
}> = [
  { value: 'auto', label: 'Auto', aspectRatio: null },
  { value: '9:16', label: '9:16 Story', aspectRatio: 9 / 16 },
  { value: '4:5', label: '4:5 Post', aspectRatio: 4 / 5 },
  { value: '1:1', label: '1:1 Square', aspectRatio: 1 },
  { value: '16:9', label: '16:9 Wide', aspectRatio: 16 / 9 },
];
const EXPORT_QUALITY_OPTIONS: Array<{
  value: ExportQualityPreset;
  label: string;
  description: string;
  pixelRatio: number;
}> = [
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
];

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function waitForNextPaint() {
  await new Promise((resolve) => window.requestAnimationFrame(() => resolve(null)));
  await new Promise((resolve) => window.requestAnimationFrame(() => resolve(null)));
}

function getPlaybackDelay(messages: ChatMessage[], index: number) {
  const message = messages[index];
  const previousMessage = messages[index - 1];
  const isSameSpeaker =
    previousMessage &&
    previousMessage.sender.id === message.sender.id &&
    previousMessage.authorName === message.authorName;

  if (!previousMessage) {
    return 1000;
  }

  return isSameSpeaker ? 1000 : 2000 + Math.floor(Math.random() * 1001);
}

function getExportAspectRatioValue(preset: ExportAspectRatioPreset) {
  return EXPORT_ASPECT_RATIO_OPTIONS.find((option) => option.value === preset)?.aspectRatio ?? null;
}

function getExportQualityConfig(preset: ExportQualityPreset) {
  return (
    EXPORT_QUALITY_OPTIONS.find((option) => option.value === preset) ?? EXPORT_QUALITY_OPTIONS[1]
  );
}

function getPlatformBackgroundColor(platform: PlatformType) {
  return PLATFORM_DEFAULT_BACKGROUNDS[platform] ?? DEFAULT_BACKGROUND_COLOR;
}

function buildCurrentSpeaker(name: string, avatarUrl: string): ChatUser {
  return {
    id: CURRENT_SPEAKER_ID,
    name: name.trim() || DEFAULT_SPEAKER_NAME,
    avatar: avatarUrl,
    color: '#5865f2',
  };
}

function buildDefaultChannel(name: string, description: string): ChatChannel {
  return {
    id: 'channel-general',
    name: name.trim() || 'general',
    description: description.trim() || 'A place to coordinate and share updates.',
    type: 'text',
  };
}

function formatChannelSlug(name: string): string {
  const normalized = name.trim().toLowerCase().replace(/\s+/g, '-');
  return normalized || 'general';
}

function revokeObjectUrlIfNeeded(url: string | null) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

function getAttachmentType(file: File): Attachment['type'] {
  if (file.type.startsWith('image/')) {
    return 'image';
  }

  if (file.type.startsWith('video/')) {
    return 'video';
  }

  if (file.type.startsWith('audio/')) {
    return 'audio';
  }

  return 'file';
}

function toDateTimeLocalValue(isoString: string) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function fromDateTimeLocalValue(value: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function formatWhatsAppDateLabel(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return 'Today';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTelegramDateLabel(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return '';
  }

  const isCurrentYear = date.getFullYear() === now.getFullYear();

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    ...(isCurrentYear ? {} : { year: 'numeric' }),
  });
}

function getDateKey(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function isSameCalendarDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function shouldInsertDateSeparator(platform: PlatformType, timestamp: string) {
  if (platform !== 'telegram') {
    return true;
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return !isSameCalendarDay(date, new Date());
}

function interleaveDateSeparators(groups: MessageGroup[], platform: PlatformType): MessageGroup[] {
  const result: MessageGroup[] = [];
  let lastDateKey = '';

  groups.forEach((group, index) => {
    const currentDateKey = getDateKey(group.timestamp);

    if (group.messages[0]?.isSystemMessage) {
      result.push(group);
      if (currentDateKey) {
        lastDateKey = currentDateKey;
      }
      return;
    }

    if (currentDateKey && currentDateKey !== lastDateKey && shouldInsertDateSeparator(platform, group.timestamp)) {
      result.push({
        sender: { id: `system-date-${index}`, name: 'System', avatar: '' },
        timestamp: group.timestamp,
        messages: [
          {
            id: `msg-system-date-${index}-${currentDateKey}`,
            sender: { id: 'system', name: 'System', avatar: '' },
            authorName: 'System',
            avatarUrl: '',
            content: '',
            timestamp: group.timestamp,
            isSystemMessage: true,
          },
        ],
      });
      lastDateKey = currentDateKey;
    }

    result.push(group);
  });

  return result;
}

function getBubblePositionClass(messageCount: number, messageIndex: number, prefix: string) {
  if (messageCount <= 1) {
    return `${prefix}-single`;
  }

  if (messageIndex === 0) {
    return `${prefix}-first`;
  }

  if (messageIndex === messageCount - 1) {
    return `${prefix}-last`;
  }

  return `${prefix}-middle`;
}

function getMessageSide(message: ChatMessage): MessageSide {
  const side = message.metadata?.side;
  return side === 'left' || side === 'right'
    ? side
    : message.sender.id === CURRENT_SPEAKER_ID
      ? 'right'
      : 'left';
}

function groupMessagesForDisplay(messages: ChatMessage[]): MessageGroup[] {
  const groups: MessageGroup[] = [];

  for (const message of messages) {
    const lastGroup = groups[groups.length - 1];

    if (
      lastGroup &&
      lastGroup.sender.id === message.sender.id &&
      lastGroup.messages[lastGroup.messages.length - 1]?.authorName === message.authorName &&
      lastGroup.messages[lastGroup.messages.length - 1]?.avatarUrl === message.avatarUrl &&
      getMessageSide(lastGroup.messages[lastGroup.messages.length - 1]) === getMessageSide(message) &&
      !message.isSystemMessage
    ) {
      lastGroup.messages.push(message);
    } else {
      groups.push({
        sender: message.sender,
        messages: [message],
        timestamp: message.timestamp,
      });
    }
  }

  return groups;
}

export default function ChatSimulator({ manifest, themeName }: ChatSimulatorProps) {
  const {
    messages,
    messageGroups,
    setMessages,
    setUsers,
    upsertUser,
    channel,
    activeSkin,
    setChannel,
    setSkin,
    addMessage,
    updateMessage,
    updateAuthorAvatar,
    deleteMessage,
    startNewChat,
  } = useChatSimulatorStore();
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingTimestamp, setEditingTimestamp] = useState('');
  const [editingAuthorName, setEditingAuthorName] = useState('');
  const [editingAvatarUrl, setEditingAvatarUrl] = useState('');
  const [currentSpeakerName, setCurrentSpeakerName] = useState(DEFAULT_SPEAKER_NAME);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState('');
  const [currentMessageSide, setCurrentMessageSide] = useState<MessageSide>(DEFAULT_MESSAGE_SIDE);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BACKGROUND_COLOR);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isPlatformMenuOpen, setIsPlatformMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visibleMessageCount, setVisibleMessageCount] = useState(messages.length);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [exportAspectRatioPreset, setExportAspectRatioPreset] =
    useState<ExportAspectRatioPreset>('auto');
  const [exportQualityPreset, setExportQualityPreset] = useState<ExportQualityPreset>('high');
  const currentAvatarInputRef = useRef<HTMLInputElement>(null);
  const channelIconInputRef = useRef<HTMLInputElement>(null);
  const backgroundImageInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const currentAvatarObjectUrlRef = useRef<string | null>(null);
  const channelAvatarObjectUrlRef = useRef<string | null>(null);
  const backgroundImageObjectUrlRef = useRef<string | null>(null);
  const editingAvatarObjectUrlRef = useRef<string | null>(null);
  const attachmentObjectUrlsRef = useRef<string[]>([]);
  const playbackRunRef = useRef(0);
  const captureRef = useRef<HTMLDivElement>(null);
  const platformMenuRef = useRef<HTMLDivElement>(null);
  const supportedSkins = (manifest.config.supported_skins || ['discord']) as PlatformType[];

  const resolvedChannel = channel ?? buildDefaultChannel(manifest.name, manifest.seo.description);
  const channelSlug = formatChannelSlug(resolvedChannel.name);
  const exportAspectRatio = getExportAspectRatioValue(exportAspectRatioPreset);
  const exportQuality = getExportQualityConfig(exportQualityPreset);
  const displayedMessages = isPlaying ? messages.slice(0, visibleMessageCount) : messages;
  const isWhatsApp = activeSkin === 'whatsapp';
  const isTelegram = activeSkin === 'telegram';
  const rawDisplayedMessageGroups = isPlaying ? groupMessagesForDisplay(displayedMessages) : messageGroups;
  const displayedMessageGroups = isWhatsApp || isTelegram
    ? interleaveDateSeparators(rawDisplayedMessageGroups, activeSkin)
    : rawDisplayedMessageGroups;
  const participantCount = new Set(
    messages
      .filter((message) => !message.isSystemMessage)
      .map((message) => message.authorName || message.sender.name),
  ).size || 1;
  const firstParticipantAvatar =
    messages.find((message) => !message.isSystemMessage && message.avatarUrl)?.avatarUrl ||
    currentAvatarUrl ||
    DEMO_USERS.Alex.avatar;
  const headerAvatarUrl =
    resolvedChannel.icon || (isWhatsApp ? firstParticipantAvatar : '');
  const settingsCopy = isWhatsApp
    ? {
        channelTitle: 'Chat settings',
        channelDescription: 'Edit the chat name, photo, and subtitle shown in the WhatsApp header.',
        channelNameLabel: 'Chat name',
        channelDescriptionLabel: 'Chat subtitle',
        channelDescriptionPlaceholder: 'Seen recently',
        channelAvatarLabel: 'Chat photo',
        channelAvatarButton: 'Upload photo',
        environmentDescription: 'Tune the wallpaper with a custom image or a softer WhatsApp-like background color.',
        exportDescription: 'Choose the output ratio and clarity used by PNG export.',
      }
    : isTelegram
      ? {
          channelTitle: 'Group settings',
          channelDescription: 'Edit the Telegram chat title, group photo, and subtitle shown in the header.',
          channelNameLabel: 'Group name',
          channelDescriptionLabel: 'Header subtitle',
          channelDescriptionPlaceholder: '3 members',
          channelAvatarLabel: 'Group photo',
          channelAvatarButton: 'Upload photo',
          environmentDescription: 'Adjust the Telegram wallpaper color or add a custom background image.',
          exportDescription: 'Choose the output ratio and clarity used by PNG export.',
        }
    : {
        channelTitle: 'Group settings',
        channelDescription: 'Edit the channel name, avatar, and intro text shown in the Discord layout.',
        channelNameLabel: 'Group name',
        channelDescriptionLabel: 'Channel intro',
        channelDescriptionPlaceholder: 'Tell people what this space is about.',
        channelAvatarLabel: 'Group avatar',
        channelAvatarButton: 'Upload icon',
        environmentDescription: 'Tune the chat background with a custom image overlay or a Discord-like color.',
        exportDescription: 'Choose the output ratio and clarity used by image export.',
      };
  const chatBackgroundStyle = {
    backgroundColor,
    backgroundImage: backgroundImageUrl
      ? isWhatsApp
        ? `linear-gradient(rgba(244, 240, 229, 0.72), rgba(244, 240, 229, 0.84)), url(${backgroundImageUrl})`
        : isTelegram
          ? `linear-gradient(rgba(212, 232, 191, 0.58), rgba(182, 214, 152, 0.7)), url(${backgroundImageUrl})`
        : `linear-gradient(rgba(17, 18, 20, 0.56), rgba(17, 18, 20, 0.72)), url(${backgroundImageUrl})`
      : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } as const;
  const previewViewportStyle = {
    height: 'min(calc(100vh - 72px), 1440px)',
    minHeight: '980px',
    maxHeight: '1440px',
  } as const;

  useEffect(() => {
    const script = parseScript(DEMO_SCRIPT, DEMO_USERS);
    setUsers(script.users);
    setMessages(script.messages);
    setChannel(buildDefaultChannel(manifest.name, manifest.seo.description));
    setSkin((manifest.config.skin_preset || 'discord') as PlatformType);
    setBackgroundColor(getPlatformBackgroundColor((manifest.config.skin_preset || 'discord') as PlatformType));
  }, [
    manifest.config.skin_preset,
    manifest.name,
    manifest.seo.description,
    setChannel,
    setMessages,
    setSkin,
    setUsers,
  ]);

  useEffect(() => {
    upsertUser(buildCurrentSpeaker(currentSpeakerName, currentAvatarUrl));
  }, [currentAvatarUrl, currentSpeakerName, upsertUser]);

  useEffect(() => {
    return () => {
      revokeObjectUrlIfNeeded(currentAvatarObjectUrlRef.current);
      revokeObjectUrlIfNeeded(channelAvatarObjectUrlRef.current);
      revokeObjectUrlIfNeeded(backgroundImageObjectUrlRef.current);
      revokeObjectUrlIfNeeded(editingAvatarObjectUrlRef.current);
      attachmentObjectUrlsRef.current.forEach((url) => revokeObjectUrlIfNeeded(url));
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!platformMenuRef.current?.contains(event.target as Node)) {
        setIsPlatformMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPlatformMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      playbackRunRef.current += 1;
      setIsPlaying(false);
    }

    setVisibleMessageCount(messages.length);
  }, [messages]);

  const handleSend = (content: string) => {
    const currentUser = buildCurrentSpeaker(currentSpeakerName, currentAvatarUrl);

    addMessage({
      id: `msg-user-${Date.now()}`,
      sender: currentUser,
      authorName: currentUser.name,
      avatarUrl: currentUser.avatar,
      content,
      timestamp: new Date().toISOString(),
      metadata: {
        deliveryStatus: currentMessageSide === 'right' ? 'read' : 'sent',
        side: currentMessageSide,
      },
    });
  };

  const buildAttachmentsFromFiles = (files: File[]) =>
    files.map((file, index) => {
      const objectUrl = URL.createObjectURL(file);
      attachmentObjectUrlsRef.current.push(objectUrl);

      return {
        id: `attachment-${Date.now()}-${index}`,
        type: getAttachmentType(file),
        url: objectUrl,
        name: file.name,
        size: file.size,
      } satisfies Attachment;
    });

  const handleSendAttachments = (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    const currentUser = buildCurrentSpeaker(currentSpeakerName, currentAvatarUrl);
    const attachments = buildAttachmentsFromFiles(files);

    addMessage({
      id: `msg-attachment-${Date.now()}`,
      sender: currentUser,
      authorName: currentUser.name,
      avatarUrl: currentUser.avatar,
      content: '',
      attachments,
      timestamp: new Date().toISOString(),
      metadata: {
        deliveryStatus: currentMessageSide === 'right' ? 'read' : 'sent',
        side: currentMessageSide,
      },
    });
  };

  const handleAttachmentInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleSendAttachments(files);
    event.target.value = '';
  };

  const handleStartEdit = (message: ChatMessage) => {
    revokeObjectUrlIfNeeded(editingAvatarObjectUrlRef.current);
    editingAvatarObjectUrlRef.current = null;
    setEditingMessageId(message.id);
    setEditingValue(message.content);
    setEditingTimestamp(toDateTimeLocalValue(message.timestamp));
    setEditingAuthorName(message.authorName);
    setEditingAvatarUrl(message.avatarUrl);
  };

  const handleCancelEdit = () => {
    revokeObjectUrlIfNeeded(editingAvatarObjectUrlRef.current);
    editingAvatarObjectUrlRef.current = null;
    setEditingMessageId(null);
    setEditingValue('');
    setEditingTimestamp('');
    setEditingAuthorName('');
    setEditingAvatarUrl('');
  };

  const handleSaveEdit = () => {
    if (!editingMessageId || !editingValue.trim()) {
      return;
    }

    updateMessage(editingMessageId, editingValue, {
      timestamp: fromDateTimeLocalValue(editingTimestamp) || undefined,
    });
    updateAuthorAvatar(editingAuthorName, editingAvatarUrl);
    editingAvatarObjectUrlRef.current = null;

    if (editingAuthorName === currentSpeakerName) {
      setCurrentAvatarUrl(editingAvatarUrl);
    }

    handleCancelEdit();
  };

  const handleDeleteMessage = (messageId: string) => {
    if (editingMessageId === messageId) {
      handleCancelEdit();
    }

    deleteMessage(messageId);
  };

  const handleCreateNewChat = () => {
    attachmentObjectUrlsRef.current.forEach((url) => revokeObjectUrlIfNeeded(url));
    attachmentObjectUrlsRef.current = [];
    startNewChat(channelSlug);
    upsertUser(buildCurrentSpeaker(currentSpeakerName, currentAvatarUrl));
    handleCancelEdit();
  };

  const handleCurrentAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    revokeObjectUrlIfNeeded(currentAvatarObjectUrlRef.current);
    const nextObjectUrl = URL.createObjectURL(file);
    currentAvatarObjectUrlRef.current = nextObjectUrl;
    setCurrentAvatarUrl(nextObjectUrl);
    updateAuthorAvatar(currentSpeakerName, nextObjectUrl);
    event.target.value = '';
  };

  const handleClearCurrentAvatar = () => {
    revokeObjectUrlIfNeeded(currentAvatarObjectUrlRef.current);
    currentAvatarObjectUrlRef.current = null;
    setCurrentAvatarUrl('');
    updateAuthorAvatar(currentSpeakerName, '');

    if (currentAvatarInputRef.current) {
      currentAvatarInputRef.current.value = '';
    }
  };

  const handleEditingAvatarChange = (file: File | null) => {
    if (!file) {
      return;
    }

    revokeObjectUrlIfNeeded(editingAvatarObjectUrlRef.current);
    const nextObjectUrl = URL.createObjectURL(file);
    editingAvatarObjectUrlRef.current = nextObjectUrl;
    setEditingAvatarUrl(nextObjectUrl);
  };

  const handleEditingAvatarClear = () => {
    if (editingAvatarObjectUrlRef.current === editingAvatarUrl) {
      revokeObjectUrlIfNeeded(editingAvatarObjectUrlRef.current);
      editingAvatarObjectUrlRef.current = null;
    }

    setEditingAvatarUrl('');
  };

  const handleChannelFieldChange = (field: keyof ChatChannel, value: string) => {
    setChannel({
      ...resolvedChannel,
      [field]: value,
    });
  };

  const handlePlatformChange = (nextSkin: PlatformType) => {
    setSkin(nextSkin);
    setIsPlatformMenuOpen(false);
    attachmentObjectUrlsRef.current.forEach((url) => revokeObjectUrlIfNeeded(url));
    attachmentObjectUrlsRef.current = [];
    setBackgroundImageUrl('');
    revokeObjectUrlIfNeeded(backgroundImageObjectUrlRef.current);
    backgroundImageObjectUrlRef.current = null;
    if (backgroundImageInputRef.current) {
      backgroundImageInputRef.current.value = '';
    }
    setBackgroundColor(getPlatformBackgroundColor(nextSkin));
  };

  const handleChannelAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    revokeObjectUrlIfNeeded(channelAvatarObjectUrlRef.current);
    const nextObjectUrl = URL.createObjectURL(file);
    channelAvatarObjectUrlRef.current = nextObjectUrl;
    setChannel({
      ...resolvedChannel,
      icon: nextObjectUrl,
    });
    event.target.value = '';
  };

  const handleClearChannelAvatar = () => {
    revokeObjectUrlIfNeeded(channelAvatarObjectUrlRef.current);
    channelAvatarObjectUrlRef.current = null;
    setChannel({
      ...resolvedChannel,
      icon: '',
    });

    if (channelIconInputRef.current) {
      channelIconInputRef.current.value = '';
    }
  };

  const handleBackgroundImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    revokeObjectUrlIfNeeded(backgroundImageObjectUrlRef.current);
    const nextObjectUrl = URL.createObjectURL(file);
    backgroundImageObjectUrlRef.current = nextObjectUrl;
    setBackgroundImageUrl(nextObjectUrl);
    event.target.value = '';
  };

  const handleClearBackgroundImage = () => {
    revokeObjectUrlIfNeeded(backgroundImageObjectUrlRef.current);
    backgroundImageObjectUrlRef.current = null;
    setBackgroundImageUrl('');

    if (backgroundImageInputRef.current) {
      backgroundImageInputRef.current.value = '';
    }
  };

  const handleTogglePlayback = async () => {
    if (isPlaying) {
      playbackRunRef.current += 1;
      setIsPlaying(false);
      setVisibleMessageCount(messages.length);
      return;
    }

    if (messages.length === 0) {
      return;
    }

    handleCancelEdit();
    const runId = playbackRunRef.current + 1;
    playbackRunRef.current = runId;
    setIsPlaying(true);
    setVisibleMessageCount(0);

    for (let index = 0; index < messages.length; index += 1) {
      const delay = getPlaybackDelay(messages, index);

      await sleep(delay);

      if (playbackRunRef.current !== runId) {
        return;
      }

      setVisibleMessageCount(index + 1);
    }

    if (playbackRunRef.current === runId) {
      setIsPlaying(false);
    }
  };

  const handleExportImage = async () => {
    if (!captureRef.current) {
      return;
    }

    playbackRunRef.current += 1;
    setIsPlaying(false);
    setVisibleMessageCount(messages.length);
    handleCancelEdit();
    setIsExportingImage(true);

    try {
      await sleep(80);
      await waitForNextPaint();
      const blob = await exportElementToPngBlob(captureRef.current, {
        pixelRatio: exportQuality.pixelRatio,
        aspectRatio: exportAspectRatio,
        matteColor: backgroundColor,
      });
      const file = new File([blob], `${channelSlug}-chat.png`, { type: 'image/png' });
      await deliverExportedFile(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'PNG export failed.';

      if (message !== 'Share canceled.') {
        toast.error(message);
      }
    } finally {
      setIsExportingImage(false);
    }
  };

  const renderGroup = (group: MessageGroup, index: number) => {
    if (activeSkin === 'telegram') {
      const firstMessage = group.messages[0];
      const displayName = firstMessage.authorName || group.sender.name;
      const avatarUrl = firstMessage.avatarUrl || group.sender.avatar;
      const isOutgoing = getMessageSide(firstMessage) === 'right';

      return (
        <div
          className={`tg-message-group ${isOutgoing ? 'tg-message-group-outgoing' : 'tg-message-group-incoming'}`}
          key={index}
        >
          {!isOutgoing && (
            <div className="tg-group-avatar">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-10 w-10 rounded-full object-cover"
                  title={displayName}
                />
              ) : (
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: group.sender.color || '#2ca5e0' }}
                  title={displayName}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}

          <div className="tg-group-stack">
            {group.messages.map((message, messageIndex) => {
              const messageTime = new Date(message.timestamp).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: false,
              });
              const bubblePositionClass = getBubblePositionClass(group.messages.length, messageIndex, 'tg-bubble-position');

              return (
                <div
                  key={message.id}
                  className={`tg-bubble-shell ${isOutgoing ? 'tg-bubble-shell-outgoing' : 'tg-bubble-shell-incoming'} ${bubblePositionClass}`}
                >
                  <MessageBubble
                    message={message}
                    className={`tg-message-bubble ${isOutgoing ? 'tg-message-bubble-outgoing' : 'tg-message-bubble-incoming'}`}
                    isEditing={editingMessageId === message.id}
                    editingValue={editingMessageId === message.id ? editingValue : message.content}
                    editingTimestamp={
                      editingMessageId === message.id
                        ? editingTimestamp
                        : toDateTimeLocalValue(message.timestamp)
                    }
                    editingAvatarUrl={editingMessageId === message.id ? editingAvatarUrl : message.avatarUrl}
                    editingAuthorName={editingMessageId === message.id ? editingAuthorName : message.authorName}
                    onEditingValueChange={setEditingValue}
                    onEditingTimestampChange={setEditingTimestamp}
                    onEditingAvatarChange={handleEditingAvatarChange}
                    onEditingAvatarClear={handleEditingAvatarClear}
                    onEdit={message.isSystemMessage ? undefined : () => handleStartEdit(message)}
                    onDelete={message.isSystemMessage ? undefined : () => handleDeleteMessage(message.id)}
                    onEditSave={handleSaveEdit}
                    onEditCancel={handleCancelEdit}
                    renderContent={(content) => {
                      if (!content.trim()) {
                        return null;
                      }

                      return (
                        <div className="tg-message-content-wrap">
                          {!isOutgoing && messageIndex === 0 ? (
                            <div className="tg-author-row">
                              <p
                                className="tg-inline-author"
                                style={{ color: group.sender.color || '#54a33a' }}
                              >
                                {displayName}
                              </p>
                            </div>
                          ) : null}
                          <p className="tg-message-text whitespace-pre-wrap break-words">{content}</p>
                          <span className={`tg-message-meta ${isOutgoing ? 'tg-message-meta-outgoing' : 'tg-message-meta-incoming'}`}>
                            <span className={`tg-message-time ${isOutgoing ? 'tg-message-time-outgoing' : 'tg-message-time-incoming'}`}>
                              {messageTime}
                            </span>
                            {isOutgoing ? (
                              <span
                                className={`tg-message-status ${
                                  (message.metadata?.deliveryStatus as string | undefined) === 'read'
                                    ? 'tg-message-status-read'
                                    : ''
                                }`}
                              >
                                {(message.metadata?.deliveryStatus as string | undefined) === 'read' ? (
                                  <CheckCheck className="tg-message-status-icon" />
                                ) : (
                                  <Check className="tg-message-status-icon" />
                                )}
                              </span>
                            ) : null}
                          </span>
                        </div>
                      );
                    }}
                    renderAttachments={(attachments) => (
                      <AttachmentArea
                        attachments={attachments}
                        className="tg-attachment-area"
                        renderImage={(attachment: Attachment) => (
                          <div className="tg-attachment-block">
                            {!isOutgoing && messageIndex === 0 && !message.content.trim() ? (
                              <div className="tg-author-row tg-author-row-attachment">
                                <p
                                  className="tg-inline-author"
                                  style={{ color: group.sender.color || '#54a33a' }}
                                >
                                  {displayName}
                                </p>
                              </div>
                            ) : null}
                            <div className="tg-attachment-card tg-attachment-card-image">
                              <img
                                src={attachment.url}
                                alt={attachment.name}
                                className="tg-attachment-image"
                                loading="lazy"
                              />
                              <span className={`tg-attachment-meta ${isOutgoing ? 'tg-message-meta-outgoing' : 'tg-message-meta-incoming'}`}>
                                <span className={`tg-message-time ${isOutgoing ? 'tg-message-time-outgoing' : 'tg-message-time-incoming'}`}>
                                  {messageTime}
                                </span>
                                {isOutgoing ? (
                                  <span
                                    className={`tg-message-status ${
                                      (message.metadata?.deliveryStatus as string | undefined) === 'read'
                                        ? 'tg-message-status-read'
                                        : ''
                                    }`}
                                  >
                                    {(message.metadata?.deliveryStatus as string | undefined) === 'read' ? (
                                      <CheckCheck className="tg-message-status-icon" />
                                    ) : (
                                      <Check className="tg-message-status-icon" />
                                    )}
                                  </span>
                                ) : null}
                              </span>
                            </div>
                          </div>
                        )}
                        renderVideo={(attachment: Attachment) => (
                          <div className="tg-attachment-block">
                            {!isOutgoing && messageIndex === 0 && !message.content.trim() ? (
                              <div className="tg-author-row tg-author-row-attachment">
                                <p
                                  className="tg-inline-author"
                                  style={{ color: group.sender.color || '#54a33a' }}
                                >
                                  {displayName}
                                </p>
                              </div>
                            ) : null}
                            <div className="tg-attachment-card tg-attachment-card-image">
                              <video src={attachment.url} controls className="tg-attachment-image" />
                              <span className={`tg-attachment-meta ${isOutgoing ? 'tg-message-meta-outgoing' : 'tg-message-meta-incoming'}`}>
                                <span className={`tg-message-time ${isOutgoing ? 'tg-message-time-outgoing' : 'tg-message-time-incoming'}`}>
                                  {messageTime}
                                </span>
                                {isOutgoing ? (
                                  <span
                                    className={`tg-message-status ${
                                      (message.metadata?.deliveryStatus as string | undefined) === 'read'
                                        ? 'tg-message-status-read'
                                        : ''
                                    }`}
                                  >
                                    {(message.metadata?.deliveryStatus as string | undefined) === 'read' ? (
                                      <CheckCheck className="tg-message-status-icon" />
                                    ) : (
                                      <Check className="tg-message-status-icon" />
                                    )}
                                  </span>
                                ) : null}
                              </span>
                            </div>
                          </div>
                        )}
                        renderFile={(attachment: Attachment) => (
                          <div className="tg-attachment-block">
                            {!isOutgoing && messageIndex === 0 && !message.content.trim() ? (
                              <div className="tg-author-row tg-author-row-attachment">
                                <p
                                  className="tg-inline-author"
                                  style={{ color: group.sender.color || '#54a33a' }}
                                >
                                  {displayName}
                                </p>
                              </div>
                            ) : null}
                            <a
                              href={attachment.url}
                              download={attachment.name}
                              className="tg-attachment-card tg-attachment-file"
                            >
                              <span className="tg-attachment-file-name">{attachment.name}</span>
                              <span className="tg-attachment-file-meta">
                                {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'File'}
                              </span>
                              <span className={`tg-attachment-meta ${isOutgoing ? 'tg-message-meta-outgoing' : 'tg-message-meta-incoming'}`}>
                                <span className={`tg-message-time ${isOutgoing ? 'tg-message-time-outgoing' : 'tg-message-time-incoming'}`}>
                                  {messageTime}
                                </span>
                                {isOutgoing ? (
                                  <span
                                    className={`tg-message-status ${
                                      (message.metadata?.deliveryStatus as string | undefined) === 'read'
                                        ? 'tg-message-status-read'
                                        : ''
                                    }`}
                                  >
                                    {(message.metadata?.deliveryStatus as string | undefined) === 'read' ? (
                                      <CheckCheck className="tg-message-status-icon" />
                                    ) : (
                                      <Check className="tg-message-status-icon" />
                                    )}
                                  </span>
                                ) : null}
                              </span>
                            </a>
                          </div>
                        )}
                        renderAudio={(attachment: Attachment) => (
                          <div className="tg-attachment-block">
                            {!isOutgoing && messageIndex === 0 && !message.content.trim() ? (
                              <div className="tg-author-row tg-author-row-attachment">
                                <p
                                  className="tg-inline-author"
                                  style={{ color: group.sender.color || '#54a33a' }}
                                >
                                  {displayName}
                                </p>
                              </div>
                            ) : null}
                            <div className="tg-attachment-card tg-attachment-file">
                              <audio src={attachment.url} controls className="w-full" />
                              <span className={`tg-attachment-meta ${isOutgoing ? 'tg-message-meta-outgoing' : 'tg-message-meta-incoming'}`}>
                                <span className={`tg-message-time ${isOutgoing ? 'tg-message-time-outgoing' : 'tg-message-time-incoming'}`}>
                                  {messageTime}
                                </span>
                                {isOutgoing ? (
                                  <span
                                    className={`tg-message-status ${
                                      (message.metadata?.deliveryStatus as string | undefined) === 'read'
                                        ? 'tg-message-status-read'
                                        : ''
                                    }`}
                                  >
                                    {(message.metadata?.deliveryStatus as string | undefined) === 'read' ? (
                                      <CheckCheck className="tg-message-status-icon" />
                                    ) : (
                                      <Check className="tg-message-status-icon" />
                                    )}
                                  </span>
                                ) : null}
                              </span>
                            </div>
                          </div>
                        )}
                      />
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (activeSkin === 'whatsapp') {
      const firstMessage = group.messages[0];
      const displayName = firstMessage.authorName || group.sender.name;
      const avatarUrl = firstMessage.avatarUrl || group.sender.avatar;
      const isOutgoing = getMessageSide(firstMessage) === 'right';

      return (
        <div
          className={`wa-message-group ${isOutgoing ? 'wa-message-group-outgoing' : 'wa-message-group-incoming'}`}
          key={index}
        >
          {!isOutgoing && (
            <div className="wa-group-avatar">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-8 w-8 rounded-full object-cover"
                  title={displayName}
                />
              ) : (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: group.sender.color || '#25d366' }}
                  title={displayName}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}

          <div className="wa-group-stack">
            {group.messages.map((message, messageIndex) => {
              const messageTime = new Date(message.timestamp).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: false,
              });

              return (
                <div
                  key={message.id}
                  className={`wa-bubble-shell ${isOutgoing ? 'wa-bubble-shell-outgoing' : 'wa-bubble-shell-incoming'}`}
                >
                  <MessageBubble
                    message={message}
                    className={`wa-message-bubble ${isOutgoing ? 'wa-message-bubble-outgoing' : 'wa-message-bubble-incoming'}`}
                    isEditing={editingMessageId === message.id}
                    editingValue={editingMessageId === message.id ? editingValue : message.content}
                    editingTimestamp={
                      editingMessageId === message.id
                        ? editingTimestamp
                        : toDateTimeLocalValue(message.timestamp)
                    }
                    editingAvatarUrl={editingMessageId === message.id ? editingAvatarUrl : message.avatarUrl}
                    editingAuthorName={editingMessageId === message.id ? editingAuthorName : message.authorName}
                    onEditingValueChange={setEditingValue}
                    onEditingTimestampChange={setEditingTimestamp}
                    onEditingAvatarChange={handleEditingAvatarChange}
                    onEditingAvatarClear={handleEditingAvatarClear}
                    onEdit={message.isSystemMessage ? undefined : () => handleStartEdit(message)}
                    onDelete={message.isSystemMessage ? undefined : () => handleDeleteMessage(message.id)}
                    onEditSave={handleSaveEdit}
                    onEditCancel={handleCancelEdit}
                    renderContent={(content) => {
                      if (!content.trim()) {
                        return null;
                      }

                      return (
                        <div className="wa-message-content-wrap">
                          {!isOutgoing && messageIndex === 0 ? (
                            <p
                              className="wa-inline-author"
                              style={{ color: group.sender.color || '#128c7e' }}
                            >
                              {displayName}
                            </p>
                          ) : null}
                          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
                          <span className="wa-message-meta">
                            <span className="wa-message-time">{messageTime}</span>
                            {isOutgoing && (
                              <span
                                className={`wa-message-status ${
                                  (message.metadata?.deliveryStatus as string | undefined) === 'read'
                                    ? 'wa-message-status-read'
                                    : ''
                                }`}
                              >
                                ✓✓
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    }}
                    renderAttachments={(attachments) => (
                      <AttachmentArea
                        attachments={attachments}
                        className="wa-attachment-area"
                        renderImage={(attachment: Attachment) => (
                          <div className="wa-attachment-block">
                            {!isOutgoing && messageIndex === 0 && !message.content.trim() ? (
                              <p
                                className="wa-inline-author wa-inline-author-attachment"
                                style={{ color: group.sender.color || '#128c7e' }}
                              >
                                {displayName}
                              </p>
                            ) : null}
                            <div className="wa-attachment-card wa-attachment-card-image">
                              <img
                                src={attachment.url}
                                alt={attachment.name}
                                className="wa-attachment-image"
                                loading="lazy"
                              />
                              <span className="wa-attachment-meta">
                                <span className="wa-message-time">{messageTime}</span>
                                {isOutgoing ? (
                                  <span
                                    className={`wa-message-status ${
                                      (message.metadata?.deliveryStatus as string | undefined) === 'read'
                                        ? 'wa-message-status-read'
                                        : ''
                                    }`}
                                  >
                                    ✓✓
                                  </span>
                                ) : null}
                              </span>
                            </div>
                          </div>
                        )}
                        renderVideo={(attachment: Attachment) => (
                          <div className="wa-attachment-block">
                            {!isOutgoing && messageIndex === 0 && !message.content.trim() ? (
                              <p
                                className="wa-inline-author wa-inline-author-attachment"
                                style={{ color: group.sender.color || '#128c7e' }}
                              >
                                {displayName}
                              </p>
                            ) : null}
                            <div className="wa-attachment-card wa-attachment-card-image">
                              <video src={attachment.url} controls className="wa-attachment-image" />
                              <span className="wa-attachment-meta">
                                <span className="wa-message-time">{messageTime}</span>
                                {isOutgoing ? (
                                  <span
                                    className={`wa-message-status ${
                                      (message.metadata?.deliveryStatus as string | undefined) === 'read'
                                        ? 'wa-message-status-read'
                                        : ''
                                    }`}
                                  >
                                    ✓✓
                                  </span>
                                ) : null}
                              </span>
                            </div>
                          </div>
                        )}
                        renderFile={(attachment: Attachment) => (
                          <div className="wa-attachment-block">
                            {!isOutgoing && messageIndex === 0 && !message.content.trim() ? (
                              <p
                                className="wa-inline-author wa-inline-author-attachment"
                                style={{ color: group.sender.color || '#128c7e' }}
                              >
                                {displayName}
                              </p>
                            ) : null}
                            <a
                              href={attachment.url}
                              download={attachment.name}
                              className="wa-attachment-card wa-attachment-file"
                            >
                              <span className="wa-attachment-file-name">{attachment.name}</span>
                              <span className="wa-attachment-file-meta">
                                {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'File'}
                              </span>
                              <span className="wa-attachment-meta">
                                <span className="wa-message-time">{messageTime}</span>
                                {isOutgoing ? (
                                  <span
                                    className={`wa-message-status ${
                                      (message.metadata?.deliveryStatus as string | undefined) === 'read'
                                        ? 'wa-message-status-read'
                                        : ''
                                    }`}
                                  >
                                    ✓✓
                                  </span>
                                ) : null}
                              </span>
                            </a>
                          </div>
                        )}
                        renderAudio={(attachment: Attachment) => (
                          <div className="wa-attachment-block">
                            {!isOutgoing && messageIndex === 0 && !message.content.trim() ? (
                              <p
                                className="wa-inline-author wa-inline-author-attachment"
                                style={{ color: group.sender.color || '#128c7e' }}
                              >
                                {displayName}
                              </p>
                            ) : null}
                            <div className="wa-attachment-card wa-attachment-file">
                              <audio src={attachment.url} controls className="w-full" />
                              <span className="wa-attachment-meta">
                                <span className="wa-message-time">{messageTime}</span>
                                {isOutgoing ? (
                                  <span
                                    className={`wa-message-status ${
                                      (message.metadata?.deliveryStatus as string | undefined) === 'read'
                                        ? 'wa-message-status-read'
                                        : ''
                                    }`}
                                  >
                                    ✓✓
                                  </span>
                                ) : null}
                              </span>
                            </div>
                          </div>
                        )}
                      />
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    const firstMessage = group.messages[0];
    const displayName = firstMessage.authorName || group.sender.name;
    const avatarUrl = firstMessage.avatarUrl || group.sender.avatar;
    const isOutgoing = getMessageSide(firstMessage) === 'right';
    const time = new Date(group.timestamp);
    const timeStr =
      time.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }) +
      ' ' +
      time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

    return (
      <div className={`ds-message-group flex gap-3 px-4 py-0.5 transition-colors ${isOutgoing ? 'ds-message-group-outgoing' : 'ds-message-group-incoming'}`} key={index}>
        {!isOutgoing ? (
          <div className="flex-shrink-0 w-10 pt-0.5">
            <SenderInfo
              user={group.sender}
              renderAvatar={(user) =>
                avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-10 w-10 rounded-full object-cover"
                    title={displayName}
                  />
                ) : (
                  <div
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: user.color || '#5865f2' }}
                    title={displayName}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )
              }
            />
          </div>
        ) : null}

        <div className={`flex-1 min-w-0 ${isOutgoing ? 'ds-message-group-body-outgoing' : ''}`}>
          <div
            className={`mb-0.5 flex items-baseline gap-2 ${isOutgoing ? 'ds-message-meta-row-outgoing' : ''}`}
            data-export-discord-meta-row="true"
          >
            <span
              className="cursor-pointer text-sm font-semibold hover:underline"
              data-export-discord-name="true"
              style={{ color: group.sender.color || '#ffffff' }}
            >
              {displayName}
            </span>
            {!isOutgoing && group.sender.role && (
              <span className="rounded bg-[#5865f2] px-1 py-px text-[0.625rem] font-medium leading-tight text-white" data-export-discord-role="true">
                {group.sender.role}
              </span>
            )}
            <span className="ds-sender-timestamp" data-export-discord-timestamp="true">
              {timeStr}
            </span>
          </div>

          {group.messages.map((message, messageIndex) => (
            <MessageBubble
              key={message.id}
              message={message}
              className={isOutgoing ? 'ds-message-bubble-outgoing' : ''}
              isStacked={messageIndex > 0}
              isEditing={editingMessageId === message.id}
              editingValue={editingMessageId === message.id ? editingValue : message.content}
              editingTimestamp={
                editingMessageId === message.id
                  ? editingTimestamp
                  : toDateTimeLocalValue(message.timestamp)
              }
              editingAvatarUrl={editingMessageId === message.id ? editingAvatarUrl : message.avatarUrl}
              editingAuthorName={editingMessageId === message.id ? editingAuthorName : message.authorName}
              onEditingValueChange={setEditingValue}
              onEditingTimestampChange={setEditingTimestamp}
              onEditingAvatarChange={handleEditingAvatarChange}
              onEditingAvatarClear={handleEditingAvatarClear}
              onEdit={message.isSystemMessage ? undefined : () => handleStartEdit(message)}
              onDelete={message.isSystemMessage ? undefined : () => handleDeleteMessage(message.id)}
              onEditSave={handleSaveEdit}
              onEditCancel={handleCancelEdit}
              renderAttachments={(attachments) => <AttachmentArea attachments={attachments} />}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderSystemMessage = (group: MessageGroup) => (
    (() => {
      const label =
        activeSkin === 'whatsapp'
          ? formatWhatsAppDateLabel(group.messages[0].timestamp)
          : activeSkin === 'telegram'
            ? formatTelegramDateLabel(group.messages[0].timestamp)
            : group.messages[0].content;

      if (!label) {
        return null;
      }

      return (
        <div
          className={`ds-system-message py-2 text-center text-xs ${
            activeSkin === 'whatsapp'
              ? 'wa-system-message'
              : activeSkin === 'telegram'
                ? 'tg-system-message'
                : ''
          }`}
        >
          <span>{label}</span>
        </div>
      );
    })()
  );

  const channelIntro = activeSkin === 'discord' ? (
    <div
      className="ds-channel-intro mx-3 mt-4 rounded-[18px] border border-white/8 bg-black/10 p-4 backdrop-blur-[2px] sm:mx-4 sm:mt-5 sm:rounded-2xl sm:p-5"
      data-export-discord-intro="true"
    >
      <div className="ds-channel-intro-layout flex items-start gap-3 sm:gap-4">
        <div className="ds-channel-intro-avatar flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#232428] text-white sm:h-14 sm:w-14">
          {resolvedChannel.icon ? (
            <img
              src={resolvedChannel.icon}
              alt={resolvedChannel.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Hash className="h-6 w-6 text-[#dbdee1]" />
          )}
        </div>
        <div className="ds-channel-intro-copy min-w-0">
          <p className="ds-channel-intro-kicker text-[11px] font-semibold uppercase tracking-[0.14em] text-[#949ba4] sm:text-xs sm:tracking-[0.16em]">
            Channel Overview
          </p>
          <h2 className="ds-channel-intro-title mt-1 text-[1.28rem] font-extrabold leading-[1.08] text-white sm:text-[1.625rem] sm:leading-tight">
            Welcome to #{channelSlug}
          </h2>
          <p className="ds-channel-intro-description mt-2 text-[0.93rem] leading-[1.7] text-[#c4c9ce] sm:max-w-2xl sm:text-sm sm:leading-6">
            {resolvedChannel.description || 'Customize this space to match your Discord screenshot style.'}
          </p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div
      className={`tool-root-chat-simulator skin-theme-${activeSkin} flex h-full min-h-[480px] flex-col md:min-h-[600px]`}
    >
      <div className="ds-control-toolbar mb-4 flex flex-wrap items-center gap-2" data-export-hide="true">
        <div ref={platformMenuRef} className="ds-platform-menu relative">
          <button
            type="button"
            onClick={() => setIsPlatformMenuOpen((current) => !current)}
            aria-haspopup="listbox"
            aria-expanded={isPlatformMenuOpen}
            className="ds-platform-trigger ds-control-button inline-flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white transition"
          >
            <span className="truncate">{PLATFORM_LABELS[activeSkin] || activeSkin}</span>
            <ChevronDown className={`ds-platform-trigger-icon h-4 w-4 transition ${isPlatformMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isPlatformMenuOpen ? (
            <div
              className="ds-platform-menu-content absolute left-0 top-full z-50 mt-2 min-w-[148px] overflow-hidden rounded-xl border backdrop-blur-sm"
              role="listbox"
              aria-label="Choose platform"
            >
              {supportedSkins.map((skin) => {
                const isActive = activeSkin === skin;

                return (
                  <button
                    key={skin}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handlePlatformChange(skin)}
                    className={`ds-platform-menu-item ${isActive ? 'is-active' : ''}`}
                  >
                    <span>{PLATFORM_LABELS[skin] || skin}</span>
                    {isActive ? <Check className="ds-platform-menu-check h-4 w-4" /> : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => void handleTogglePlayback()}
          disabled={isExportingImage}
          className="ds-control-button inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isPlaying ? 'Stop' : 'Play chat'}
        </button>

        <button
          type="button"
          onClick={() => void handleExportImage()}
          disabled={isExportingImage}
          className="ds-control-button inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExportingImage ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export PNG
        </button>

        <button
          type="button"
          onClick={handleCreateNewChat}
          disabled={isExportingImage}
          className="ds-control-button inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>

        <button
          type="button"
          onClick={() => setIsSettingsVisible((current) => !current)}
          disabled={isExportingImage}
          className="ds-control-button inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {isSettingsVisible ? 'Hide settings' : 'Show settings'}
        </button>
      </div>

      <div
        ref={captureRef}
        className="discord-chat-container flex min-h-0 flex-1 flex-col overflow-hidden"
        style={previewViewportStyle}
      >
        <div className="ds-tool-header gap-3" data-export-header="true">
          <div className="flex min-w-0 items-center gap-3">
            {isWhatsApp ? <span className="wa-header-back">‹</span> : null}
            {headerAvatarUrl && !isTelegram ? (
              <img
                src={headerAvatarUrl}
                alt={resolvedChannel.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : isWhatsApp ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dfe5e7] text-sm font-semibold text-[#111b21]">
                {resolvedChannel.name.charAt(0).toUpperCase()}
              </div>
            ) : isTelegram && resolvedChannel.icon ? (
              <img
                src={resolvedChannel.icon}
                alt={resolvedChannel.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : null}
            <div className={`min-w-0 ${isTelegram ? 'tg-header-copy' : ''}`} data-export-header-copy="true">
              <span className={`block truncate ${isTelegram ? 'tg-header-title' : ''}`} data-export-header-title="true">
                {activeSkin === 'discord' ? (
                  <>
                    <span className="ds-tool-header-hash mr-1 text-xl font-medium text-[#949ba4]">#</span>
                    {channelSlug}
                  </>
                ) : (
                  resolvedChannel.name
                )}
              </span>
              <span className={`block truncate text-xs font-normal ${isTelegram ? 'tg-header-subtitle' : 'text-[#949ba4]'}`} data-export-header-subtitle="true">
                {isWhatsApp
                  ? resolvedChannel.description || 'tap here for contact info'
                  : isTelegram
                    ? resolvedChannel.description || `${participantCount} members`
                  : resolvedChannel.description || 'Set a channel topic from the group settings panel.'}
              </span>
            </div>
          </div>

          {isWhatsApp ? (
            <div className="wa-header-actions">
              <button type="button" className="wa-header-icon-button" aria-label="Start video call">
                <Video className="wa-header-action-icon" />
              </button>
              <button type="button" className="wa-header-icon-button" aria-label="Start phone call">
                <Phone className="wa-header-action-icon" />
              </button>
              <button type="button" className="wa-header-icon-button" aria-label="More options">
                <MoreVertical className="wa-header-action-icon" />
              </button>
            </div>
          ) : isTelegram ? (
            <div className="tg-header-actions">
              <button type="button" className="tg-header-icon-button" aria-label="Search">
                <Search className="tg-header-action-icon" />
              </button>
              <button type="button" className="tg-header-icon-button" aria-label="View options">
                <Columns2 className="tg-header-action-icon" />
              </button>
              <button type="button" className="tg-header-icon-button" aria-label="More options">
                <MoreVertical className="tg-header-action-icon" />
              </button>
            </div>
          ) : null}
        </div>

        <ChatContainer
          messageGroups={displayedMessageGroups}
          className="flex-1"
          intro={channelIntro}
          messageListClassName="pb-6"
          messageListStyle={chatBackgroundStyle}
          renderGroup={renderGroup}
          renderSystemMessage={renderSystemMessage}
          footer={
            <div className="ds-chat-footer-inner">
              <input
                ref={attachmentInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleAttachmentInputChange}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleAttachmentInputChange}
              />

              {isTelegram ? (
                <TelegramInputBar
                  placeholder="Message"
                  onSend={handleSend}
                  disabled={isPlaying || isExportingImage}
                  onAttachFile={() => attachmentInputRef.current?.click()}
                />
              ) : (
                <InputBar
                  placeholder={
                    isWhatsApp
                      ? 'Type a message'
                      : `Message #${channelSlug}`
                  }
                  onSend={handleSend}
                  disabled={isPlaying || isExportingImage}
                  shellClassName={isWhatsApp ? 'wa-input-shell' : ''}
                  renderPrefix={
                    isWhatsApp
                      ? () => (
                          <div className="wa-input-prefix-set">
                            <button type="button" className="wa-input-icon-button" aria-label="Emoji">
                              <Smile className="h-5 w-5" />
                            </button>
                          </div>
                        )
                      : undefined
                  }
                  renderSuffix={
                    isWhatsApp
                      ? () => (
                          <div className="wa-input-suffix-set">
                            <button
                              type="button"
                              className="wa-input-icon-button"
                              aria-label="Attach file"
                              onClick={() => attachmentInputRef.current?.click()}
                            >
                              <Paperclip className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              className="wa-input-icon-button"
                              aria-label="Open camera"
                              onClick={() => cameraInputRef.current?.click()}
                            >
                              <Camera className="h-5 w-5" />
                            </button>
                          </div>
                        )
                      : undefined
                  }
                  renderAfterInput={
                    isWhatsApp
                      ? () => (
                          <button type="button" className="wa-mic-button" aria-label="Record voice message">
                            <Mic className="h-5 w-5" />
                          </button>
                        )
                      : undefined
                  }
                />
              )}
            </div>
          }
        />
      </div>

      {!isExportingImage && isSettingsVisible ? (
        <div className="ds-settings-panel mt-4 grid gap-3 xl:grid-cols-3" data-export-hide="true">
          <section className="ds-settings-card rounded-2xl border border-white/10 bg-[#232428] p-4 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#949ba4]">
                  {settingsCopy.channelTitle}
                </p>
                <p className="mt-1 text-sm text-[#c4c9ce]">
                  {settingsCopy.channelDescription}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#1e1f22] text-[#dbdee1]">
                {resolvedChannel.icon ? (
                  <img
                    src={resolvedChannel.icon}
                    alt={resolvedChannel.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Hash className="h-5 w-5" />
                )}
              </div>
            </div>

            <div className="grid gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-[#949ba4]">
                  {settingsCopy.channelNameLabel}
                </span>
                <input
                  type="text"
                  value={resolvedChannel.name}
                  onChange={(event) => handleChannelFieldChange('name', event.target.value)}
                  className="ds-identity-input w-full rounded-lg border border-white/10 bg-[#111214] px-3 py-2.5 text-sm text-[#f2f3f5] outline-none transition placeholder:text-[#8e9297] focus:border-[#5865f2] focus:bg-[#17181a]"
                  placeholder="general"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-[#949ba4]">
                  {settingsCopy.channelDescriptionLabel}
                </span>
                <textarea
                  value={resolvedChannel.description || ''}
                  onChange={(event) => handleChannelFieldChange('description', event.target.value)}
                  rows={3}
                  className="ds-identity-input w-full resize-none rounded-lg border border-white/10 bg-[#111214] px-3 py-2.5 text-sm text-[#f2f3f5] outline-none transition placeholder:text-[#8e9297] focus:border-[#5865f2] focus:bg-[#17181a]"
                  placeholder={settingsCopy.channelDescriptionPlaceholder}
                />
              </label>

              <div>
                <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-[#949ba4]">
                  {settingsCopy.channelAvatarLabel}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={channelIconInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleChannelAvatarSelect}
                  />
                  <button
                    type="button"
                    onClick={() => channelIconInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-medium text-[#dbdee1] transition hover:border-[#5865f2] hover:bg-white/5"
                  >
                    <ImagePlus className="h-4 w-4" />
                    {settingsCopy.channelAvatarButton}
                  </button>
                  {resolvedChannel.icon ? (
                    <button
                      type="button"
                      onClick={handleClearChannelAvatar}
                      className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-[#b5bac1] transition hover:bg-white/5 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <section className="ds-settings-card rounded-2xl border border-white/10 bg-[#232428] p-4 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#949ba4]">
                  Environment settings
                </p>
                <p className="mt-1 text-sm text-[#c4c9ce]">
                  {settingsCopy.environmentDescription}
                </p>
              </div>
              <div
                className="h-12 w-12 rounded-2xl border border-white/10"
                style={{
                  backgroundColor,
                  backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            </div>

            <div className="grid gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-[#949ba4]">
                  Background color
                </span>
                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#111214] px-3 py-2.5">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(event) => setBackgroundColor(event.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
                  />
                  <span className="font-mono text-sm text-[#f2f3f5]">
                    {backgroundColor}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBackgroundColor(getPlatformBackgroundColor(activeSkin))}
                    className="ml-auto text-xs font-medium text-[#949ba4] transition hover:text-white"
                  >
                    Reset
                  </button>
                </div>
              </label>

              <div>
                <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-[#949ba4]">
                  Background image
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={backgroundImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBackgroundImageSelect}
                  />
                  <button
                    type="button"
                    onClick={() => backgroundImageInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-medium text-[#dbdee1] transition hover:border-[#5865f2] hover:bg-white/5"
                  >
                    <ImagePlus className="h-4 w-4" />
                    Upload background
                  </button>
                  {backgroundImageUrl ? (
                    <button
                      type="button"
                      onClick={handleClearBackgroundImage}
                      className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-[#b5bac1] transition hover:bg-white/5 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="rounded-xl border border-white/8 bg-black/10 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#949ba4]">
                  <Palette className="h-3.5 w-3.5" />
                  Live preview
                </div>
                <div
                  className="h-24 rounded-lg border border-white/10"
                  style={{
                    backgroundColor,
                    backgroundImage: backgroundImageUrl
                      ? isWhatsApp
                        ? `linear-gradient(rgba(244, 240, 229, 0.58), rgba(244, 240, 229, 0.76)), url(${backgroundImageUrl})`
                        : isTelegram
                          ? `linear-gradient(rgba(212, 232, 191, 0.54), rgba(182, 214, 152, 0.7)), url(${backgroundImageUrl})`
                        : `linear-gradient(rgba(17, 18, 20, 0.45), rgba(17, 18, 20, 0.65)), url(${backgroundImageUrl})`
                      : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </div>
            </div>
          </section>

          <section className="ds-settings-card rounded-2xl border border-white/10 bg-[#232428] p-4 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#949ba4]">
                  Export settings
                </p>
                <p className="mt-1 text-sm text-[#c4c9ce]">
                  {settingsCopy.exportDescription}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#111214] px-3 py-2 text-right">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#949ba4]">
                  Current
                </p>
                <p className="text-sm font-medium text-[#f2f3f5]">
                  {
                    EXPORT_ASPECT_RATIO_OPTIONS.find(
                      (option) => option.value === exportAspectRatioPreset
                    )?.label
                  }
                </p>
                <p className="text-xs text-[#949ba4]">{exportQuality.label}</p>
              </div>
            </div>

            <div className="grid gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-[#949ba4]">
                  Export ratio
                </span>
                <select
                  value={exportAspectRatioPreset}
                  onChange={(event) =>
                    setExportAspectRatioPreset(event.target.value as ExportAspectRatioPreset)
                  }
                  className="ds-identity-input w-full rounded-lg border border-white/10 bg-[#111214] px-3 py-2.5 text-sm text-[#f2f3f5] outline-none transition focus:border-[#5865f2] focus:bg-[#17181a]"
                >
                  {EXPORT_ASPECT_RATIO_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-[#949ba4]">
                  Export quality
                </span>
                <select
                  value={exportQualityPreset}
                  onChange={(event) =>
                    setExportQualityPreset(event.target.value as ExportQualityPreset)
                  }
                  className="ds-identity-input w-full rounded-lg border border-white/10 bg-[#111214] px-3 py-2.5 text-sm text-[#f2f3f5] outline-none transition focus:border-[#5865f2] focus:bg-[#17181a]"
                >
                  {EXPORT_QUALITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-xl border border-white/8 bg-black/10 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#949ba4]">
                      Quality note
                    </p>
                    <p className="mt-1 text-sm text-[#dbdee1]">
                      {exportQuality.description}
                    </p>
                  </div>
                  <div className="text-right text-xs text-[#949ba4]">
                    <p>{exportQuality.pixelRatio}x render scale</p>
                    <p>Higher quality means a larger PNG file</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="xl:col-span-3">
            <div className="ds-identity-panel rounded-xl border border-white/10 bg-[#232428] p-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => currentAvatarInputRef.current?.click()}
                    className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#1e1f22] text-[#b5bac1] transition hover:border-[#5865f2] hover:text-white"
                    aria-label="Upload avatar"
                  >
                    {currentAvatarUrl ? (
                      <img
                        src={currentAvatarUrl}
                        alt={currentSpeakerName || DEFAULT_SPEAKER_NAME}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound className="h-5 w-5" />
                    )}
                  </button>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#949ba4]">
                      Active identity
                    </p>
                    <p className="text-sm text-[#dbdee1]">
                      Messages you send next will use this name and avatar.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={currentAvatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCurrentAvatarSelect}
                  />
                  <button
                    type="button"
                    onClick={() => currentAvatarInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-medium text-[#dbdee1] transition hover:border-[#5865f2] hover:bg-white/5"
                  >
                    <ImagePlus className="h-4 w-4" />
                    Upload avatar
                  </button>
                  {currentAvatarUrl ? (
                    <button
                      type="button"
                      onClick={handleClearCurrentAvatar}
                      className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-[#b5bac1] transition hover:bg-white/5 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-[#949ba4]">
                  Speaker name
                </span>
                <input
                  type="text"
                  value={currentSpeakerName}
                  onChange={(event) => setCurrentSpeakerName(event.target.value)}
                  placeholder={DEFAULT_SPEAKER_NAME}
                  className="ds-identity-input w-full rounded-lg border border-white/10 bg-[#111214] px-3 py-2.5 text-sm text-[#f2f3f5] outline-none transition placeholder:text-[#8e9297] focus:border-[#5865f2] focus:bg-[#17181a]"
                  style={{
                    backgroundColor: '#111214',
                    color: '#f2f3f5',
                    WebkitTextFillColor: '#f2f3f5',
                  }}
                />
              </label>

              <label className="mt-3 block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-[#949ba4]">
                  Message side
                </span>
                <select
                  value={currentMessageSide}
                  onChange={(event) => setCurrentMessageSide(event.target.value as MessageSide)}
                  className="ds-identity-input w-full rounded-lg border border-white/10 bg-[#111214] px-3 py-2.5 text-sm text-[#f2f3f5] outline-none transition focus:border-[#5865f2] focus:bg-[#17181a]"
                >
                  <option value="right">Right side</option>
                  <option value="left">Left side</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
