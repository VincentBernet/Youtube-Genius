import { useChat } from "@ai-sdk/react";
import { useMutation as useTanstackMutation } from "@tanstack/react-query";
import { useMutation, useQuery } from "convex/react";
import type { PromptModeValue } from "convex/types";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import ChatArea from "@/features/chat/components/ChatArea";
import ConversationsSidebar from "@/features/chat/components/ConversationsSidebar";
import YoutubeSetup from "@/features/chat/components/YoutubeSetup";
import { PROMPT_MODES } from "@/features/chat/config";
import { useChatConfig } from "@/features/chat/hooks/useChatConfig";
import { convertToUIMessages, extractVideoId } from "@/features/chat/utils";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

const ChatPage = () => {
	const [conversationId, setConversationId] =
		useState<Id<"conversations"> | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// YouTube setup state
	const [setupKey, setSetupKey] = useState(0);
	const [selectedMode, setSelectedMode] =
		useState<PromptModeValue>("interactive");
	const [hasSetupCompleted, setHasSetupCompleted] = useState(false);
	const [youtubeVideoId, setYoutubeVideoId] =
		useState<Id<"youtubeVideos"> | null>(null);

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

	// Convex mutation to save YouTube video
	const createYoutubeVideo = useMutation(api.youtube.mutations.create);

	// Handle setup submit - check DB first, then fetch from API if needed
	const {
		mutate: handleSetupFlow,
		isPending: isFetchingTranscript,
		isError: isErrorFetchingTranscript,
	} = useTanstackMutation({
		mutationFn: async (url: string) => {
			const videoId = extractVideoId(url);
			if (!videoId) {
				throw new Error("Invalid YouTube URL");
			}

			// First, check if video exists in DB
			const checkResponse = await fetch(
				`/api/checkIfVideoExists?videoId=${videoId}`,
			);
			if (checkResponse.ok) {
				const existingVideo = await checkResponse.json();
				if (existingVideo) {
					return {
						transcript: existingVideo.transcript,
						youtubeVideoId: existingVideo._id as Id<"youtubeVideos">,
						isFromCache: true,
					};
				}
			}

			// Not in DB, fetch from external API
			const response = await fetch(
				`/api/transcript?video_url=${encodeURIComponent(url)}`,
			);
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to fetch transcript");
			}
			const data = await response.json();

			// Convert transcript array to plain text, keep raw for timestamps
			const transcriptText = Array.isArray(data.transcript)
				? data.transcript
						.map((segment: { text: string }) => segment.text)
						.join(" ")
				: data.transcript;
			const transcriptRaw = Array.isArray(data.transcript)
				? JSON.stringify(data.transcript)
				: "";

			// Save to Convex DB
			const newYoutubeVideoId = await createYoutubeVideo({
				videoId,
				url,
				title: data.metadata?.video_title,
				transcript: transcriptText,
				transcriptRaw,
			});

			return {
				transcript: transcriptText,
				youtubeVideoId: newYoutubeVideoId,
				isFromCache: false,
			};
		},
		onSuccess: async (data) => {
			const selectedModeConfig = PROMPT_MODES.find(
				(m) => m.id === selectedMode,
			);
			const modePrompt = selectedModeConfig?.systemPrompt || "";
			const firstMessage =
				selectedModeConfig?.firstMessage || "Summarize the video";

			const fullSystemPrompt = `${modePrompt}\n\n---\nVideo Transcript:\n${data.transcript}`;
			setSystemPrompt(fullSystemPrompt);

			// Create conversation in DB
			const newConversationId = await createWithFirstMessage({
				content: firstMessage,
				title: "New chat",
				systemPrompt: fullSystemPrompt,
				systemMessage: true,
				mode: selectedMode,
				model: selectedModel,
				youtubeVideoId: data.youtubeVideoId,
			});
			setConversationId(newConversationId);
			// Send to LLM
			sendMessage(
				{ text: firstMessage },
				{
					body: {
						conversationId: newConversationId,
						model: selectedModel,
						systemPrompt: fullSystemPrompt,
						isFirstMessage: true,
					},
				},
			);

			setYoutubeVideoId(data.youtubeVideoId);
			setHasSetupCompleted(true);
		},
	});

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

	const handleSubmit = async (messageContent: string) => {
		if (!messageContent || isSubmitting) return;

		setIsSubmitting(true);

		try {
			let currentConversationId = conversationId;

			// If no conversation exists, create one with the first message
			if (!currentConversationId && youtubeVideoId) {
				currentConversationId = await createWithFirstMessage({
					content: messageContent,
					title: "New chat",
					systemPrompt: systemPrompt,
					systemMessage: true,
					mode: selectedMode,
					model: selectedModel,
					youtubeVideoId: youtubeVideoId,
				});
				setConversationId(currentConversationId);
			} else {
				// Add user message to existing conversation
				if (currentConversationId) {
					await addUserMessage({
						conversationId: currentConversationId,
						content: messageContent,
					});
				}
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
		// Reset setup state: remount YoutubeSetup for fresh form
		setSetupKey((k) => k + 1);
		setSelectedMode("interactive");
		setHasSetupCompleted(false);
		setYoutubeVideoId(null);
	};

	const handleSetupSubmit = (data: { youtubeUrl: string }) => {
		handleSetupFlow(data.youtubeUrl);
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
			<main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
				<AnimatePresence mode="wait">
					{!hasSetupCompleted ? (
						<YoutubeSetup
							key={`youtube-setup-${setupKey}`}
							selectedMode={selectedMode}
							onModeChange={handleSelectMode}
							onSubmit={handleSetupSubmit}
							isLoading={isFetchingTranscript}
							isError={isErrorFetchingTranscript}
						/>
					) : (
						<ChatArea
							key="chat-area"
							messages={messages}
							isSubmitting={isSubmitting}
							onSubmit={handleSubmit}
						/>
					)}
				</AnimatePresence>
			</main>
		</div>
	);
};

export default ChatPage;
