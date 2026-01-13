import { v } from 'convex/values';
import { mutation } from '../_generated/server';

export const create = mutation({
	args: {
		videoId: v.string(),
		url: v.string(),
		title: v.optional(v.string()),
		transcript: v.string(),
		transcriptRaw: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Not authenticated');
		}

		// Check if video already exists
		const existingVideo = await ctx.db
			.query('youtubeVideos')
			.withIndex('by_video_id', (q) => q.eq('videoId', args.videoId))
			.unique();

		if (existingVideo) {
			return existingVideo._id;
		}

		const now = Date.now();

		const videoId = await ctx.db.insert('youtubeVideos', {
			videoId: args.videoId,
			url: args.url,
			title: args.title,
			transcript: args.transcript,
			transcriptRaw: args.transcriptRaw,
			createdAt: now,
		});

		return videoId;
	},
});
