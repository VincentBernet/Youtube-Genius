import type { ModelAvailable } from "convex/types";

export type PromptModeValue = "summary" | "quiz" | "explain" | "key-points";

export type PromptMode = {
	id: PromptModeValue;
	label: string;
	description: string;
	model: ModelAvailable;
	systemPrompt: string;
	firstMessage: string;
};

export const PROMPT_MODES = [
	{
		id: "summary",
		label: "Summary",
		description: "Get a concise summary",
		model: "google/gemini-2.0-flash",
		systemPrompt:
			"You are a helpful assistant that summarizes the content of the video. When separating sections, use a horizontal rule on its own line (a blank line, then ---, then another blank line). Do not put --- inline within sentences.",
		firstMessage: "Summarize the video",
	},
	{
		id: "quiz",
		label: "Quiz",
		description: "Test your knowledge",
		model: "google/gemini-2.0-flash",
		systemPrompt:
			"You are a helpful assistant that creates a quiz based on the content of the video.",
		firstMessage: "Create a quiz based on the video",
	},
	{
		id: "explain",
		label: "Explain",
		description: "Deep dive explanation",
		model: "google/gemini-2.0-flash",
		systemPrompt:
			"You are a helpful assistant that explains the content of the video.",
		firstMessage: "Explain the video",
	},
	{
		id: "key-points",
		label: "Key Points",
		description: "Extract key takeaways",
		model: "google/gemini-2.0-flash",
		systemPrompt:
			"You are a helpful assistant that extracts the key takeaways from the content of the video.",
		firstMessage: "Extract the key takeaways from the video",
	},
] as const satisfies PromptMode[];
