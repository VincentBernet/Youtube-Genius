import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";

// Creates a new conversation with the first user message
export const createWithFirstMessage = mutation({
	args: {
		content: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		// Get the user from the database
		const user = await ctx.db
			.query("users")
			.withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
			.unique();

		if (!user) {
			throw new Error("User not found");
		}

		const now = Date.now();

		// Create a new conversation
		const conversationId = await ctx.db.insert("conversations", {
			userId: user._id,
			createdAt: now,
			updatedAt: now,
		});

		// Create the first user message
		await ctx.db.insert("messages", {
			conversationId,
			role: "user",
			content: args.content,
			createdAt: now,
		});

		return conversationId;
	},
});

// Adds a user message to an existing conversation
export const addUserMessage = mutation({
	args: {
		conversationId: v.id("conversations"),
		content: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		// Get the conversation
		const conversation = await ctx.db.get(args.conversationId);
		if (!conversation) {
			throw new Error("Conversation not found");
		}

		// Verify the user owns this conversation
		const user = await ctx.db
			.query("users")
			.withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
			.unique();

		if (!user || conversation.userId !== user._id) {
			throw new Error("Unauthorized");
		}

		const now = Date.now();

		// Add the user message
		const messageId = await ctx.db.insert("messages", {
			conversationId: args.conversationId,
			role: "user",
			content: args.content,
			createdAt: now,
		});

		// Update conversation's updatedAt timestamp
		await ctx.db.patch(args.conversationId, {
			updatedAt: now,
		});

		return messageId;
	},
});

// Internal mutation for adding assistant messages (called from backend without auth)
export const addAssistantMessage = internalMutation({
	args: {
		conversationId: v.id("conversations"),
		content: v.string(),
		metadata: v.optional(v.object({
			model: v.optional(v.string()),
			promptTokens: v.optional(v.number()),
			completionTokens: v.optional(v.number()),
			totalTokens: v.optional(v.number()),
			latencyMs: v.optional(v.number()),
			finishReason: v.optional(v.string()),
		})),
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		// Add the assistant message
		const messageId = await ctx.db.insert("messages", {
			conversationId: args.conversationId,
			role: "assistant",
			content: args.content,
			createdAt: now,
			metadata: args.metadata,
		});

		// Update conversation's updatedAt timestamp
		await ctx.db.patch(args.conversationId, {
			updatedAt: now,
		});

		return messageId;
	},
});

// Update conversation title
export const updateTitle = mutation({
	args: {
		conversationId: v.id("conversations"),
		title: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		const conversation = await ctx.db.get(args.conversationId);
		if (!conversation) {
			throw new Error("Conversation not found");
		}

		const user = await ctx.db
			.query("users")
			.withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
			.unique();

		if (!user || conversation.userId !== user._id) {
			throw new Error("Unauthorized");
		}

		await ctx.db.patch(args.conversationId, {
			title: args.title,
		});

		return args.conversationId;
	},
});
