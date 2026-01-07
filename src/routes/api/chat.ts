import { createFileRoute } from "@tanstack/react-router";
import type { UIMessage } from "ai";
import { convertToModelMessages, streamText } from "ai";
import type { Id } from "../../../convex/_generated/dataModel";

const MODEL = "google/gemini-2.0-flash";

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const {
					messages,
					conversationId,
				}: {
					messages: UIMessage[];
					conversationId?: Id<"conversations">;
				} = await request.json();

				const startTime = Date.now();

				const result = streamText({
					model: MODEL,
					system:
						"When separating sections, use a horizontal rule on its own line (a blank line, then ---, then another blank line). Do not put --- inline within sentences.",
					messages: await convertToModelMessages(messages),
					onFinish: async ({ text, usage, finishReason }) => {
						// Only save if we have a conversationId
						console.log(
							"📌 onFinish triggered with conversationId:",
							conversationId,
						);
						if (conversationId) {
							const latencyMs = Date.now() - startTime;

							const convexUrl = process.env.VITE_CONVEX_URL;
							if (!convexUrl) {
								console.error("❌ VITE_CONVEX_URL not configured");
								return;
							}

							// Call the Convex HTTP action to save the assistant message
							const httpUrl = convexUrl.replace(".cloud", ".site");

							try {
								const response = await fetch(
									`${httpUrl}/saveAssistantMessage`,
									{
										method: "POST",
										headers: {
											"Content-Type": "application/json",
										},
										body: JSON.stringify({
											conversationId,
											content: text,
											metadata: {
												model: MODEL,
												promptTokens: usage?.promptTokens,
												completionTokens: usage?.completionTokens,
												totalTokens: usage?.totalTokens,
												latencyMs,
												finishReason,
											},
										}),
									},
								);

								if (!response.ok) {
									const error = await response.text();
									console.error(
										"❌ Failed to save assistant message, response isn't ok:",
										error,
									);
								}
							} catch (error) {
								console.error("❌ Failed to save assistant message:", error);
							}
						}
					},
				});

				return result.toUIMessageStreamResponse();
			},
		},
	},
});
