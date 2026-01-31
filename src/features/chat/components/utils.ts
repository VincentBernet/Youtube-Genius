import type { UIMessageWithSystem } from "@/features/chat/utils";

export const isSystemUserMessage = (m: UIMessageWithSystem): boolean =>
	m.role === "user" && m.systemMessage === true;
