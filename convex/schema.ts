// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    pictureUrl: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  conversations: defineTable({
    userId: v.id("users"),
    title: v.optional(v.string()),        // Auto-generated or user-defined title
    createdAt: v.number(),                 // When the conversation started
    updatedAt: v.number(),                 // Last activity timestamp
    model: v.optional(v.string()),         // Default model for this conversation (e.g., "gemini-2.0-flash")
    systemPrompt: v.optional(v.string()),  // Custom system prompt if any
  })
    .index("by_user", ["userId"])
    .index("by_user_updated", ["userId", "updatedAt"]), // For sorting by recent

  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),                   // The message content
    createdAt: v.number(),                 // Timestamp when sent/received
    
    // LLM-specific metadata (optional, only for assistant messages)
    metadata: v.optional(v.object({
      model: v.optional(v.string()),       // Which model generated this response
      promptTokens: v.optional(v.number()),     // Input tokens used
      completionTokens: v.optional(v.number()), // Output tokens used
      totalTokens: v.optional(v.number()),      // Total tokens
      latencyMs: v.optional(v.number()),        // Response time in ms
      finishReason: v.optional(v.string()),     // "stop", "length", "error", etc.
    })),
    
    // For multi-part messages (images, files, etc.)
    attachments: v.optional(v.array(v.object({
      type: v.string(),                    // "image", "file", "audio"
      url: v.optional(v.string()),         // Storage URL
      storageId: v.optional(v.id("_storage")), // Convex storage ID
      mimeType: v.optional(v.string()),
      name: v.optional(v.string()),
    }))),
  })
    .index("by_conversation", ["conversationId", "createdAt"]) // Get messages in order
    .index("by_conversation_recent", ["conversationId"]),       // Quick lookup
});