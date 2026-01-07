import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

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
				model?: string;
				promptTokens?: number;
				completionTokens?: number;
				totalTokens?: number;
				latencyMs?: number;
				finishReason?: string;
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

export default http;

