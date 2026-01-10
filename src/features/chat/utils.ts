import type { UIMessage } from "ai";
import type { Doc } from "convex/_generated/dataModel";

// Convert Convex messages to UIMessage format for useChat
export const convertToUIMessages = (
	dbMessages: Doc<"messages">[],
): UIMessage[] => {
	return dbMessages.map((msg) => ({
		id: msg._id,
		role: msg.role,
		parts: [{ type: "text" as const, text: msg.content }],
		createdAt: new Date(msg.createdAt),
	}));
};
