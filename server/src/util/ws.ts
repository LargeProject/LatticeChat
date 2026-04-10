import type actions from '@latticechat/shared';
import auth from './auth';
import type { WebsocketContext } from '../lib/websocket/types';
import { WebsocketError } from '../lib/websocket/types';

export async function validateWSHandshake(
  data: actions.InitHandshake,
  context: WebsocketContext
): Promise<string> {
  if (!data.jwt) {
    throw new WebsocketError('Missing JWT token', 'AUTH_MISSING_TOKEN', 401);
  }

  try {
    const session = await auth.api.getSession({
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    });

    if (!session?.user?.id) {
      throw new WebsocketError('Invalid or expired token', 'AUTH_INVALID_TOKEN', 401);
    }

    return session.user.id;
  } catch (error) {
    if (error instanceof WebsocketError) {
      throw error;
    }
    console.error('Auth error:', error);
    throw new WebsocketError('Authentication failed', 'AUTH_FAILED', 500);
  }
}
