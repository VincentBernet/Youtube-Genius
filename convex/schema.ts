// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { messageRoleValidator, modelValidator, promptModeValidator, userFeedbackSourceValidator } from './types';

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    pictureUrl: v.optional(v.string()),
  }).index('by_token', ['tokenIdentifier']),

  youtubeVideos: defineTable({
    videoId: v.string(),
    url: v.string(),
    title: v.optional(v.string()),
    transcript: v.string(),
    transcriptRaw: v.string(),
    createdAt: v.number(),
  }).index('by_video_id', ['videoId']),

  conversations: defineTable({
    userId: v.id('users'),
    title: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    mode: promptModeValidator,
    model: modelValidator,
    systemPrompt: v.string(),
    youtubeVideoId: v.id('youtubeVideos'),
  })
    .index('by_user', ['userId'])
    .index('by_user_updated', ['userId', 'updatedAt']),

  messages: defineTable({
    conversationId: v.id('conversations'),
    role: messageRoleValidator,
    content: v.string(),
    createdAt: v.number(),
    
    // LLM-specific metadata (optional, only for assistant messages)
    metadata: v.optional(v.object({
      model: modelValidator,
      inputTokens: v.number(),
      outputTokens: v.number(),
      totalTokens: v.number(),
      latencyMs: v.number(),
      finishReason: v.string(),
    })),
    
    // For multi-part messages (images, files, etc.)
    attachments: v.optional(v.array(v.object({
      type: v.string(),
      url: v.optional(v.string()),
      storageId: v.optional(v.id('_storage')),
      mimeType: v.optional(v.string()),
      name: v.optional(v.string()),
    }))),
  })
    .index('by_conversation', ['conversationId', 'createdAt'])
    .index('by_conversation_recent', ['conversationId']),

  userFeedback: defineTable({
    userId: v.id("users"),
    userEmail: v.optional(v.string()),
    feedback: v.string(),
    source: userFeedbackSourceValidator,
    createdAt: v.number(),
  })
    .index("by_source", ["source"])
    .index("by_user", ["userId"]),
});