import { createFileRoute } from "@tanstack/react-router";
import type { UIMessage } from "ai";
import { convertToModelMessages, generateText, streamText } from "ai";
import type { Id } from "../../../convex/_generated/dataModel";
import type { ModelAvailable } from "../../../convex/types";

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const {
					messages,
					model,
					systemPrompt,
					conversationId,
					isFirstMessage, // ← Add this flag from frontend
				}: {
					messages: UIMessage[];
					model: ModelAvailable;
					systemPrompt: string;
					conversationId?: Id<"conversations">;
					isFirstMessage?: boolean;
				} = await request.json();

				const startTime = Date.now();

				const result = streamText({
					model: model,
					system: systemPrompt,
					messages: await convertToModelMessages(messages),
					onFinish: async ({ text, usage, finishReason }) => {
						if (conversationId) {
							const latencyMs = Date.now() - startTime;
							const convexUrl = process.env.VITE_CONVEX_URL;
							if (!convexUrl) {
								console.error("❌ VITE_CONVEX_URL not configured");
								return;
							}

							const httpUrl = convexUrl.replace(".cloud", ".site");

							// Save assistant message
							try {
								await fetch(`${httpUrl}/saveAssistantMessage`, {
									method: "POST",
									headers: { "Content-Type": "application/json" },
									body: JSON.stringify({
										conversationId,
										content: text,
										metadata: {
											model,
											inputTokens: usage?.inputTokens,
											outputTokens: usage?.outputTokens,
											totalTokens: usage?.totalTokens,
											latencyMs,
											finishReason,
										},
									}),
								});
							} catch (error) {
								console.error("❌ Failed to save assistant message:", error);
							}

							// Generate title for first message
							if (isFirstMessage) {
								try {
									const userMessage = messages.find((m) => m.role === "user");
									const titleResult = await generateText({
										model: "google/gemini-2.0-flash", // Use fast model for titles
										system: `Generate a short, descriptive title (max 30 chars) for this conversation. Return only the title, no quotes or punctuation.`,
										prompt: `User: ${userMessage?.parts[0].type === "text" ? userMessage.parts[0].text : ""}\nAssistant: ${text.slice(0, 500)}`,
									});

									await fetch(`${httpUrl}/generateTitle`, {
										method: "POST",
										headers: { "Content-Type": "application/json" },
										body: JSON.stringify({
											conversationId,
											title: titleResult.text.slice(0, 100), // Safety limit
										}),
									});
									console.log("📝 Generated title:", titleResult.text);
								} catch (error) {
									console.error("❌ Failed to generate title:", error);
								}
							}
						}
					},
				});

				return result.toUIMessageStreamResponse();
			},
		},
	},
});
