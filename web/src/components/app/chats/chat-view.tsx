import { useCallback, useMemo, useState } from 'react';
import { Info, UserPlus } from 'lucide-react';
import { MessageList } from './messages';
import { ChatInput } from './chat-input';
import { AddMembersModal } from './add-members-modal';
import { useWebsocket } from '#/lib/hooks/useWebsocket';
import { useWebsocketListener } from '#/lib/hooks/useWebsocketListener';
import { type Message } from '#/lib/api/conversation.ts';
import { useUser } from '#/lib/context/UserContext.tsx';
import { useConversation } from '#/components/hooks/useConversation';
import type * as contracts from '@latticechat/shared';

type ChatViewProps = {
  conversationId: string;
  onTogglePanel: () => void;
};

export function ChatView({ conversationId, onTogglePanel }: ChatViewProps) {
  const { conversations } = useUser();
  const { createMessage: sendMessage, isAuthenticated } = useWebsocket();
  const { userInfo } = useUser();
  const [pendingMessages, setPendingMessages] = useState<Array<Message & { optimistic: true }>>([]);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [memberCount, setMemberCount] = useState(0);

  const conversation = useMemo(() => {
    return conversations.find((c) => c.id == conversationId);
  }, [conversations]);

  // Listen for new members being added
  const handleNewMember = useCallback((data: contracts.EmitMemberAdded) => {
    if (data.conversationId === conversationId) {
      setMemberCount((prev) => prev + 1);
    }
  }, [conversationId]);

  useWebsocketListener('newMember', handleNewMember, isAuthenticated);

  if (!conversation) {
    return <>Conversation not found!</>;
  }

  const { name, messages } = useConversation(conversation);

  // Optimistic UI: merge pending messages with confirmed messages
  const allMessages = [...messages, ...pendingMessages];

  const handleSend = useCallback(async (text: string) => {
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
    const result = await sendMessage({
      conversationId: conversation.id,
      senderId: userInfo.data.id,
      content: normalized,
    });
    if (!result.success) {
      // Remove optimistic message and show error
      setPendingMessages((msgs) => msgs.filter((m) => m.id !== tempId));
      alert('Failed to send message.');
    } else {
      // Remove optimistic message (will be replaced by real one from server)
      setPendingMessages((msgs) => msgs.filter((m) => m.id !== tempId));
    }
  }, [conversation, userInfo, sendMessage]);

  const handleMemberAdded = useCallback(() => {
    setIsAddMembersOpen(false);
  }, []);

  return (
    <section
      className="flex flex-1 flex-col overflow-hidden"
      aria-label={`Conversation with ${name}`}
    >
      <header className="border-b border-(--line) bg-(--surface) px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-(--text-primary)">
              {name}
            </h2>
            <p className="truncate text-xs text-(--text-secondary)">
              End-to-end encrypted conversation
            </p>
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

            <button
              type="button"
              onClick={onTogglePanel}
              className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-(--text-secondary) transition-colors hover:bg-(--link-bg-hover) hover:text-(--text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--line)"
              aria-label="Toggle user info panel"
              aria-pressed={false}
              title="Toggle info"
            >
              <Info size={16} />
              <span className="text-xs font-medium">Info</span>
            </button>
          </div>
        </div>
      </header>

      <MessageList messages={allMessages} currentUserId={userInfo.data?.id || ''} members={conversation.members} />

      <div className="border-t border-(--line) bg-(--surface)">
        <ChatInput onSend={handleSend} />
      </div>

      <AddMembersModal
        conversationId={conversationId}
        members={conversation.members}
        isOpen={isAddMembersOpen}
        onClose={() => setIsAddMembersOpen(false)}
        onMemberAdded={handleMemberAdded}
      />
    </section>
  );
}
