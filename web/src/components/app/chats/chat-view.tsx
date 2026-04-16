import { useCallback, useEffect, useState } from 'react';
import { UserPlus, ChevronLeft } from 'lucide-react';
import { MessageList } from './messages';
import { ChatInput } from './chat-input';
import { AddMembersModal } from './add-members-modal';
import { useWebsocket } from '#/lib/hooks/useWebsocket';
import { useWebsocketListener } from '#/lib/hooks/useWebsocketListener';
import type { Message } from '#/lib/api/conversation.ts';
import { useUser } from '#/lib/context/UserContext.tsx';
import { useConversation } from '#/components/hooks/useConversation';
import { useAppState } from '#/lib/context/AppStateContext';
import type * as contracts from '@latticechat/shared';

type ChatViewProps = {
  conversation: contracts.Conversation;
};

export function ChatView({ conversation }: ChatViewProps) {
  const { setConvoId } = useAppState();
  const { createMessage, isAuthenticated, leaveConversation, renameConversation } = useWebsocket();
  const { userInfo, refreshUser } = useUser();
  const [pendingMessages, setPendingMessages] = useState<Array<Message & { optimistic: true }>>([]);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);

  useEffect(() => {
    setPendingMessages([]);
  }, [conversation.id]);

  const [membersState, setMembersState] = useState(conversation.members);
  useEffect(() => {
    setMembersState(conversation.members);
  }, [conversation.members]);

  const onMemberLeftUI = (data: contracts.EmitMemberLeft) => {
    if (data.conversationId === conversation.id) {
      setMembersState((m) => m.filter((x) => x.id !== data.userId));
    }
  };
  useWebsocketListener('memberLeft', onMemberLeftUI, isAuthenticated, [conversation.id]);

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

  const handleLeave = useCallback(async () => {
    if (!userInfo.data) return;
    if (!confirm('Leave conversation?')) return;

    try {
      const result = await leaveConversation(conversation.id);
      if ((result as any)?.success) {
        await refreshUser();
      } else {
        alert('Failed to leave conversation');
      }
    } catch (e) {
      console.error(e);
      alert('Error leaving conversation');
    }
  }, [conversation.id, refreshUser, userInfo, leaveConversation]);

  const { name, messages } = useConversation(conversation);

  const handleRename = useCallback(async () => {
    if (!userInfo.data) return;
    if (conversation.isDirectMessage) return;

    const newName = prompt('Enter new conversation name:', name || '');
    if (!newName) return;
    const trimmed = newName.trim();
    if (!trimmed || trimmed === name) return;

    try {
      const result = await renameConversation({ conversationId: conversation.id, newName: trimmed });
      if (!(result as any)?.success) {
        alert('Failed to rename conversation');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to rename conversation');
    }
  }, [conversation.id, name, renameConversation, userInfo]);

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
            {!conversation.isDirectMessage && (
              <button
                type="button"
                onClick={handleRename}
                className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-(--text-secondary) transition-colors hover:bg-(--link-bg-hover) hover:text-(--text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--line)"
                aria-label="Rename conversation"
                title="Rename conversation"
              >
                Rename
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsAddMembersOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-(--text-secondary) transition-colors hover:bg-(--link-bg-hover) hover:text-(--text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--line)"
              aria-label="Add members"
              title="Add members"
            >
              <UserPlus size={16} />
            </button>

            <button
              type="button"
              onClick={handleLeave}
              className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-(--text-danger) transition-colors hover:bg-(--link-bg-hover) hover:text-(--text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--line)"
              aria-label="Leave conversation"
              title="Leave conversation"
            >
              Leave
            </button>
          </div>
        </div>
      </header>

      <MessageList messages={allMessages} currentUserId={userInfo.data?.id || ''} members={membersState} />

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
