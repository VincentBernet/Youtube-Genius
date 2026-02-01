import type { UIMessage } from "ai";
import type { Doc } from "convex/_generated/dataModel";

export type UIMessageWithSystem = UIMessage & {
	/** Define if a user message is a system message, if true, it is hidden in UI */
	systemMessage?: boolean;
};

// Convert Convex messages to UIMessage format for useChat (keeps full history for API)
export const convertToUIMessages = (
	dbMessages: Doc<"messages">[],
): UIMessageWithSystem[] => {
	return dbMessages.map((msg) => ({
		id: msg._id,
		role: msg.role,
		parts: [{ type: "text" as const, text: msg.content }],
		createdAt: new Date(msg.createdAt),
		...(msg.systemMessage !== undefined && {
			systemMessage: msg.systemMessage,
		}),
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

/** Calculate rows based on content
 * - \n is line break
 * - we consider 100 characters per line
 * - we cap at 10 rows
 */
export const getRows = (input: string) => {
	/** /n is line break, and we consider 100 characters per line */
	const numberOfLines = Math.floor(input.length / 100) + (input.match(/\n/g) || []).length;
	return Math.min(Math.max(1, numberOfLines + 1), 10);
};
