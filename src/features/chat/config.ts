import type { ModelAvailable } from "convex/types";

export const DEFAULT_CHAT_CONFIG = {
	model: "google/gemini-2.0-flash",
	systemPrompt:
		"When separating sections, use a horizontal rule on its own line (a blank line, then ---, then another blank line). Do not put --- inline within sentences.",
} as const satisfies { model: ModelAvailable; systemPrompt: string };
