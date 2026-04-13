import { MessageBubble as SharedMessageBubble } from './messages'

type MessageBubbleProps = {
  message: Message
}

/**
 * Thin wrapper that delegates rendering to the shared message bubble
 * implementation in `messages.tsx` to keep visuals and behavior consistent.
 */
export function MessageBubble({ message }: MessageBubbleProps) {
  return <SharedMessageBubble message={message} />
}