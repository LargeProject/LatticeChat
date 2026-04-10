import { model } from 'mongoose';
import { userSchema } from './schemas/User';
import { conversationSchema, messageSchema } from './schemas/Conversation';
import { friendRequestSchema } from './schemas/FriendRequest';
import { accountSchema } from './schemas/Account';
import { keyExchangeRequestSchema } from './schemas/KeyExchangeRequest';

export const User = model('User', userSchema);
export const FriendRequest = model('FriendRequest', friendRequestSchema);
export const Message = model('Message', messageSchema);
export const Conversation = model('Conversation', conversationSchema);
export const Account = model('Account', accountSchema);
export const KeyExchangeRequest = model('KeyExchangeRequest', keyExchangeRequestSchema);
