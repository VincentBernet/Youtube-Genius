import { useChat } from "@ai-sdk/react";
import { useMutation, useQuery } from "convex/react";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import ConversationsSidebar from "@/commons/components/ConversationsSidebar";
import ChatArea from "@/features/chat/components/ChatArea";
import YoutubeSetup from "@/features/chat/components/YoutubeSetup";
import { PROMPT_MODES, type PromptModeValue } from "@/features/chat/config";
import { useChatConfig } from "@/features/chat/hooks/useChatConfig";
import { convertToUIMessages } from "@/features/chat/utils";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

const ChatPage = () => {
	const [input, setInput] = useState("");
	const [conversationId, setConversationId] =
		useState<Id<"conversations"> | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// YouTube setup state
	const [youtubeUrl, setYoutubeUrl] = useState("");
	const [selectedMode, setSelectedMode] = useState<PromptModeValue>("summary");
	const [hasSetupCompleted, setHasSetupCompleted] = useState(false);

	// Chat configuration (model, systemPrompt)
	const {
		selectedModel,
		setSystemPrompt,
		setSelectedModel,
		systemPrompt,
		resetToDefaults,
	} = useChatConfig(conversationId);

	// Fetch user's conversations
	const conversations = useQuery(api.conversations.queries.getConversations);
	// Fetch messages for the selected conversation
	const dbMessages = useQuery(
		api.conversations.queries.getMessages,
		conversationId ? { conversationId } : "skip",
	);

	const createWithFirstMessage = useMutation(
		api.conversations.mutations.createWithFirstMessage,
	);
	const addUserMessage = useMutation(
		api.conversations.mutations.addUserMessage,
	);

	const { messages, sendMessage, setMessages } = useChat();

	// Sync messages from DB when conversation changes
	useEffect(() => {
		if (dbMessages) {
			setMessages(convertToUIMessages(dbMessages));
		}
	}, [dbMessages, setMessages]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isSubmitting) return;

		const messageContent = input.trim();
		setIsSubmitting(true);
		setInput("");

		try {
			let currentConversationId = conversationId;

			// If no conversation exists, create one with the first message
			if (!currentConversationId) {
				currentConversationId = await createWithFirstMessage({
					content: messageContent,
					title: "New chat",
					systemPrompt: systemPrompt,
					model: selectedModel,
				});
				setConversationId(currentConversationId);
			} else {
				// Add user message to existing conversation
				await addUserMessage({
					conversationId: currentConversationId,
					content: messageContent,
				});
			}

			// Send to LLM with conversationId and config in the request body
			sendMessage(
				{ text: messageContent },
				{
					body: {
						conversationId: currentConversationId,
						model: selectedModel,
						systemPrompt: systemPrompt,
						isFirstMessage: !conversationId, // true if this is a new conversation
					},
				},
			);
		} catch (error) {
			console.error("Failed to send message:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	const handleSelectConversation = (id: Id<"conversations">) => {
		setConversationId(id);
		// Skip setup screen for existing conversations
		setHasSetupCompleted(true);
		// Messages will be loaded automatically via the useEffect when dbMessages updates
	};

	const handleNewConversation = () => {
		setConversationId(null);
		setMessages([]);
		resetToDefaults();
		// Reset setup state
		setYoutubeUrl("");
		setSelectedMode("summary");
		setHasSetupCompleted(false);
	};

	const handleSetupSubmit = () => {
		if (!youtubeUrl.trim()) return;
		setHasSetupCompleted(true);
	};

	const handleSelectMode = (mode: PromptModeValue) => {
		setSelectedMode(mode);
		setSystemPrompt(
			PROMPT_MODES.find((m) => m.id === mode)?.systemPrompt || "",
		);
		setSelectedModel(
			PROMPT_MODES.find((m) => m.id === mode)?.model ||
				"google/gemini-2.0-flash",
		);
	};

	return (
		<div className="flex h-full">
			<ConversationsSidebar
				conversations={conversations}
				selectedId={conversationId}
				onSelectConversation={handleSelectConversation}
				onNewConversation={handleNewConversation}
			/>

			<main className="flex-1 flex flex-col min-h-0">
				<AnimatePresence mode="wait">
					{!hasSetupCompleted ? (
						<YoutubeSetup
							key="youtube-setup"
							youtubeUrl={youtubeUrl}
							selectedMode={selectedMode}
							onUrlChange={setYoutubeUrl}
							onModeChange={handleSelectMode}
							onSubmit={handleSetupSubmit}
						/>
					) : (
						<ChatArea
							key="chat-area"
							messages={messages}
							input={input}
							isSubmitting={isSubmitting}
							onInputChange={setInput}
							onSubmit={handleSubmit}
							onKeyDown={handleKeyDown}
						/>
					)}
				</AnimatePresence>
			</main>
		</div>
	);
};

export default ChatPage;
