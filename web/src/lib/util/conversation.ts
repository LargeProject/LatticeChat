import type { Conversation } from '../api/conversation';
import type { UserInfo } from '../api/user';

/**
 * Return conversation name based on member count

 * 2 members:
 *   "<otherMember.name>"
 * else:
 *   "<conversation.name>"
 */
export function getConversationName(
  user: UserInfo,
  conversation: Conversation,
) {
  if (conversation.members.length == 2) {
    const otherMember = conversation.members.find((m) => m.id != user.id);

    if (!otherMember) return '';

    return otherMember.username;
  } else {
    return conversation.name;
  }
}
