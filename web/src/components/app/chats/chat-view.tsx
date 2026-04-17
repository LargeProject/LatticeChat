import { useCallback, useEffect, useMemo, useState } from 'react';
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

      if ((result as any).success === false && !(result as any).queued) {
        setPendingMessages((msgs) => msgs.filter((m) => m.id !== tempId));
        alert('Failed to send message.');
        return;
      }

      // Keep optimistic message briefly to avoid visual gaps before server message lands.
      window.setTimeout(() => {
        setPendingMessages((msgs) => msgs.filter((m) => m.id !== tempId));
      }, 1800);
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

  const allMessages = useMemo(() => {
    if (pendingMessages.length === 0) return messages;

    // Hide optimistic messages once a matching real message appears.
    const recentRealMessages = messages.slice(-80);
    const unresolvedPending = pendingMessages.filter((pending) => {
      return !recentRealMessages.some(
        (real) => real.senderId === pending.senderId && real.content === pending.content,
      );
    });

    return [...messages, ...unresolvedPending];
  }, [messages, pendingMessages]);

  return (
    <section className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-black relative" aria-label={`Conversation with ${name}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100/50 via-white to-white dark:from-zinc-900/20 dark:via-black dark:to-black opacity-60" />
      
      <header className="z-10 border-b border-zinc-200/80 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xl px-4 py-3 shadow-sm relative">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setConvoId('')}
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700"
              aria-label="Back to chat list"
              title="Back"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-wide">{name}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="truncate text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Connected</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!conversation.isDirectMessage && (
              <button
                type="button"
                onClick={handleRename}
                className="inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-mono text-zinc-600 dark:text-zinc-400 transition-colors border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700"
                aria-label="Rename conversation"
                title="Rename conversation"
              >
                Rename
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsAddMembersOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-600 dark:text-zinc-400 transition-colors border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 hover:text-cyan-600 dark:hover:text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700"
              aria-label="Add members"
              title="Add members"
            >
              <UserPlus size={15} />
            </button>

            <button
              type="button"
              onClick={handleLeave}
              className="inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-mono text-rose-600/80 dark:text-rose-500/80 transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50"
              aria-label="Leave conversation"
              title="Leave conversation"
            >
              Leave
            </button>
          </div>
        </div>
      </header>

      <MessageList messages={allMessages} currentUserId={userInfo.data?.id || ''} members={membersState} />

      <div className="z-10 p-3 md:p-6 w-full max-w-5xl mx-auto drop-shadow-2xl">
        <div className="rounded-2xl bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/60 shadow-lg p-1">
          <ChatInput onSend={handleSend} />
        </div>
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
