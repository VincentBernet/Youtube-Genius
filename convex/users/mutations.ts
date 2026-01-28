import { internalMutation, mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { userFeedbackSourceValidator } from "../types";

export const store = mutation({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Called storeUser without authentication");
		}

		// Check if user already exists
		const existingUser = await ctx.db
			.query("users")
			.withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
			.unique();

		if (existingUser !== null) {
			// Update existing user with latest info from OAuth provider
			if (
				existingUser.name !== identity.name ||
				existingUser.email !== identity.email ||
				existingUser.pictureUrl !== identity.pictureUrl
			) {
				await ctx.db.patch(existingUser._id, {
					name: identity.name,
					email: identity.email,
					pictureUrl: identity.pictureUrl,
				});
			}
			return existingUser._id;
		}

		// Create new user
		const userId = await ctx.db.insert("users", {
			tokenIdentifier: identity.tokenIdentifier,
			name: identity.name,
			email: identity.email,
			pictureUrl: identity.pictureUrl,
		});

		return userId;
	},
});

export const current = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return null;
		}

		const user = await ctx.db
			.query("users")
			.withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
			.unique();

		return user;
	},
});

/** Returns current user and Auth0 user id for delete-account flow. */
export const currentUserAndAuth0Id = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return null;
		}

		const user = await ctx.db
			.query("users")
			.withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
			.unique();

		if (!user) return null;
		return { user, auth0UserId: identity.subject };
	},
});

export const storeUserFeedbackInternal = internalMutation({
	args: {
		userId: v.id("users"),
		userEmail: v.optional(v.string()),
		feedback: v.string(),
		source: userFeedbackSourceValidator,
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("userFeedback", {
			userId: args.userId,
			userEmail: args.userEmail,
			feedback: args.feedback,
			source: args.source,
			createdAt: Date.now(),
		});
	},
});

export const deleteUserDataInternal = internalMutation({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		const conversations = await ctx.db
			.query("conversations")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.collect();

		for (const conversation of conversations) {
			const messages = await ctx.db
				.query("messages")
				.withIndex("by_conversation", (q) =>
					q.eq("conversationId", conversation._id)
				)
				.collect();

			for (const message of messages) {
				if (message.attachments) {
					for (const attachment of message.attachments) {
						if (attachment.storageId) {
							await ctx.storage.delete(attachment.storageId);
						}
					}
				}
				await ctx.db.delete(message._id);
			}

			await ctx.db.delete(conversation._id);
		}

		await ctx.db.delete(args.userId);
	},
});
