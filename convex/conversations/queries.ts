import { query } from "../_generated/server";
import { v } from "convex/values";

// Get all messages for a conversation
export const getMessages = query({
	args: {
		conversationId: v.id("conversations"),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		// Verify the user owns this conversation
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

		// Get all messages for this conversation, ordered by createdAt
		const messages = await ctx.db
			.query("messages")
			.withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
			.collect();

		return messages;
	},
});

// Get a single conversation by ID
export const getConversation = query({
	args: {
		conversationId: v.id("conversations"),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		const conversation = await ctx.db.get(args.conversationId);
		if (!conversation) {
			return null;
		}

		const user = await ctx.db
			.query("users")
			.withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
			.unique();

		if (!user || conversation.userId !== user._id) {
			throw new Error("Unauthorized");
		}

		return conversation;
	},
});

// Get all conversations for the current user
export const getConversations = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		const user = await ctx.db
			.query("users")
			.withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
			.unique();

		if (!user) {
			throw new Error("User not found");
		}

		// Get all conversations for this user, sorted by most recent first
		const conversations = await ctx.db
			.query("conversations")
			.withIndex("by_user_updated", (q) => q.eq("userId", user._id))
			.order("desc")
			.collect();

		return conversations;
	},
});

