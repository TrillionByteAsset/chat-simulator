'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { UIMessage } from 'ai';

import { ChatBox } from '@/shared/blocks/chat/box';
import { Loader } from '@/shared/components/ai-elements/loader';
import { Chat } from '@/shared/types/chat';

type ApiResponse<T> = {
  code: number;
  message?: string;
  data?: T;
};

type ChatInfoResponse = {
  id: string;
  title?: string | null;
  createdAt?: string | null;
  model?: string | null;
  provider?: string | null;
  parts?: string | null;
  metadata?: string | null;
  content?: string | null;
};

type ChatMessageItem = {
  id: string;
  role: UIMessage['role'];
  parts?: string | null;
  metadata?: string | null;
};

type ChatMessagesResponse = {
  list: ChatMessageItem[];
};

export default function ChatPage() {
  const params = useParams();

  const [initialChat, setInitialChat] = useState<Chat | null>(null);
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(
    null
  );

  const fetchChat = async (chatId: string) => {
    try {
      const resp = await fetch('/api/chat/info', {
        method: 'POST',
        body: JSON.stringify({ chatId }),
      });
      if (!resp.ok) {
        throw new Error(`request failed with status: ${resp.status}`);
      }
      const json = (await resp.json()) as ApiResponse<ChatInfoResponse>;
      if (json.code !== 0 || !json.data) {
        throw new Error(json.message || 'fetch chat failed');
      }
      const { data } = json;

      setInitialChat({
        id: data.id,
        title: data.title ?? '',
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        model: data.model ?? '',
        provider: data.provider ?? '',
        parts: data.parts ? JSON.parse(data.parts) : [],
        metadata: data.metadata ? JSON.parse(data.metadata) : undefined,
        content: data.content ? JSON.parse(data.content) : undefined,
      });

      if (data.id) {
        fetchMessages(data.id);
      }
    } catch (e: any) {
      console.log('fetch chat failed:', e);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const resp = await fetch('/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ chatId, page: 1, limit: 100 }),
      });
      if (!resp.ok) {
        throw new Error(`request failed with status: ${resp.status}`);
      }
      const json = (await resp.json()) as ApiResponse<ChatMessagesResponse>;
      if (json.code !== 0 || !json.data) {
        throw new Error(json.message || 'fetch messages failed');
      }
      const { data } = json;

      const { list } = data;
      setInitialMessages(
        list.map((item) => ({
          id: item.id,
          role: item.role,
          parts: item.parts ? JSON.parse(item.parts) : [],
          metadata: item.metadata ? JSON.parse(item.metadata) : undefined,
        })) as UIMessage[]
      );
    } catch (e: any) {
      console.log('fetch messages failed:', e);
    }
  };

  useEffect(() => {
    fetchChat(params.id as string);
  }, [params.id]);

  return initialChat && initialMessages ? (
    <ChatBox initialChat={initialChat} initialMessages={initialMessages} />
  ) : (
    <div className="flex h-screen items-center justify-center p-8">
      <Loader />
    </div>
  );
}
