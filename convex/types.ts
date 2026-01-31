import { v } from "convex/values";

// ============================================
// MODELS - Single Source of Truth
// ============================================

export const MODELS_AVAILABLE = [
	{ id: "google/gemini-2.0-flash", name: "Gemini 2.0 Flash" },
	{ id: "google/gemini-1.5-pro", name: "Gemini 1.5 Pro" },
	{ id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku" },
] as const;

// TypeScript type derived from the array
export type ModelAvailable = (typeof MODELS_AVAILABLE)[number]["id"];

// Convex validator derived from the array
export const modelValidator = v.union(
	...MODELS_AVAILABLE.map((m) => v.literal(m.id)),
) as ReturnType<typeof v.union<[ReturnType<typeof v.literal<ModelAvailable>>]>>;

// ============================================
// MESSAGE ROLES
// ============================================

export const MESSAGE_ROLES = ["user", "assistant", "system"] as const;
export type MessageRole = (typeof MESSAGE_ROLES)[number];

export const messageRoleValidator = v.union(
	v.literal("user"),
	v.literal("assistant"),
	v.literal("system"),
);

// ============================================
// PROMPT MODES
// ============================================

export const PROMPT_MODES = ["summary", "quiz", "explain", "interactive", "key-points"] as const;
export type PromptModeValue = (typeof PROMPT_MODES)[number];

export const promptModeValidator = v.union(
	v.literal("summary"),
	v.literal("quiz"),
	v.literal("explain"),
	v.literal("interactive"),
	v.literal("key-points"),
);

export const userFeedbackSourceValidator = v.union(
	v.literal("account_deletion"),
);
