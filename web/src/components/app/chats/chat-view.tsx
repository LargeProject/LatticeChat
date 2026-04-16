import { useCallback, useEffect, useState } from 'react';
import { UserPlus, ChevronLeft } from 'lucide-react';
import { MessageList } from './messages';
import { ChatInput } from './chat-input';
import { AddMembersModal } from './add-members-modal';
import { useWebsocket } from '#/lib/hooks/useWebsocket';
import type { Message } from '#/lib/api/conversation.ts';
import { useUser } from '#/lib/context/UserContext.tsx';
import { useConversation } from '#/components/hooks/useConversation';
import { useAppState } from '#/lib/context/AppStateContext';
import type * as contracts from '@latticechat/shared';

type ChatViewProps = {
  conversation: contracts.Conversation;
};

export function ChatView({ conversation }: ChatViewProps) {
  const { createMessage } = useWebsocket();
  const { userInfo } = useUser();
  const { setConvoId } = useAppState();
  const [pendingMessages, setPendingMessages] = useState<Array<Message & { optimistic: true }>>([]);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);

  useEffect(() => {
    setPendingMessages([]);
  }, [conversation.id]);

  const handleSend = useCallback(
    async (text: string) => {
      const normalized = text.trim();
      if (!normalized || !userInfo.data) return;

      const tempId = `pending-${Date.now()}`;
      const optimisticMsg = {
        id: tempId,
        senderId: userInfo.data.id,
        conversationId: conversation.id,
        content: normalized,
        createdAt: new Date(),
        optimistic: true as const,
      };
      setPendingMessages((msgs) => [...msgs, optimisticMsg]);

      const result = await createMessage({
        conversationId: conversation.id,
        senderId: userInfo.data.id,
        content: normalized,
      });

      setPendingMessages((msgs) => msgs.filter((m) => m.id !== tempId));
      if ((result as any).success === false && !(result as any).queued) {
        alert('Failed to send message.');
      }
    },
    [conversation, userInfo, createMessage],
  );

  const handleMemberAdded = useCallback(() => {
    setIsAddMembersOpen(false);
  }, []);

  const { name, messages } = useConversation(conversation);

  const allMessages = [...messages, ...pendingMessages];

  return (
    <section className="flex flex-1 flex-col overflow-hidden" aria-label={`Conversation with ${name}`}>
      <header className="border-b border-(--line) bg-(--surface) px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setConvoId('')}
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-(--text-secondary) transition-colors hover:bg-(--link-bg-hover) hover:text-(--text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--line)"
              aria-label="Back to chat list"
              title="Back"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-(--text-primary)">{name}</h2>
              <p className="truncate text-xs text-(--text-secondary)">End-to-end encrypted conversation</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsAddMembersOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-(--text-secondary) transition-colors hover:bg-(--link-bg-hover) hover:text-(--text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--line)"
              aria-label="Add members"
              title="Add members"
            >
              <UserPlus size={16} />
            </button>
          </div>
        </div>
      </header>

      <MessageList messages={allMessages} currentUserId={userInfo.data?.id || ''} members={conversation.members} />

      <div className="border-t border-(--line) bg-(--surface)">
        <ChatInput onSend={handleSend} />
      </div>

      <AddMembersModal
        conversation={conversation}
        isOpen={isAddMembersOpen}
        onClose={() => setIsAddMembersOpen(false)}
        onMemberAdded={handleMemberAdded}
      />
    </section>
  );
}