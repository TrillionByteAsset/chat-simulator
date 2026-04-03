// src/tools/chat-simulator/index.tsx
// Chat Simulator 工具入口 —— Discord 像素级还原版
'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Camera,
  Check,
  CheckCheck,
  ChevronDown,
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
  SlidersHorizontal,
  Smile,
  Square,
  UserRound,
  Video,
  X,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

import type { ToolManifest } from '@/core/tooling-engine/types';

import {
  AttachmentArea,
  ChatContainer,
  DiscordInputBar,
  InputBar,
  MessageBubble,
  SenderInfo,
  TelegramInputBar,
} from './components';
import {
  CHAT_SIMULATOR_APPLY_TEMPLATE_EVENT,
  type ChatSimulatorCaseTemplate,
} from './data/caseTemplates';
import { DEMO_SCRIPT, DEMO_USERS } from './data/demoScript';
import {
  getChatSimulatorLocalizedManifest,
  getChatSimulatorUiText,
  isChineseLocale,
} from './localization';
import { useChatSimulatorStore } from './store';
import { getChatSimulatorStructuredData } from './structured-data';
import {
  Attachment,
  ChatChannel,
  ChatMessage,
  ChatUser,
  MessageGroup,
  MessageSide,
  PlatformType,
} from './types/chat';
import {
  deliverExportedFile,
  deliverExportedFiles,
} from './utils/exportDelivery';
import {
  canvasToImageBlob,
  exportElementToImageBlob,
  renderElementToCanvas,
  splitCanvasIntoPages,
} from './utils/exportToPng';
import { parseScript } from './utils/scriptParser';
// 动态加载对应的皮肤样式
import './skins/index.css';

const LazyExportDialog = dynamic(
  () =>
    import('./components/ExportDialog').then((module) => ({
      default: module.ExportDialog,
    })),
  {
    ssr: false,
  }
);

interface ChatSimulatorProps {
  manifest: ToolManifest;
  structuredDataPath?: string;
  themeName?: string;
}

type ExportAspectRatioPreset = 'auto' | '9:16' | '4:5' | '1:1' | '16:9';
type ExportQualityPreset = 'standard' | 'high' | 'ultra';
type ExportLayoutPreset = 'web' | 'mobile';
type ExportFileFormat = 'png' | 'jpg';
type ExportContentPreset = 'viewport' | 'full';
type ExportOverflowMode = 'single' | 'multiple';

const CURRENT_SPEAKER_ID = 'current-speaker';
const DEFAULT_SPEAKER_NAME = 'You';
const DEFAULT_MESSAGE_SIDE: MessageSide = 'right';
const DEFAULT_BACKGROUND_COLOR = '#313338';
const PLATFORM_LABELS: Record<PlatformType, string> = {
  discord: 'Discord',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  custom: 'Custom',
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
  custom: '#17181c',
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
const EXPORT_LAYOUT_OPTIONS: Array<{
  value: ExportLayoutPreset;
  label: string;
  description: string;
  renderWidth: number | null;
  renderHeight: number | null;
  defaultAspectRatio: number | null;
}> = [
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
];

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function waitForNextPaint() {
  await new Promise((resolve) =>
    window.requestAnimationFrame(() => resolve(null))
  );
  await new Promise((resolve) =>
    window.requestAnimationFrame(() => resolve(null))
  );
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
  return (
    EXPORT_ASPECT_RATIO_OPTIONS.find((option) => option.value === preset)
      ?.aspectRatio ?? null
  );
}

function getExportLayoutConfig(preset: ExportLayoutPreset) {
  return (
    EXPORT_LAYOUT_OPTIONS.find((option) => option.value === preset) ??
    EXPORT_LAYOUT_OPTIONS[0]
  );
}

function getExportQualityConfig(preset: ExportQualityPreset) {
  return (
    EXPORT_QUALITY_OPTIONS.find((option) => option.value === preset) ??
    EXPORT_QUALITY_OPTIONS[1]
  );
}

function getPlatformBackgroundColor(platform: PlatformType) {
  return PLATFORM_DEFAULT_BACKGROUNDS[platform] ?? DEFAULT_BACKGROUND_COLOR;
}

function getPlatformSettingsSurfaceColor(platform: PlatformType) {
  switch (platform) {
    case 'custom':
      return '#1c1e24';
    case 'telegram':
      return '#2f3e49';
    case 'whatsapp':
      return '#111b21';
    case 'discord':
    default:
      return '#232428';
  }
}

function getPlatformSettingsInsetColor(platform: PlatformType) {
  switch (platform) {
    case 'custom':
      return '#111318';
    case 'telegram':
      return '#243847';
    case 'whatsapp':
      return '#0b141a';
    case 'discord':
    default:
      return '#111214';
  }
}

function normalizeSpeakerColor(color?: string) {
  return color || '#5865f2';
}

function buildCurrentSpeaker(name: string, avatarUrl: string): ChatUser {
  return {
    id: CURRENT_SPEAKER_ID,
    name: name.trim() || DEFAULT_SPEAKER_NAME,
    avatar: avatarUrl,
    defaultSide: DEFAULT_MESSAGE_SIDE,
    color: '#5865f2',
  };
}

function createIdentityDraft(index: number, locale?: string): ChatUser {
  return {
    id: `user-custom-${Date.now()}-${index}`,
    name: isChineseLocale(locale) ? `新人物 ${index}` : `New person ${index}`,
    avatar: '',
    defaultSide: 'left',
    color: '#f59e0b',
  };
}

function buildDefaultChannel(name: string, description: string): ChatChannel {
  return {
    id: 'channel-general',
    name: name.trim() || 'general',
    description:
      description.trim() || 'A place to coordinate and share updates.',
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

function formatCustomMessageTimestamp(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const timeLabel = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (isToday) {
    return timeLabel;
  }

  const dateLabel = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return `${dateLabel} ${timeLabel}`;
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

function interleaveDateSeparators(
  groups: MessageGroup[],
  platform: PlatformType
): MessageGroup[] {
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

    if (
      currentDateKey &&
      currentDateKey !== lastDateKey &&
      shouldInsertDateSeparator(platform, group.timestamp)
    ) {
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

function getBubblePositionClass(
  messageCount: number,
  messageIndex: number,
  prefix: string
) {
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

function shouldUseWideMessageLayout(message: ChatMessage) {
  return message.content.trim().length >= 80;
}

function groupMessagesForDisplay(messages: ChatMessage[]): MessageGroup[] {
  const groups: MessageGroup[] = [];

  for (const message of messages) {
    const lastGroup = groups[groups.length - 1];

    if (
      lastGroup &&
      lastGroup.sender.id === message.sender.id &&
      lastGroup.messages[lastGroup.messages.length - 1]?.authorName ===
        message.authorName &&
      lastGroup.messages[lastGroup.messages.length - 1]?.avatarUrl ===
        message.avatarUrl &&
      getMessageSide(lastGroup.messages[lastGroup.messages.length - 1]) ===
        getMessageSide(message) &&
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

export default function ChatSimulator({
  manifest,
  structuredDataPath,
  themeName,
}: ChatSimulatorProps) {
  const locale = useLocale();
  const isZh = isChineseLocale(locale);
  const uiText = getChatSimulatorUiText(locale);
  const localizedManifest = getChatSimulatorLocalizedManifest(manifest, locale);
  const {
    messages,
    messageGroups,
    users,
    setMessages,
    setUsers,
    upsertUser,
    updateUser,
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
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingAuthorName, setEditingAuthorName] = useState('');
  const [editingAvatarUrl, setEditingAvatarUrl] = useState('');
  const [selectedIdentityId, setSelectedIdentityId] =
    useState<string>(CURRENT_SPEAKER_ID);
  const [backgroundColor, setBackgroundColor] = useState(
    DEFAULT_BACKGROUND_COLOR
  );
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [isSettingsVisible, setIsSettingsVisible] = useState(true);
  const [isPlatformMenuOpen, setIsPlatformMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visibleMessageCount, setVisibleMessageCount] = useState(
    messages.length
  );
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFileFormat, setExportFileFormat] =
    useState<ExportFileFormat>('png');
  const [exportLayoutPreset, setExportLayoutPreset] =
    useState<ExportLayoutPreset>('web');
  const [exportAspectRatioPreset, setExportAspectRatioPreset] =
    useState<ExportAspectRatioPreset>('auto');
  const [exportQualityPreset, setExportQualityPreset] =
    useState<ExportQualityPreset>('high');
  const [exportContentPreset, setExportContentPreset] =
    useState<ExportContentPreset>('full');
  const [exportOverflowMode, setExportOverflowMode] =
    useState<ExportOverflowMode>('single');
  const currentAvatarInputRef = useRef<HTMLInputElement>(null);
  const channelIconInputRef = useRef<HTMLInputElement>(null);
  const backgroundImageInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const imageAttachmentInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const identityAvatarObjectUrlsRef = useRef<Record<string, string>>({});
  const channelAvatarObjectUrlRef = useRef<string | null>(null);
  const backgroundImageObjectUrlRef = useRef<string | null>(null);
  const editingAvatarObjectUrlRef = useRef<string | null>(null);
  const attachmentObjectUrlsRef = useRef<string[]>([]);
  const playbackRunRef = useRef(0);
  const captureRef = useRef<HTMLDivElement>(null);
  const platformMenuRef = useRef<HTMLDivElement>(null);
  const supportedSkins = (localizedManifest.config.supported_skins || [
    'discord',
  ]) as PlatformType[];
  const structuredData = structuredDataPath
    ? getChatSimulatorStructuredData({
        canonicalPath: structuredDataPath,
        locale,
        manifest: localizedManifest,
      })
    : null;

  const resolvedChannel =
    channel ??
    buildDefaultChannel(
      localizedManifest.name,
      localizedManifest.seo.description
    );
  const identityOptions = Object.values(users).filter(
    (user) => user.id !== 'system'
  );
  const isWhatsApp = activeSkin === 'whatsapp';
  const isTelegram = activeSkin === 'telegram';
  const isCustom = activeSkin === 'custom';
  const selectedIdentity = isCustom
    ? (users[selectedIdentityId] ?? null)
    : (users[selectedIdentityId] ??
      users[CURRENT_SPEAKER_ID] ??
      buildCurrentSpeaker(uiText.defaultSpeakerName, ''));
  const channelSlug = formatChannelSlug(resolvedChannel.name);
  const exportAspectRatioOptions = uiText.exportAspectRatioOptions;
  const exportQualityOptions = uiText.exportQualityOptions;
  const exportLayoutOptions = uiText.exportLayoutOptions;
  const exportContentOptions = uiText.exportContentOptions;
  const exportOverflowOptions = uiText.exportOverflowOptions;
  const exportLayout =
    exportLayoutOptions.find((option) => option.value === exportLayoutPreset) ??
    exportLayoutOptions[0];
  const exportAspectRatio =
    exportAspectRatioPreset === 'auto'
      ? exportLayout.defaultAspectRatio
      : (exportAspectRatioOptions.find(
          (option) => option.value === exportAspectRatioPreset
        )?.aspectRatio ?? null);
  const exportQuality =
    exportQualityOptions.find(
      (option) => option.value === exportQualityPreset
    ) ?? exportQualityOptions[1];
  const exportMimeType =
    exportFileFormat === 'jpg' ? 'image/jpeg' : 'image/png';
  const displayedMessages = isPlaying
    ? messages.slice(0, visibleMessageCount)
    : messages;
  const rawDisplayedMessageGroups = isPlaying
    ? groupMessagesForDisplay(displayedMessages)
    : messageGroups;
  const displayedMessageGroups =
    isWhatsApp || isTelegram
      ? interleaveDateSeparators(rawDisplayedMessageGroups, activeSkin)
      : rawDisplayedMessageGroups;
  const participantCount =
    new Set(
      messages
        .filter((message) => !message.isSystemMessage)
        .map((message) => message.authorName || message.sender.name)
    ).size || 1;
  const firstParticipantAvatar =
    messages.find((message) => !message.isSystemMessage && message.avatarUrl)
      ?.avatarUrl ||
    selectedIdentity?.avatar ||
    DEMO_USERS.Alex.avatar;
  const platformMenuSkins = supportedSkins.filter((skin) => skin !== 'custom');
  const headerAvatarUrl =
    resolvedChannel.icon || (isWhatsApp ? firstParticipantAvatar : '');
  const settingsCopy = isCustom
    ? uiText.settingsCopy.custom
    : isWhatsApp
      ? uiText.settingsCopy.whatsapp
      : isTelegram
        ? uiText.settingsCopy.telegram
        : uiText.settingsCopy.discord;
  const chatBackgroundStyle = {
    backgroundColor,
    backgroundImage: backgroundImageUrl
      ? isWhatsApp
        ? `linear-gradient(rgba(244, 240, 229, 0.72), rgba(244, 240, 229, 0.84)), url(${backgroundImageUrl})`
        : isTelegram
          ? `linear-gradient(rgba(212, 232, 191, 0.58), rgba(182, 214, 152, 0.7)), url(${backgroundImageUrl})`
          : isCustom
            ? `linear-gradient(rgba(17, 19, 24, 0.34), rgba(17, 19, 24, 0.6)), url(${backgroundImageUrl})`
            : `linear-gradient(rgba(17, 18, 20, 0.56), rgba(17, 18, 20, 0.72)), url(${backgroundImageUrl})`
      : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } as const;
  const previewViewportStyle = {
    height: 'clamp(560px, calc(100vh - 18rem), 820px)',
    minHeight: '560px',
    maxHeight: '820px',
  } as const;
  const settingsSurfaceStyle = {
    backgroundColor: getPlatformSettingsSurfaceColor(activeSkin),
  } as const;
  const settingsInsetStyle = {
    backgroundColor: getPlatformSettingsInsetColor(activeSkin),
  } as const;

  useEffect(() => {
    const script = parseScript(DEMO_SCRIPT, DEMO_USERS);
    const scriptUsers = Object.fromEntries(
      Object.values(script.users).map((user) => [
        user.id,
        {
          ...user,
          name:
            user.id === CURRENT_SPEAKER_ID
              ? uiText.defaultSpeakerName
              : user.name,
          defaultSide: user.defaultSide ?? 'left',
        },
      ])
    );
    const seededUsers = {
      ...scriptUsers,
      [CURRENT_SPEAKER_ID]: buildCurrentSpeaker(uiText.defaultSpeakerName, ''),
    };
    setUsers(seededUsers);
    setMessages(script.messages);
    setSelectedIdentityId(CURRENT_SPEAKER_ID);
    setChannel(
      buildDefaultChannel(
        localizedManifest.name,
        localizedManifest.seo.description
      )
    );
    setSkin(
      (localizedManifest.config.skin_preset || 'discord') as PlatformType
    );
    setBackgroundColor(
      getPlatformBackgroundColor(
        (localizedManifest.config.skin_preset || 'discord') as PlatformType
      )
    );
  }, [
    localizedManifest.config.skin_preset,
    localizedManifest.name,
    localizedManifest.seo.description,
    setChannel,
    setMessages,
    setSkin,
    setUsers,
    uiText.defaultSpeakerName,
  ]);

  useEffect(() => {
    return () => {
      Object.values(identityAvatarObjectUrlsRef.current).forEach((url) =>
        revokeObjectUrlIfNeeded(url)
      );
      revokeObjectUrlIfNeeded(channelAvatarObjectUrlRef.current);
      revokeObjectUrlIfNeeded(backgroundImageObjectUrlRef.current);
      revokeObjectUrlIfNeeded(editingAvatarObjectUrlRef.current);
      attachmentObjectUrlsRef.current.forEach((url) =>
        revokeObjectUrlIfNeeded(url)
      );
    };
  }, []);

  useEffect(() => {
    if (users[selectedIdentityId]) {
      return;
    }

    if (users[CURRENT_SPEAKER_ID]) {
      setSelectedIdentityId(CURRENT_SPEAKER_ID);
      return;
    }

    const firstIdentity = identityOptions[0];

    if (firstIdentity) {
      setSelectedIdentityId(firstIdentity.id);
    }
  }, [identityOptions, selectedIdentityId, users]);

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
    if (!selectedIdentity) {
      toast.error(uiText.addPersonFirstForChat);
      return;
    }

    const currentUser = selectedIdentity;
    const currentMessageSide =
      selectedIdentity.defaultSide ?? DEFAULT_MESSAGE_SIDE;

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

    if (!selectedIdentity) {
      toast.error(uiText.addPersonFirstForFiles);
      return;
    }

    const currentUser = selectedIdentity;
    const currentMessageSide =
      selectedIdentity.defaultSide ?? DEFAULT_MESSAGE_SIDE;
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

  const handleAttachmentInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    handleSendAttachments(files);
    event.target.value = '';
  };

  const handleStartEdit = (message: ChatMessage) => {
    revokeObjectUrlIfNeeded(editingAvatarObjectUrlRef.current);
    editingAvatarObjectUrlRef.current = null;
    setEditingUserId(message.sender.id);
    setEditingMessageId(message.id);
    setEditingValue(message.content);
    setEditingTimestamp(toDateTimeLocalValue(message.timestamp));
    setEditingAuthorName(message.authorName);
    setEditingAvatarUrl(message.avatarUrl);
  };

  const handleCancelEdit = () => {
    revokeObjectUrlIfNeeded(editingAvatarObjectUrlRef.current);
    editingAvatarObjectUrlRef.current = null;
    setEditingUserId(null);
    setEditingMessageId(null);
    setEditingValue('');
    setEditingTimestamp('');
    setEditingAuthorName('');
    setEditingAvatarUrl('');
  };

  const handleSaveEdit = () => {
    if (!editingMessageId) {
      return;
    }

    const editingMessage = messages.find(
      (message) => message.id === editingMessageId
    );

    if (!editingMessage) {
      return;
    }

    const hasTextAfterEdit = editingValue.trim().length > 0;
    const hasAttachments = (editingMessage.attachments?.length || 0) > 0;

    if (!hasTextAfterEdit && !hasAttachments) {
      return;
    }

    updateMessage(editingMessageId, editingValue, {
      timestamp: fromDateTimeLocalValue(editingTimestamp) || undefined,
      allowEmptyContent: hasAttachments,
    });
    if (editingUserId) {
      const previousIdentityAvatar =
        identityAvatarObjectUrlsRef.current[editingUserId] || null;

      if (editingAvatarUrl) {
        if (
          previousIdentityAvatar &&
          previousIdentityAvatar !== editingAvatarUrl
        ) {
          revokeObjectUrlIfNeeded(previousIdentityAvatar);
        }

        if (editingAvatarObjectUrlRef.current === editingAvatarUrl) {
          identityAvatarObjectUrlsRef.current[editingUserId] = editingAvatarUrl;
          editingAvatarObjectUrlRef.current = null;
        }
      } else if (previousIdentityAvatar) {
        revokeObjectUrlIfNeeded(previousIdentityAvatar);
        delete identityAvatarObjectUrlsRef.current[editingUserId];
      }

      updateUser(editingUserId, {
        avatar: editingAvatarUrl,
      });
    } else {
      updateAuthorAvatar(editingAuthorName, editingAvatarUrl);
    }
    editingAvatarObjectUrlRef.current = null;

    handleCancelEdit();
  };

  const handleDeleteMessage = (messageId: string) => {
    if (editingMessageId === messageId) {
      handleCancelEdit();
    }

    deleteMessage(messageId);
  };

  const handleCreateNewChat = () => {
    attachmentObjectUrlsRef.current.forEach((url) =>
      revokeObjectUrlIfNeeded(url)
    );
    attachmentObjectUrlsRef.current = [];
    startNewChat(channelSlug);
    handleCancelEdit();
  };

  const handleCurrentAvatarSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!selectedIdentity) {
      return;
    }

    const previousObjectUrl =
      identityAvatarObjectUrlsRef.current[selectedIdentity.id];
    revokeObjectUrlIfNeeded(previousObjectUrl || null);
    const nextObjectUrl = URL.createObjectURL(file);
    identityAvatarObjectUrlsRef.current[selectedIdentity.id] = nextObjectUrl;
    updateUser(selectedIdentity.id, {
      avatar: nextObjectUrl,
    });
    event.target.value = '';
  };

  const handleClearCurrentAvatar = () => {
    if (!selectedIdentity) {
      return;
    }

    revokeObjectUrlIfNeeded(
      identityAvatarObjectUrlsRef.current[selectedIdentity.id] || null
    );
    delete identityAvatarObjectUrlsRef.current[selectedIdentity.id];
    updateUser(selectedIdentity.id, {
      avatar: '',
    });

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

  const handleIdentityNameChange = (nextName: string) => {
    if (!selectedIdentity) {
      return;
    }

    updateUser(selectedIdentity.id, {
      name: nextName,
    });
  };

  const handleIdentitySideChange = (nextSide: MessageSide) => {
    if (!selectedIdentity) {
      return;
    }

    updateUser(selectedIdentity.id, {
      defaultSide: nextSide,
    });
  };

  const handleIdentityColorChange = (nextColor: string) => {
    if (!selectedIdentity) {
      return;
    }

    updateUser(selectedIdentity.id, {
      color: nextColor,
    });
  };

  const handleAddIdentity = () => {
    const nextIdentity = createIdentityDraft(
      identityOptions.length + 1,
      locale
    );
    upsertUser(nextIdentity);
    setSelectedIdentityId(nextIdentity.id);
  };

  const handleChannelFieldChange = (
    field: keyof ChatChannel,
    value: string
  ) => {
    setChannel({
      ...resolvedChannel,
      [field]: value,
    });
  };

  const handlePlatformChange = (nextSkin: PlatformType) => {
    setSkin(nextSkin);
    setIsPlatformMenuOpen(false);
    attachmentObjectUrlsRef.current.forEach((url) =>
      revokeObjectUrlIfNeeded(url)
    );
    attachmentObjectUrlsRef.current = [];
    setBackgroundImageUrl('');
    revokeObjectUrlIfNeeded(backgroundImageObjectUrlRef.current);
    backgroundImageObjectUrlRef.current = null;
    if (backgroundImageInputRef.current) {
      backgroundImageInputRef.current.value = '';
    }
    setBackgroundColor(getPlatformBackgroundColor(nextSkin));

    if (nextSkin === 'custom') {
      setMessages([]);
      setUsers({});
      setSelectedIdentityId(CURRENT_SPEAKER_ID);
    }
  };

  useEffect(() => {
    const handleApplyTemplate = (event: Event) => {
      const template = (event as CustomEvent<ChatSimulatorCaseTemplate>).detail;

      if (!template) {
        return;
      }

      playbackRunRef.current += 1;
      setIsPlaying(false);
      setVisibleMessageCount(template.messages.length);
      handleCancelEdit();

      attachmentObjectUrlsRef.current.forEach((url) =>
        revokeObjectUrlIfNeeded(url)
      );
      attachmentObjectUrlsRef.current = [];

      revokeObjectUrlIfNeeded(backgroundImageObjectUrlRef.current);
      backgroundImageObjectUrlRef.current = null;
      setBackgroundImageUrl('');

      if (backgroundImageInputRef.current) {
        backgroundImageInputRef.current.value = '';
      }

      setSkin(template.platform);
      setUsers(template.users);
      setMessages(template.messages);
      setChannel(template.channel);
      setSelectedIdentityId(template.selectedIdentityId);
      setBackgroundColor(getPlatformBackgroundColor(template.platform));
    };

    window.addEventListener(
      CHAT_SIMULATOR_APPLY_TEMPLATE_EVENT,
      handleApplyTemplate as EventListener
    );

    return () => {
      window.removeEventListener(
        CHAT_SIMULATOR_APPLY_TEMPLATE_EVENT,
        handleApplyTemplate as EventListener
      );
    };
  }, [handleCancelEdit, setChannel, setMessages, setSkin, setUsers]);

  const handleChannelAvatarSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  const handleBackgroundImageSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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

    const exportNode = captureRef.current;
    playbackRunRef.current += 1;
    setIsPlaying(false);
    setVisibleMessageCount(messages.length);
    handleCancelEdit();
    setIsExportingImage(true);

    try {
      await sleep(80);
      await waitForNextPaint();
      const exportViewportWidth =
        exportLayout.renderWidth ?? Math.round(exportNode.getBoundingClientRect().width);
      const exportViewportHeight =
        exportLayout.renderHeight ??
        Math.round(exportNode.getBoundingClientRect().height);

      if (exportContentPreset === 'viewport') {
        const blob = await exportElementToImageBlob(exportNode, exportMimeType, {
          pixelRatio: exportQuality.pixelRatio,
          aspectRatio: exportAspectRatio,
          matteColor: backgroundColor,
          renderWidth: exportLayout.renderWidth,
          renderHeight: exportLayout.renderHeight,
        });

        const file = new File([blob], `${channelSlug}-chat.${exportFileFormat}`, {
          type: exportMimeType,
        });
        await deliverExportedFile(file);
      } else {
        const canvas = await renderElementToCanvas(exportNode, {
          pixelRatio: exportQuality.pixelRatio,
          aspectRatio: null,
          matteColor: backgroundColor,
          renderWidth: exportViewportWidth,
          renderHeight: exportViewportHeight,
          captureFullContent: true,
        });

        if (exportOverflowMode === 'multiple') {
          const pageHeight = Math.max(
            1,
            Math.round(exportViewportHeight * exportQuality.pixelRatio)
          );
          const pageCanvases = splitCanvasIntoPages(canvas, pageHeight);
          const files = await Promise.all(
            pageCanvases.map(async (pageCanvas, index) => {
              const blob = await canvasToImageBlob(
                pageCanvas,
                exportNode,
                exportMimeType,
                { matteColor: backgroundColor }
              );

              return new File(
                [blob],
                `${channelSlug}-chat-${index + 1}.${exportFileFormat}`,
                { type: exportMimeType }
              );
            })
          );

          await deliverExportedFiles(files);
        } else {
          const blob = await canvasToImageBlob(
            canvas,
            exportNode,
            exportMimeType,
            { matteColor: backgroundColor }
          );
          const file = new File(
            [blob],
            `${channelSlug}-chat.${exportFileFormat}`,
            { type: exportMimeType }
          );
          await deliverExportedFile(file);
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : uiText.exportFailed;

      if (message !== 'Share canceled.') {
        toast.error(message);
      }
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleStartExport = async () => {
    setIsExportDialogOpen(false);
    await handleExportImage();
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
              const messageTime = formatCustomMessageTimestamp(
                message.timestamp
              );
              const bubblePositionClass = getBubblePositionClass(
                group.messages.length,
                messageIndex,
                'tg-bubble-position'
              );
              const useWideLayout = shouldUseWideMessageLayout(message);

              return (
                <div
                  key={message.id}
                  className={`tg-bubble-shell ${isOutgoing ? 'tg-bubble-shell-outgoing' : 'tg-bubble-shell-incoming'} ${bubblePositionClass} ${useWideLayout ? 'tg-bubble-shell-wide' : ''}`}
                >
                  <MessageBubble
                    message={message}
                    className={`tg-message-bubble ${isOutgoing ? 'tg-message-bubble-outgoing' : 'tg-message-bubble-incoming'} ${useWideLayout ? 'tg-message-bubble-wide' : ''}`}
                    isEditing={editingMessageId === message.id}
                    editingValue={
                      editingMessageId === message.id
                        ? editingValue
                        : message.content
                    }
                    editingTimestamp={
                      editingMessageId === message.id
                        ? editingTimestamp
                        : toDateTimeLocalValue(message.timestamp)
                    }
                    editingAvatarUrl={
                      editingMessageId === message.id
                        ? editingAvatarUrl
                        : message.avatarUrl
                    }
                    editingAuthorName={
                      editingMessageId === message.id
                        ? editingAuthorName
                        : message.authorName
                    }
                    onEditingValueChange={setEditingValue}
                    onEditingTimestampChange={setEditingTimestamp}
                    onEditingAvatarChange={handleEditingAvatarChange}
                    onEditingAvatarClear={handleEditingAvatarClear}
                    onEdit={
                      message.isSystemMessage
                        ? undefined
                        : () => handleStartEdit(message)
                    }
                    onDelete={
                      message.isSystemMessage
                        ? undefined
                        : () => handleDeleteMessage(message.id)
                    }
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
                                style={{
                                  color: group.sender.color || '#54a33a',
                                }}
                              >
                                {displayName}
                              </p>
                            </div>
                          ) : null}
                          <p className="tg-message-text break-words whitespace-pre-wrap">
                            {content}
                          </p>
                          <span
                            className={`tg-message-meta ${isOutgoing ? 'tg-message-meta-outgoing' : 'tg-message-meta-incoming'}`}
                          >
                            <span
                              className={`tg-message-time ${isOutgoing ? 'tg-message-time-outgoing' : 'tg-message-time-incoming'}`}
                            >
                              {messageTime}
                            </span>
                            {isOutgoing ? (
                              <span
                                className={`tg-message-status ${
                                  (message.metadata?.deliveryStatus as
                                    | string
                                    | undefined) === 'read'
                                    ? 'tg-message-status-read'
                                    : ''
                                }`}
                              >
                                {(message.metadata?.deliveryStatus as
                                  | string
                                  | undefined) === 'read' ? (
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
                            {!isOutgoing &&
                            messageIndex === 0 &&
                            !message.content.trim() ? (
                              <div className="tg-author-row tg-author-row-attachment">
                                <p
                                  className="tg-inline-author"
                                  style={{
                                    color: group.sender.color || '#54a33a',
                                  }}
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
                              <span
                                className={`tg-attachment-meta ${isOutgoing ? 'tg-message-meta-outgoing' : 'tg-message-meta-incoming'}`}
                              >
                                <span
                                  className={`tg-message-time ${isOutgoing ? 'tg-message-time-outgoing' : 'tg-message-time-incoming'}`}
                                >
                                  {messageTime}
                                </span>
                                {isOutgoing ? (
                                  <span
                                    className={`tg-message-status ${
                                      (message.metadata?.deliveryStatus as
                                        | string
                                        | undefined) === 'read'
                                        ? 'tg-message-status-read'
                                        : ''
                                    }`}
                                  >
                                    {(message.metadata?.deliveryStatus as
                                      | string
                                      | undefined) === 'read' ? (
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
                            {!isOutgoing &&
                            messageIndex === 0 &&
                            !message.content.trim() ? (
                              <div className="tg-author-row tg-author-row-attachment">
                                <p
                                  className="tg-inline-author"
                                  style={{
                                    color: group.sender.color || '#54a33a',
                                  }}
                                >
                                  {displayName}
                                </p>
                              </div>
                            ) : null}
                            <div className="tg-attachment-card tg-attachment-card-image">
                              <video
                                src={attachment.url}
                                controls
                                className="tg-attachment-image"
                              />
                              <span
                                className={`tg-attachment-meta ${isOutgoing ? 'tg-message-meta-outgoing' : 'tg-message-meta-incoming'}`}
                              >
                                <span
                                  className={`tg-message-time ${isOutgoing ? 'tg-message-time-outgoing' : 'tg-message-time-incoming'}`}
                                >
                                  {messageTime}
                                </span>
                                {isOutgoing ? (
                                  <span
                                    className={`tg-message-status ${
                                      (message.metadata?.deliveryStatus as
                                        | string
                                        | undefined) === 'read'
                                        ? 'tg-message-status-read'
                                        : ''
                                    }`}
                                  >
                                    {(message.metadata?.deliveryStatus as
                                      | string
                                      | undefined) === 'read' ? (
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
                            {!isOutgoing &&
                            messageIndex === 0 &&
                            !message.content.trim() ? (
                              <div className="tg-author-row tg-author-row-attachment">
                                <p
                                  className="tg-inline-author"
                                  style={{
                                    color: group.sender.color || '#54a33a',
                                  }}
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
                              <span className="tg-attachment-file-name">
                                {attachment.name}
                              </span>
                              <span className="tg-attachment-file-meta">
                                {attachment.size
                                  ? `${(attachment.size / 1024).toFixed(1)} KB`
                                  : 'File'}
                              </span>
                              <span
                                className={`tg-attachment-meta ${isOutgoing ? 'tg-message-meta-outgoing' : 'tg-message-meta-incoming'}`}
                              >
                                <span
                                  className={`tg-message-time ${isOutgoing ? 'tg-message-time-outgoing' : 'tg-message-time-incoming'}`}
                                >
                                  {messageTime}
                                </span>
                                {isOutgoing ? (
                                  <span
                                    className={`tg-message-status ${
                                      (message.metadata?.deliveryStatus as
                                        | string
                                        | undefined) === 'read'
                                        ? 'tg-message-status-read'
                                        : ''
                                    }`}
                                  >
                                    {(message.metadata?.deliveryStatus as
                                      | string
                                      | undefined) === 'read' ? (
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
                            {!isOutgoing &&
                            messageIndex === 0 &&
                            !message.content.trim() ? (
                              <div className="tg-author-row tg-author-row-attachment">
                                <p
                                  className="tg-inline-author"
                                  style={{
                                    color: group.sender.color || '#54a33a',
                                  }}
                                >
                                  {displayName}
                                </p>
                              </div>
                            ) : null}
                            <div className="tg-attachment-card tg-attachment-file">
                              <audio
                                src={attachment.url}
                                controls
                                className="w-full"
                              />
                              <span
                                className={`tg-attachment-meta ${isOutgoing ? 'tg-message-meta-outgoing' : 'tg-message-meta-incoming'}`}
                              >
                                <span
                                  className={`tg-message-time ${isOutgoing ? 'tg-message-time-outgoing' : 'tg-message-time-incoming'}`}
                                >
                                  {messageTime}
                                </span>
                                {isOutgoing ? (
                                  <span
                                    className={`tg-message-status ${
                                      (message.metadata?.deliveryStatus as
                                        | string
                                        | undefined) === 'read'
                                        ? 'tg-message-status-read'
                                        : ''
                                    }`}
                                  >
                                    {(message.metadata?.deliveryStatus as
                                      | string
                                      | undefined) === 'read' ? (
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

    if (activeSkin === 'custom') {
      const firstMessage = group.messages[0];
      const displayName = firstMessage.authorName || group.sender.name;
      const avatarUrl = firstMessage.avatarUrl || group.sender.avatar;
      const isOutgoing = getMessageSide(firstMessage) === 'right';

      return (
        <div
          className={`custom-message-group ${isOutgoing ? 'custom-message-group-outgoing' : 'custom-message-group-incoming'}`}
          key={index}
        >
          {!isOutgoing ? (
            <div className="custom-group-avatar">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-9 w-9 rounded-full object-cover"
                  title={displayName}
                />
              ) : (
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: group.sender.color || '#7c86ff' }}
                  title={displayName}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ) : null}

          <div
            className={`custom-group-stack ${isOutgoing ? 'custom-group-stack-outgoing' : ''}`}
          >
            {group.messages.map((message, messageIndex) => {
              const messageTime = formatCustomMessageTimestamp(
                message.timestamp
              );
              const shouldShowMeta = messageIndex === 0 || isOutgoing;
              const useWideLayout = shouldUseWideMessageLayout(message);

              return (
                <div
                  key={message.id}
                  className={`custom-bubble-shell ${isOutgoing ? 'custom-bubble-shell-outgoing' : 'custom-bubble-shell-incoming'} ${useWideLayout ? 'custom-bubble-shell-wide' : ''}`}
                >
                  <MessageBubble
                    message={message}
                    className={`custom-message-bubble ${isOutgoing ? 'custom-message-bubble-outgoing' : 'custom-message-bubble-incoming'} ${useWideLayout ? 'custom-message-bubble-wide' : ''}`}
                    isEditing={editingMessageId === message.id}
                    editingValue={
                      editingMessageId === message.id
                        ? editingValue
                        : message.content
                    }
                    editingTimestamp={
                      editingMessageId === message.id
                        ? editingTimestamp
                        : toDateTimeLocalValue(message.timestamp)
                    }
                    editingAvatarUrl={
                      editingMessageId === message.id
                        ? editingAvatarUrl
                        : message.avatarUrl
                    }
                    editingAuthorName={
                      editingMessageId === message.id
                        ? editingAuthorName
                        : message.authorName
                    }
                    onEditingValueChange={setEditingValue}
                    onEditingTimestampChange={setEditingTimestamp}
                    onEditingAvatarChange={handleEditingAvatarChange}
                    onEditingAvatarClear={handleEditingAvatarClear}
                    onEdit={
                      message.isSystemMessage
                        ? undefined
                        : () => handleStartEdit(message)
                    }
                    onDelete={
                      message.isSystemMessage
                        ? undefined
                        : () => handleDeleteMessage(message.id)
                    }
                    onEditSave={handleSaveEdit}
                    onEditCancel={handleCancelEdit}
                    renderContent={(content) => {
                      if (!content.trim()) {
                        return null;
                      }

                      return (
                        <div className="custom-message-content-wrap">
                          {shouldShowMeta && (
                            <div className="custom-message-meta">
                              <span
                                className="custom-message-author"
                                style={{
                                  color: group.sender.color || '#f2f3f5',
                                }}
                              >
                                {displayName}
                              </span>
                              <span className="custom-message-time">
                                {messageTime}
                              </span>
                            </div>
                          )}
                          <p className="custom-message-text break-words whitespace-pre-wrap">
                            {content}
                          </p>
                        </div>
                      );
                    }}
                    renderAttachments={(attachments) => (
                      <AttachmentArea
                        attachments={attachments}
                        className="custom-attachment-area"
                        renderImage={(attachment: Attachment) => (
                          <div className="custom-attachment-wrap">
                            {shouldShowMeta ? (
                              <div className="custom-message-meta custom-message-meta-attachment">
                                <span
                                  className="custom-message-author"
                                  style={{
                                    color: group.sender.color || '#f2f3f5',
                                  }}
                                >
                                  {displayName}
                                </span>
                                <span className="custom-message-time">
                                  {messageTime}
                                </span>
                              </div>
                            ) : null}
                            <div className="custom-attachment-card custom-attachment-card-image">
                              <img
                                src={attachment.url}
                                alt={attachment.name}
                                className="custom-attachment-image"
                                loading="lazy"
                              />
                            </div>
                          </div>
                        )}
                        renderVideo={(attachment: Attachment) => (
                          <div className="custom-attachment-wrap">
                            {shouldShowMeta ? (
                              <div className="custom-message-meta custom-message-meta-attachment">
                                <span
                                  className="custom-message-author"
                                  style={{
                                    color: group.sender.color || '#f2f3f5',
                                  }}
                                >
                                  {displayName}
                                </span>
                                <span className="custom-message-time">
                                  {messageTime}
                                </span>
                              </div>
                            ) : null}
                            <div className="custom-attachment-card custom-attachment-card-image">
                              <video
                                src={attachment.url}
                                controls
                                className="custom-attachment-image"
                              />
                            </div>
                          </div>
                        )}
                        renderFile={(attachment: Attachment) => (
                          <div className="custom-attachment-wrap">
                            {shouldShowMeta ? (
                              <div className="custom-message-meta custom-message-meta-attachment">
                                <span
                                  className="custom-message-author"
                                  style={{
                                    color: group.sender.color || '#f2f3f5',
                                  }}
                                >
                                  {displayName}
                                </span>
                                <span className="custom-message-time">
                                  {messageTime}
                                </span>
                              </div>
                            ) : null}
                            <a
                              href={attachment.url}
                              download={attachment.name}
                              className="custom-attachment-card custom-attachment-file"
                            >
                              <span className="custom-attachment-file-name">
                                {attachment.name}
                              </span>
                              <span className="custom-attachment-file-meta">
                                {attachment.size
                                  ? `${(attachment.size / 1024).toFixed(1)} KB`
                                  : 'File'}
                              </span>
                            </a>
                          </div>
                        )}
                        renderAudio={(attachment: Attachment) => (
                          <div className="custom-attachment-wrap">
                            {shouldShowMeta ? (
                              <div className="custom-message-meta custom-message-meta-attachment">
                                <span
                                  className="custom-message-author"
                                  style={{
                                    color: group.sender.color || '#f2f3f5',
                                  }}
                                >
                                  {displayName}
                                </span>
                                <span className="custom-message-time">
                                  {messageTime}
                                </span>
                              </div>
                            ) : null}
                            <div className="custom-attachment-card custom-attachment-file">
                              <audio
                                src={attachment.url}
                                controls
                                className="w-full"
                              />
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
              const messageTime = new Date(
                message.timestamp
              ).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: false,
              });
              const useWideLayout = shouldUseWideMessageLayout(message);

              return (
                <div
                  key={message.id}
                  className={`wa-bubble-shell ${isOutgoing ? 'wa-bubble-shell-outgoing' : 'wa-bubble-shell-incoming'} ${useWideLayout ? 'wa-bubble-shell-wide' : ''}`}
                >
                  <MessageBubble
                    message={message}
                    className={`wa-message-bubble ${isOutgoing ? 'wa-message-bubble-outgoing' : 'wa-message-bubble-incoming'} ${useWideLayout ? 'wa-message-bubble-wide' : ''}`}
                    isEditing={editingMessageId === message.id}
                    editingValue={
                      editingMessageId === message.id
                        ? editingValue
                        : message.content
                    }
                    editingTimestamp={
                      editingMessageId === message.id
                        ? editingTimestamp
                        : toDateTimeLocalValue(message.timestamp)
                    }
                    editingAvatarUrl={
                      editingMessageId === message.id
                        ? editingAvatarUrl
                        : message.avatarUrl
                    }
                    editingAuthorName={
                      editingMessageId === message.id
                        ? editingAuthorName
                        : message.authorName
                    }
                    onEditingValueChange={setEditingValue}
                    onEditingTimestampChange={setEditingTimestamp}
                    onEditingAvatarChange={handleEditingAvatarChange}
                    onEditingAvatarClear={handleEditingAvatarClear}
                    onEdit={
                      message.isSystemMessage
                        ? undefined
                        : () => handleStartEdit(message)
                    }
                    onDelete={
                      message.isSystemMessage
                        ? undefined
                        : () => handleDeleteMessage(message.id)
                    }
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
                          <p className="text-sm break-words whitespace-pre-wrap">
                            {content}
                          </p>
                          <span className="wa-message-meta">
                            <span className="wa-message-time">
                              {messageTime}
                            </span>
                            {isOutgoing && (
                              <span
                                className={`wa-message-status ${
                                  (message.metadata?.deliveryStatus as
                                    | string
                                    | undefined) === 'read'
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
                            {!isOutgoing &&
                            messageIndex === 0 &&
                            !message.content.trim() ? (
                              <p
                                className="wa-inline-author wa-inline-author-attachment"
                                style={{
                                  color: group.sender.color || '#128c7e',
                                }}
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
                                <span className="wa-message-time">
                                  {messageTime}
                                </span>
                                {isOutgoing ? (
                                  <span
                                    className={`wa-message-status ${
                                      (message.metadata?.deliveryStatus as
                                        | string
                                        | undefined) === 'read'
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
                            {!isOutgoing &&
                            messageIndex === 0 &&
                            !message.content.trim() ? (
                              <p
                                className="wa-inline-author wa-inline-author-attachment"
                                style={{
                                  color: group.sender.color || '#128c7e',
                                }}
                              >
                                {displayName}
                              </p>
                            ) : null}
                            <div className="wa-attachment-card wa-attachment-card-image">
                              <video
                                src={attachment.url}
                                controls
                                className="wa-attachment-image"
                              />
                              <span className="wa-attachment-meta">
                                <span className="wa-message-time">
                                  {messageTime}
                                </span>
                                {isOutgoing ? (
                                  <span
                                    className={`wa-message-status ${
                                      (message.metadata?.deliveryStatus as
                                        | string
                                        | undefined) === 'read'
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
                            {!isOutgoing &&
                            messageIndex === 0 &&
                            !message.content.trim() ? (
                              <p
                                className="wa-inline-author wa-inline-author-attachment"
                                style={{
                                  color: group.sender.color || '#128c7e',
                                }}
                              >
                                {displayName}
                              </p>
                            ) : null}
                            <a
                              href={attachment.url}
                              download={attachment.name}
                              className="wa-attachment-card wa-attachment-file"
                            >
                              <span className="wa-attachment-file-name">
                                {attachment.name}
                              </span>
                              <span className="wa-attachment-file-meta">
                                {attachment.size
                                  ? `${(attachment.size / 1024).toFixed(1)} KB`
                                  : 'File'}
                              </span>
                              <span className="wa-attachment-meta">
                                <span className="wa-message-time">
                                  {messageTime}
                                </span>
                                {isOutgoing ? (
                                  <span
                                    className={`wa-message-status ${
                                      (message.metadata?.deliveryStatus as
                                        | string
                                        | undefined) === 'read'
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
                            {!isOutgoing &&
                            messageIndex === 0 &&
                            !message.content.trim() ? (
                              <p
                                className="wa-inline-author wa-inline-author-attachment"
                                style={{
                                  color: group.sender.color || '#128c7e',
                                }}
                              >
                                {displayName}
                              </p>
                            ) : null}
                            <div className="wa-attachment-card wa-attachment-file">
                              <audio
                                src={attachment.url}
                                controls
                                className="w-full"
                              />
                              <span className="wa-attachment-meta">
                                <span className="wa-message-time">
                                  {messageTime}
                                </span>
                                {isOutgoing ? (
                                  <span
                                    className={`wa-message-status ${
                                      (message.metadata?.deliveryStatus as
                                        | string
                                        | undefined) === 'read'
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
    const groupUsesWideLayout = group.messages.some(shouldUseWideMessageLayout);
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
      <div
        className={`ds-message-group flex gap-3 px-4 py-0.5 transition-colors ${isOutgoing ? 'ds-message-group-outgoing' : 'ds-message-group-incoming'}`}
        key={index}
      >
        {!isOutgoing ? (
          <div className="w-10 flex-shrink-0 pt-0.5">
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

        <div
          className={`min-w-0 flex-1 ${isOutgoing ? 'ds-message-group-body-outgoing' : ''}`}
        >
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
              <span
                className="rounded bg-[#5865f2] px-1 py-px text-[0.625rem] leading-tight font-medium text-white"
                data-export-discord-role="true"
              >
                {group.sender.role}
              </span>
            )}
            <span
              className="ds-sender-timestamp"
              data-export-discord-timestamp="true"
            >
              {timeStr}
            </span>
          </div>

          {group.messages.map((message, messageIndex) => (
            <MessageBubble
              key={message.id}
              message={message}
              className={`${isOutgoing ? 'ds-message-bubble-outgoing' : ''} ${groupUsesWideLayout ? 'ds-message-bubble-wide' : ''}`.trim()}
              isStacked={messageIndex > 0}
              isEditing={editingMessageId === message.id}
              editingValue={
                editingMessageId === message.id ? editingValue : message.content
              }
              editingTimestamp={
                editingMessageId === message.id
                  ? editingTimestamp
                  : toDateTimeLocalValue(message.timestamp)
              }
              editingAvatarUrl={
                editingMessageId === message.id
                  ? editingAvatarUrl
                  : message.avatarUrl
              }
              editingAuthorName={
                editingMessageId === message.id
                  ? editingAuthorName
                  : message.authorName
              }
              onEditingValueChange={setEditingValue}
              onEditingTimestampChange={setEditingTimestamp}
              onEditingAvatarChange={handleEditingAvatarChange}
              onEditingAvatarClear={handleEditingAvatarClear}
              onEdit={
                message.isSystemMessage
                  ? undefined
                  : () => handleStartEdit(message)
              }
              onDelete={
                message.isSystemMessage
                  ? undefined
                  : () => handleDeleteMessage(message.id)
              }
              onEditSave={handleSaveEdit}
              onEditCancel={handleCancelEdit}
              renderAttachments={(attachments) => (
                <AttachmentArea attachments={attachments} />
              )}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderSystemMessage = (group: MessageGroup) =>
    (() => {
      const label =
        activeSkin === 'whatsapp'
          ? formatWhatsAppDateLabel(group.messages[0].timestamp)
          : activeSkin === 'telegram'
            ? formatTelegramDateLabel(group.messages[0].timestamp)
            : activeSkin === 'custom'
              ? ''
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
    })();

  const activeIdentityPanel = (
    <div>
      <div
        className="ds-identity-panel rounded-[28px] border border-white/10 p-3 shadow-none"
        style={settingsSurfaceStyle}
      >
        <div className="mb-3 grid gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium tracking-[0.12em] text-[#949ba4] uppercase">
              {uiText.people}
            </span>
            <select
              value={
                isCustom && !selectedIdentity
                  ? ''
                  : (selectedIdentity?.id ?? CURRENT_SPEAKER_ID)
              }
              onChange={(event) => {
                if (event.target.value === '__add_person__') {
                  handleAddIdentity();
                  return;
                }

                setSelectedIdentityId(event.target.value);
              }}
              className="ds-identity-input w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2.5 text-sm text-[#f2f3f5] transition outline-none focus:border-[#5865f2]"
              style={settingsInsetStyle}
            >
              {isCustom && !selectedIdentity ? (
                <option value="" disabled>
                  {uiText.selectPerson}
                </option>
              ) : null}
              <option value="__add_person__">{uiText.addPerson}</option>
              {identityOptions.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div
          className="mb-3 rounded-[24px] border border-white/8 p-3"
          style={settingsInsetStyle}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => currentAvatarInputRef.current?.click()}
              disabled={!selectedIdentity}
              className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/12 bg-black/10 text-[#b5bac1] transition hover:border-[#5865f2] hover:text-white"
              aria-label={uiText.uploadAvatar}
            >
              {selectedIdentity?.avatar ? (
                <img
                  src={selectedIdentity.avatar}
                  alt={selectedIdentity.name || uiText.defaultSpeakerName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <UserRound className="h-5 w-5" />
              )}
            </button>
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-[0.12em] text-[#949ba4] uppercase">
                {uiText.activeIdentity}
              </p>
              <p className="mt-1 text-sm leading-6 text-[#dbdee1]">
                {selectedIdentity
                  ? uiText.activeIdentityHint
                  : uiText.activeIdentityEmpty}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
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
              disabled={!selectedIdentity}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-[#f2f3f5] transition hover:border-[#5865f2] hover:bg-white/5"
            >
              <ImagePlus className="h-4 w-4" />
              {uiText.uploadAvatar}
            </button>
            {selectedIdentity?.avatar ? (
              <button
                type="button"
                onClick={handleClearCurrentAvatar}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-[#d1d5db] transition hover:border-[#ef4444] hover:bg-[#ef4444]/10 hover:text-white"
              >
                <X className="h-4 w-4" />
                {uiText.removeAvatar}
              </button>
            ) : null}
            {!selectedIdentity && isCustom ? (
              <button
                type="button"
                onClick={handleAddIdentity}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#5865f2]/60 bg-[#5865f2]/12 px-4 py-2 text-sm font-medium text-white transition hover:border-[#5865f2] hover:bg-[#5865f2]/22"
              >
                <Plus className="h-4 w-4" />
                {uiText.addFirstPerson}
              </button>
            ) : null}
          </div>
        </div>

        {selectedIdentity ? (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium tracking-[0.12em] text-[#949ba4] uppercase">
                  {uiText.speakerName}
                </span>
                <input
                  type="text"
                  value={selectedIdentity.name}
                  onChange={(event) =>
                    handleIdentityNameChange(event.target.value)
                  }
                  placeholder={uiText.defaultSpeakerName}
                  className="ds-identity-input h-[46px] w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-[#f2f3f5] transition outline-none placeholder:text-[#8e9297] focus:border-[#5865f2]"
                  style={{
                    ...settingsInsetStyle,
                    color: '#f2f3f5',
                    WebkitTextFillColor: '#f2f3f5',
                  }}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium tracking-[0.12em] text-[#949ba4] uppercase">
                  {uiText.speakerColor}
                </span>
                <div
                  className="flex h-[46px] items-center gap-3 rounded-2xl border border-white/10 bg-transparent px-3 py-2"
                  style={settingsInsetStyle}
                >
                  <input
                    type="color"
                    value={normalizeSpeakerColor(selectedIdentity.color)}
                    onChange={(event) =>
                      handleIdentityColorChange(event.target.value)
                    }
                    className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
                  />
                  <span className="min-w-0 truncate font-mono text-sm text-[#f2f3f5]">
                    {normalizeSpeakerColor(selectedIdentity.color)}
                  </span>
                  <span
                    className="ml-auto h-4 w-4 shrink-0 rounded-full border border-white/15"
                    style={{
                      backgroundColor: normalizeSpeakerColor(
                        selectedIdentity.color
                      ),
                    }}
                  />
                </div>
              </label>
            </div>

            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-medium tracking-[0.12em] text-[#949ba4] uppercase">
                {uiText.messageSide}
              </span>
              <select
                value={selectedIdentity.defaultSide ?? DEFAULT_MESSAGE_SIDE}
                onChange={(event) =>
                  handleIdentitySideChange(event.target.value as MessageSide)
                }
                className="ds-identity-input w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2.5 text-sm text-[#f2f3f5] transition outline-none focus:border-[#5865f2]"
                style={settingsInsetStyle}
              >
                <option value="right">{uiText.rightSide}</option>
                <option value="left">{uiText.leftSide}</option>
              </select>
            </label>
          </>
        ) : null}
      </div>
    </div>
  );

  const settingsPanel =
    !isExportingImage && isSettingsVisible ? (
      <aside
        className="ds-settings-sidebar w-full xl:max-w-[396px] xl:min-w-[352px]"
        data-export-hide="true"
      >
        <div className="ds-settings-panel grid gap-3 xl:max-h-[820px] xl:content-start xl:overflow-y-auto xl:pr-1">
          {!isCustom ? (
            <section
              className="ds-settings-card rounded-[28px] border border-white/10 p-4 shadow-none"
              style={settingsSurfaceStyle}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-[0.14em] text-[#949ba4] uppercase">
                    {settingsCopy.channelTitle}
                  </p>
                  <p className="mt-1 text-sm text-[#c4c9ce]">
                    {settingsCopy.channelDescription}
                  </p>
                </div>
                <div
                  className="flex aspect-square h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-transparent text-[#dbdee1]"
                  style={settingsInsetStyle}
                >
                  {resolvedChannel.icon ? (
                    <img
                      src={resolvedChannel.icon}
                      alt={resolvedChannel.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <Hash className="h-5 w-5" />
                  )}
                </div>
              </div>

              <div className="grid gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium tracking-[0.12em] text-[#949ba4] uppercase">
                    {settingsCopy.channelNameLabel}
                  </span>
                  <input
                    type="text"
                    value={resolvedChannel.name}
                    onChange={(event) =>
                      handleChannelFieldChange('name', event.target.value)
                    }
                    className="ds-identity-input w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2.5 text-sm text-[#f2f3f5] transition outline-none placeholder:text-[#8e9297] focus:border-[#5865f2]"
                    placeholder="general"
                    style={settingsInsetStyle}
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium tracking-[0.12em] text-[#949ba4] uppercase">
                    {settingsCopy.channelDescriptionLabel}
                  </span>
                  <textarea
                    value={resolvedChannel.description || ''}
                    onChange={(event) =>
                      handleChannelFieldChange(
                        'description',
                        event.target.value
                      )
                    }
                    rows={3}
                    className="ds-identity-input w-full resize-none rounded-2xl border border-white/10 bg-transparent px-3 py-2.5 text-sm text-[#f2f3f5] transition outline-none placeholder:text-[#8e9297] focus:border-[#5865f2]"
                    placeholder={settingsCopy.channelDescriptionPlaceholder}
                    style={settingsInsetStyle}
                  />
                </label>

                <div>
                  <span className="mb-1 block text-xs font-medium tracking-[0.12em] text-[#949ba4] uppercase">
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
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-[#dbdee1] transition hover:border-[#5865f2] hover:bg-white/5"
                    >
                      <ImagePlus className="h-4 w-4" />
                      {settingsCopy.channelAvatarButton}
                    </button>
                    {resolvedChannel.icon ? (
                      <button
                        type="button"
                        onClick={handleClearChannelAvatar}
                        className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-[#b5bac1] transition hover:bg-white/5 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                        {uiText.remove}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {activeIdentityPanel}

          <section
            className="ds-settings-card rounded-[28px] border border-white/10 p-4 shadow-none"
            style={settingsSurfaceStyle}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.14em] text-[#949ba4] uppercase">
                  {uiText.environmentSettings}
                </p>
                <p className="mt-1 text-sm text-[#c4c9ce]">
                  {settingsCopy.environmentDescription}
                </p>
              </div>
              <div
                className="aspect-square h-12 w-12 shrink-0 rounded-full border border-white/10"
                style={{
                  backgroundColor,
                  backgroundImage: backgroundImageUrl
                    ? `url(${backgroundImageUrl})`
                    : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            </div>

            <div className="grid gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium tracking-[0.12em] text-[#949ba4] uppercase">
                  {uiText.backgroundColor}
                </span>
                <div
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-transparent px-3 py-2.5"
                  style={settingsInsetStyle}
                >
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
                    onClick={() =>
                      setBackgroundColor(getPlatformBackgroundColor(activeSkin))
                    }
                    className="ml-auto rounded-full px-2 py-1 text-xs font-medium text-[#949ba4] transition hover:bg-white/5 hover:text-white"
                  >
                    {uiText.reset}
                  </button>
                </div>
              </label>

              <div>
                <span className="mb-1 block text-xs font-medium tracking-[0.12em] text-[#949ba4] uppercase">
                  {uiText.backgroundImage}
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
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-[#dbdee1] transition hover:border-[#5865f2] hover:bg-white/5"
                  >
                    <ImagePlus className="h-4 w-4" />
                    {uiText.uploadBackground}
                  </button>
                  {backgroundImageUrl ? (
                    <button
                      type="button"
                      onClick={handleClearBackgroundImage}
                      className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-[#b5bac1] transition hover:bg-white/5 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                      {uiText.remove}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/8 bg-transparent p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[#949ba4] uppercase">
                  <Palette className="h-3.5 w-3.5" />
                  {uiText.livePreview}
                </div>
                <div
                  className="h-24 rounded-[22px] border border-white/10"
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
        </div>
      </aside>
    ) : null;

  return (
    <div
      className={`tool-root-chat-simulator skin-theme-${activeSkin} flex w-full flex-col`}
    >
      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      ) : null}
      {isExportDialogOpen ? (
        <LazyExportDialog
          open={isExportDialogOpen}
          onOpenChange={setIsExportDialogOpen}
          uiText={{
            exportChatImage: uiText.exportChatImage,
            exportDialogDescription: uiText.exportDialogDescription,
            fileFormat: uiText.fileFormat,
          exportMode: uiText.exportMode,
          exportRatio: uiText.exportRatio,
          exportQuality: uiText.exportQuality,
          exportContent: uiText.exportContent,
          exportOverflow: uiText.exportOverflow,
          exportSummary: uiText.exportSummary,
          cancel: uiText.cancel,
          export: uiText.export,
            phoneViewport: uiText.phoneViewport,
            currentWebViewport: uiText.currentWebViewport,
          }}
          settingsInsetStyle={settingsInsetStyle}
          exportFileFormat={exportFileFormat}
          setExportFileFormat={setExportFileFormat}
          exportLayoutPreset={exportLayoutPreset}
          setExportLayoutPreset={setExportLayoutPreset}
          exportAspectRatioPreset={exportAspectRatioPreset}
          setExportAspectRatioPreset={setExportAspectRatioPreset}
          exportQualityPreset={exportQualityPreset}
          setExportQualityPreset={setExportQualityPreset}
          exportContentPreset={exportContentPreset}
          setExportContentPreset={setExportContentPreset}
          exportOverflowMode={exportOverflowMode}
          setExportOverflowMode={setExportOverflowMode}
          exportLayoutOptions={exportLayoutOptions}
          exportAspectRatioOptions={exportAspectRatioOptions}
          exportQualityOptions={exportQualityOptions}
          exportContentOptions={exportContentOptions}
          exportOverflowOptions={exportOverflowOptions}
          exportLayout={exportLayout}
          exportQuality={exportQuality}
          isExportingImage={isExportingImage}
          onStartExport={handleStartExport}
        />
      ) : null}
      <div
        className="ds-control-toolbar mb-3 flex flex-wrap items-center gap-2"
        data-export-hide="true"
      >
        <div ref={platformMenuRef} className="ds-platform-menu relative">
          <button
            type="button"
            onClick={() => setIsPlatformMenuOpen((current) => !current)}
            aria-haspopup="listbox"
            aria-expanded={isPlatformMenuOpen}
            className="ds-platform-trigger ds-control-button inline-flex items-center justify-between gap-2 rounded-xl px-3 py-1.5 text-sm font-medium text-white transition"
          >
            <span className="truncate">
              {isCustom
                ? uiText.platformButton
                : PLATFORM_LABELS[activeSkin] || activeSkin}
            </span>
            <ChevronDown
              className={`ds-platform-trigger-icon h-4 w-4 transition ${isPlatformMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isPlatformMenuOpen ? (
            <div
              className="ds-platform-menu-content absolute top-full left-0 z-50 mt-2 min-w-[148px] overflow-hidden rounded-xl border backdrop-blur-sm"
              role="listbox"
              aria-label={uiText.choosePlatform}
            >
              {platformMenuSkins.map((skin) => {
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
                    {isActive ? (
                      <Check className="ds-platform-menu-check h-4 w-4" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {supportedSkins.includes('custom') ? (
          <button
            type="button"
            onClick={() => handlePlatformChange('custom')}
            aria-pressed={isCustom}
            className={`ds-control-button inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium text-white transition ${isCustom ? 'ring-2 ring-white/35' : ''}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {uiText.custom}
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => void handleTogglePlayback()}
          disabled={isExportingImage}
          className="ds-control-button inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPlaying ? (
            <Square className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {isPlaying ? uiText.stop : uiText.playChat}
        </button>

        <button
          type="button"
          onClick={() => setIsExportDialogOpen(true)}
          disabled={isExportingImage}
          className="ds-control-button inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExportingImage ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {uiText.export}
        </button>

        <button
          type="button"
          onClick={handleCreateNewChat}
          disabled={isExportingImage}
          className="ds-control-button inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {uiText.newChat}
        </button>

        <button
          type="button"
          onClick={() => setIsSettingsVisible((current) => !current)}
          disabled={isExportingImage}
          className="ds-control-button inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {isSettingsVisible ? uiText.hideSettings : uiText.showSettings}
        </button>
      </div>

      <div className="flex min-h-0 flex-col gap-3 xl:flex-row xl:items-start">
        <div className="flex min-h-0 flex-1 xl:min-w-0">
          <div
            ref={captureRef}
            className="discord-chat-container flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-[28px] xl:h-full xl:min-w-0"
            style={previewViewportStyle}
            data-export-capture-root="true"
          >
            {!isCustom ? (
              <div
                className="ds-tool-header gap-3"
                data-export-header="true"
                data-export-platform={activeSkin}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {isWhatsApp ? (
                    <span className="wa-header-back">‹</span>
                  ) : null}
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
                  <div
                    className={`min-w-0 ${isTelegram ? 'tg-header-copy' : ''}`}
                    data-export-header-copy="true"
                  >
                    {activeSkin === 'discord' ? (
                      <div
                        className="flex min-w-0 items-center gap-3 text-sm"
                        data-export-discord-header-row="true"
                      >
                        <span
                          className="shrink-0 text-[1.05rem] font-bold text-[#f2f3f5]"
                          data-export-header-title="true"
                        >
                          <span className="ds-tool-header-hash mr-1 text-xl font-medium text-[#949ba4]">
                            #
                          </span>
                          {channelSlug}
                        </span>
                        <span className="shrink-0 text-[1.7rem] leading-none font-black text-[#7b7d86]">
                          &middot;
                        </span>
                        <span
                          className="min-w-0 flex-1 truncate pt-px text-xs font-normal text-[#949ba4]"
                          data-export-header-subtitle="true"
                        >
                          {resolvedChannel.description ||
                            uiText.discordHeaderFallback}
                        </span>
                      </div>
                    ) : (
                      <>
                        <span
                          className={`block truncate ${isTelegram ? 'tg-header-title' : ''}`}
                          data-export-header-title="true"
                        >
                          {resolvedChannel.name}
                        </span>
                        <span
                          className={`block truncate text-xs font-normal ${isTelegram ? 'tg-header-subtitle' : 'text-[#949ba4]'}`}
                          data-export-header-subtitle="true"
                        >
                          {isWhatsApp
                            ? resolvedChannel.description ||
                              uiText.whatsappHeaderFallback
                            : resolvedChannel.description ||
                              `${participantCount}${uiText.telegramMembersSuffix}`}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {isWhatsApp ? (
                  <div className="wa-header-actions">
                    <button
                      type="button"
                      className="wa-header-icon-button"
                      aria-label="Start video call"
                    >
                      <Video className="wa-header-action-icon" />
                    </button>
                    <button
                      type="button"
                      className="wa-header-icon-button"
                      aria-label="Start phone call"
                    >
                      <Phone className="wa-header-action-icon" />
                    </button>
                    <button
                      type="button"
                      className="wa-header-icon-button"
                      aria-label="More options"
                    >
                      <MoreVertical className="wa-header-action-icon" />
                    </button>
                  </div>
                ) : isTelegram ? (
                  <div className="tg-header-actions">
                    <button
                      type="button"
                      className="tg-header-icon-button"
                      aria-label="Search"
                    >
                      <Search className="tg-header-action-icon" />
                    </button>
                    <button
                      type="button"
                      className="tg-header-icon-button"
                      aria-label="View options"
                    >
                      <Columns2 className="tg-header-action-icon" />
                    </button>
                    <button
                      type="button"
                      className="tg-header-icon-button"
                      aria-label="More options"
                    >
                      <MoreVertical className="tg-header-action-icon" />
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            <ChatContainer
              messageGroups={displayedMessageGroups}
              className="flex-1"
              messageListClassName={isCustom ? 'pb-4 pt-4' : 'pb-6'}
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
                    ref={imageAttachmentInputRef}
                    type="file"
                    accept="image/*"
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
                      placeholder={uiText.telegramPlaceholder}
                      onSend={handleSend}
                      disabled={isPlaying || isExportingImage}
                      onAttachFile={() => attachmentInputRef.current?.click()}
                    />
                  ) : activeSkin === 'discord' ? (
                    <DiscordInputBar
                      placeholder={`${uiText.discordPlaceholderPrefix}${channelSlug}${uiText.discordPlaceholderSuffix}`}
                      onSend={handleSend}
                      disabled={isPlaying || isExportingImage}
                      onUploadImages={() =>
                        imageAttachmentInputRef.current?.click()
                      }
                      onUploadFiles={() => attachmentInputRef.current?.click()}
                    />
                  ) : isCustom ? (
                    <InputBar
                      placeholder={uiText.messagePlaceholder}
                      onSend={handleSend}
                      disabled={isPlaying || isExportingImage}
                      renderSuffix={() => (
                        <div className="custom-input-actions">
                          <button
                            type="button"
                            className="custom-input-icon-button"
                            aria-label="Attach file"
                            onClick={() => attachmentInputRef.current?.click()}
                          >
                            <Paperclip className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="custom-input-icon-button"
                            aria-label="Upload image"
                            onClick={() =>
                              imageAttachmentInputRef.current?.click()
                            }
                          >
                            <ImagePlus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    />
                  ) : (
                    <InputBar
                      placeholder={
                        isWhatsApp
                          ? uiText.messagePlaceholder
                          : `${uiText.discordPlaceholderPrefix}${channelSlug}${uiText.discordPlaceholderSuffix}`
                      }
                      onSend={handleSend}
                      disabled={isPlaying || isExportingImage}
                      shellClassName={isWhatsApp ? 'wa-input-shell' : ''}
                      renderPrefix={
                        isWhatsApp
                          ? () => (
                              <div className="wa-input-prefix-set">
                                <button
                                  type="button"
                                  className="wa-input-icon-button"
                                  aria-label="Emoji"
                                >
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
                                  onClick={() =>
                                    attachmentInputRef.current?.click()
                                  }
                                >
                                  <Paperclip className="h-5 w-5" />
                                </button>
                                <button
                                  type="button"
                                  className="wa-input-icon-button"
                                  aria-label="Open camera"
                                  onClick={() =>
                                    cameraInputRef.current?.click()
                                  }
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
                              <button
                                type="button"
                                className="wa-mic-button"
                                aria-label="Record voice message"
                              >
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
        </div>

        {settingsPanel}
      </div>
    </div>
  );
}
