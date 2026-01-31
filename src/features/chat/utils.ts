import type { UIMessage } from "ai";
import type { Doc } from "convex/_generated/dataModel";

export type UIMessageWithSystem = UIMessage & { systemMessage?: boolean };

// Convert Convex messages to UIMessage format for useChat (keeps full history for API)
export const convertToUIMessages = (
	dbMessages: Doc<"messages">[],
): UIMessageWithSystem[] => {
	return dbMessages.map((msg) => ({
		id: msg._id,
		role: msg.role,
		parts: [{ type: "text" as const, text: msg.content }],
		createdAt: new Date(msg.createdAt),
		...(msg.systemMessage !== undefined && { systemMessage: msg.systemMessage }),
	}));
};

// Extract YouTube video ID from various URL formats
export const extractVideoId = (url: string): string | null => {
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
		/youtube\.com\/shorts\/([^&\n?#]+)/,
		/youtube\.com\/watch\/([^&\n?#]+)/,
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match?.[1]) {
			return match[1];
		}
	}
	return null;
};

// Calculate rows based on content
export const getRows = (input: string) => {
	const lineBreaks = (input.match(/\n/g) || []).length;
	return Math.min(Math.max(1, lineBreaks + 1), 6); // Min 1, max 6 rows
};
