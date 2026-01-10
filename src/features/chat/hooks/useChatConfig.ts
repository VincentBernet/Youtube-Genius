import { useQuery } from "convex/react";
import { MODELS_AVAILABLE, type ModelAvailable } from "convex/types";
import { useEffect, useState } from "react";
import { DEFAULT_CHAT_CONFIG } from "@/features/chat/config";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

export const useChatConfig = (conversationId: Id<"conversations"> | null) => {
	const [selectedModel, setSelectedModel] = useState<ModelAvailable>(
		DEFAULT_CHAT_CONFIG.model,
	);
	const [systemPrompt, setSystemPrompt] = useState<string>(
		DEFAULT_CHAT_CONFIG.systemPrompt,
	);

	// Fetch conversation to get its saved config
	const conversation = useQuery(
		api.conversations.queries.getConversation,
		conversationId ? { conversationId } : "skip",
	);

	// Sync config from conversation when it changes
	useEffect(() => {
		if (conversation) {
			// Load saved model (add provider prefix if needed)
			if (conversation.model) {
				// Only set if it's a valid model
				if (MODELS_AVAILABLE.some((m) => m.id === conversation.model)) {
					setSelectedModel(conversation.model);
				}
			}
			// Load saved system prompt
			if (conversation.systemPrompt) {
				setSystemPrompt(conversation.systemPrompt);
			}
		}
	}, [conversation]);

	// Reset to defaults when starting a new conversation
	const resetToDefaults = () => {
		setSelectedModel(DEFAULT_CHAT_CONFIG.model);
		setSystemPrompt(DEFAULT_CHAT_CONFIG.systemPrompt);
	};

	return {
		selectedModel,
		setSelectedModel,
		systemPrompt,
		setSystemPrompt,
		resetToDefaults,
		availableModels: MODELS_AVAILABLE,
	};
};
