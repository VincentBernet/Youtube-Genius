import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { httpAction } from "./_generated/server";
import { ModelAvailable } from "./types";
import { api } from "./_generated/api";

const http = httpRouter();

// HTTP action to save assistant messages from the backend
http.route({
	path: "/saveAssistantMessage",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		const body = await request.json();

		const { conversationId, content, metadata } = body as {
			conversationId: Id<"conversations">;
			content: string;
			metadata?: {
				model: ModelAvailable;
				inputTokens: number;
				outputTokens: number;
				totalTokens: number;
				latencyMs: number;
				finishReason: string;
			};
		};

		if (!conversationId || !content) {
			return new Response(
				JSON.stringify({ error: "Missing conversationId or content" }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		try {
			const messageId = await ctx.runMutation(
				internal.conversations.mutations.addAssistantMessage,
				{
					conversationId,
					content,
					metadata,
				}
			);

			return new Response(
				JSON.stringify({ success: true, messageId }),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		} catch (error) {
			console.error("Failed to save assistant message:", error);
			return new Response(
				JSON.stringify({ error: "Failed to save message" }),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}
	}),
});

// Add this route alongside saveAssistantMessage
http.route({
	path: "/generateTitle",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
	  const { conversationId, title } = await request.json() as {
		conversationId: Id<"conversations">;
		title: string;
	  };
  
	  if (!conversationId || !title) {
		return new Response(
		  JSON.stringify({ error: "Missing conversationId or title" }),
		  { status: 400, headers: { "Content-Type": "application/json" } }
		);
	  }
  
	  try {
		await ctx.runMutation(
		  internal.conversations.mutations.updateTitleInternal,
		  { conversationId, title }
		);
  
		return new Response(
		  JSON.stringify({ success: true }),
		  { status: 200, headers: { "Content-Type": "application/json" } }
		);
	  } catch (error) {
		console.error("Failed to update title:", error);
		return new Response(
		  JSON.stringify({ error: "Failed to update title" }),
		  { status: 500, headers: { "Content-Type": "application/json" } }
		);
	  }
	}),
  });

// HTTP action to check if a video exists in the database
http.route({
	path: "/checkIfVideoExists",
	method: "GET",
	handler: httpAction(async (ctx, request) => {
		const url = new URL(request.url);
		const videoId = url.searchParams.get("videoId");

		if (!videoId) {
			return new Response(
				JSON.stringify({ error: "videoId parameter is required" }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		try {
			const video = await ctx.runQuery(api.youtube.queries.getByVideoId, {
				videoId,
			});

			return new Response(
				JSON.stringify(video),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		} catch (error) {
			console.error("Failed to check if video exists:", error);
			return new Response(
				JSON.stringify({ error: "Failed to check if video exists in database" }),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}
	}),
});

export default http;

