import { v } from 'convex/values';
import { query } from '../_generated/server';

export const getByVideoId = query({
	args: {
		videoId: v.string(),
	},
	handler: async (ctx, args) => {
		const video = await ctx.db
			.query('youtubeVideos')
			.withIndex('by_video_id', (q) => q.eq('videoId', args.videoId))
			.unique();

		return video;
	},
});
