import type actions from '@latticechat/shared';
import auth from './auth';

export async function validateWSHandshake(data: actions.InitHandshake) {
  const session = await auth.api.getSession({
    headers: {
      Authorization: `Bearer ${data.jwt}`,
    },
  });

  if (session) {
    return true;
  } else {
    return false;
  }
}
