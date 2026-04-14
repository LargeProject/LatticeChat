import type { BasicUserInfo } from '@latticechat/shared';
import type { HydratedDocument, InferSchemaType, Types } from 'mongoose';
import mongoose, { Schema } from 'mongoose';
import * as models from '../models';
import { UserService } from '../services/UserService';

export const messageSchema = new Schema({
  senderId: {
    type: String,
    required: true,
  },
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  content: {
    type: String,
    required: true,
    minLength: 1,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export const conversationSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    isDirectMessage: {
      type: Boolean,
      required: true,
      default: true,
    },
    name: {
      type: String,
      required: false,
    },
    memberIds: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      validate: {
        // Ensure conversations always have atleast two members
        validator: (v: Types.ObjectId[]) => {
          return v.length >= 2;
        },
        message: 'A conversation must have at least two members',
      },
    },
  },
  {
    methods: {
      hasMember: function (memberId: string) {
        const memberObjectId = new mongoose.Types.ObjectId(memberId);
        return this.memberIds.includes(memberObjectId);
      },
      getMembers: async function (): Promise<BasicUserInfo[]> {
        const stringMemberIds = this.memberIds.map((memberId) => memberId.toString());
        const members = await UserService.getBasicUserInfosById(stringMemberIds);
        return members.map((member) => {
          return {
            id: member._id.toString(),
            name: member.name,
            biography: member.biography,
            createdAt: member.createdAt,
          };
        });
      },
    },
  },
);

type Conversation = InferSchemaType<typeof conversationSchema>;
export type ConversationDocument = HydratedDocument<Conversation> & { getMembers: () => Promise<BasicUserInfo[]> };

conversationSchema.pre('save', { document: true, query: true }, async function () {
  if (!this.isNew) return;

  await models.User.updateMany({ _id: { $in: this.memberIds } }, { $addToSet: { conversationIds: this._id } });
});

conversationSchema.pre('deleteOne', { document: true, query: false }, async function () {
  await models.User.updateMany({ conversationIds: this._id }, { $pull: { conversationIds: this._id } });
});
