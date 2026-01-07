import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import type { UIMessage } from "ai";
import { useMutation, useQuery } from "convex/react";
import { Textarea } from "flowbite-react";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import ConversationsSidebar from "@/commons/components/ConversationsSidebar";
import LLMInteraction from "@/commons/components/LLMInteraction";
import UserInteraction from "@/commons/components/UserInteraction";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

// Convert Convex messages to UIMessage format for useChat
const convertToUIMessages = (dbMessages: Doc<"messages">[]): UIMessage[] => {
	return dbMessages.map((msg) => ({
		id: msg._id,
		role: msg.role,
		parts: [{ type: "text" as const, text: msg.content }],
		createdAt: new Date(msg.createdAt),
	}));
};

const App = () => {
	const [input, setInput] = useState("");
	const [conversationId, setConversationId] =
		useState<Id<"conversations"> | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

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

	// Calculate rows based on content
	const getRows = () => {
		const lineBreaks = (input.match(/\n/g) || []).length;
		return Math.min(Math.max(1, lineBreaks + 1), 6); // Min 1, max 6 rows
	};

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
				});
				setConversationId(currentConversationId);
			} else {
				// Add user message to existing conversation
				await addUserMessage({
					conversationId: currentConversationId,
					content: messageContent,
				});
			}

			// Send to LLM with conversationId directly in the request body
			sendMessage(
				{ text: messageContent },
				{ body: { conversationId: currentConversationId } },
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
		// Messages will be loaded automatically via the useEffect when dbMessages updates
	};

	const handleNewConversation = () => {
		setConversationId(null);
		setMessages([]);
	};

	return (
		<div className="flex h-[calc(100vh-64px)]">
			{/* Sidebar */}
			<ConversationsSidebar
				conversations={conversations}
				selectedId={conversationId}
				onSelectConversation={handleSelectConversation}
				onNewConversation={handleNewConversation}
			/>

			{/* Main chat area */}
			<main className="flex-1 flex flex-col">
				<section className="flex-1 flex flex-col pt-8 pb-4 px-4 max-w-4xl mx-auto w-full">
					<div className="flex flex-col gap-8 flex-1 overflow-y-auto">
						{messages.length === 0 ? (
							<div className="flex-1 flex items-center justify-center">
								<div className="text-center text-slate-400">
									<p className="text-lg">Start a new conversation</p>
									<p className="text-sm mt-1">
										Ask anything and I'll help you learn
									</p>
								</div>
							</div>
						) : (
							messages.map((message) => (
								<div key={message.id}>
									{message.role === "user" ? (
										<UserInteraction parts={message.parts} />
									) : (
										<LLMInteraction parts={message.parts} />
									)}
								</div>
							))
						)}
					</div>

					<div className="sticky bottom-8 left-0 right-0 pt-4">
						<form onSubmit={handleSubmit} className="relative">
							<Textarea
								className="!bg-slate-800 !border-slate-600 !text-white placeholder:text-slate-400 focus:!border-cyan-500 focus:!ring-cyan-500 !pr-14 !p-5 resize-none !rounded-full"
								rows={getRows()}
								placeholder="Ask a question to Noto"
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={handleKeyDown}
								value={input}
								disabled={isSubmitting}
							/>
							<button
								type="submit"
								disabled={isSubmitting || !input.trim()}
								className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white text-slate-800 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
							>
								<ArrowUp size={20} />
							</button>
						</form>
					</div>
				</section>
			</main>
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/chat")({
	component: App,
});
