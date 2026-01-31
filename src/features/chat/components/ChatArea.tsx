import type { UIMessage } from "@ai-sdk/react";
import { Textarea } from "flowbite-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import LLMInteraction from "@/features/chat/components/LLMInteraction";
import UserInteraction from "@/features/chat/components/UserInteraction";
import { getRows, type UIMessageWithSystem } from "@/features/chat/utils";

type Props = {
	messages: UIMessage[];
	input: string;
	isSubmitting: boolean;
	onInputChange: (value: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
};

const isSystemUserMessage = (m: UIMessage): boolean =>
	m.role === "user" && (m as UIMessageWithSystem).systemMessage === true;

const ChatArea = ({
	messages,
	input,
	isSubmitting,
	onInputChange,
	onSubmit,
	onKeyDown,
}: Props) => {
	const lastUserMessageRef = useRef<HTMLDivElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const prevMessagesLengthRef = useRef(messages.length);
	const [showScrollButton, setShowScrollButton] = useState(false);

	// Hide user messages sent by the system (e.g. first auto message, "Summarize" button)
	const visibleMessages = useMemo(
		() => messages.filter((m) => !isSystemUserMessage(m)),
		[messages],
	);

	// Find index of the last visible user message for ref assignment
	const lastUserMessageIndex = visibleMessages.reduce(
		(lastIndex, msg, index) => (msg.role === "user" ? index : lastIndex),
		-1,
	);

	// Track if bottom is visible to show/hide scroll button
	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => setShowScrollButton(!entry.isIntersecting),
			{
				threshold: 0,
			},
		);
		if (bottomRef.current) observer.observe(bottomRef.current);
		return () => observer.disconnect();
	}, []);

	// Scroll when a new visible user message is added
	useEffect(() => {
		const lastVisible = visibleMessages[visibleMessages.length - 1];
		const isNewMessage = messages.length > prevMessagesLengthRef.current;

		if (
			isNewMessage &&
			lastVisible?.role === "user" &&
			lastUserMessageRef.current
		) {
			lastUserMessageRef.current.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}

		prevMessagesLengthRef.current = messages.length;
	}, [messages, visibleMessages]);

	const scrollToBottom = () => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<motion.section
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ duration: 0.1 }}
			className="flex-1 flex flex-col pt-8 pb-4 px-4 max-w-4xl mx-auto w-full min-h-0"
		>
			<div className="flex flex-col gap-8 flex-1">
				{visibleMessages.map((message, index) => (
					<div
						key={message.id}
						ref={index === lastUserMessageIndex ? lastUserMessageRef : null}
					>
						{message.role === "user" ? (
							<UserInteraction parts={message.parts} />
						) : (
							<LLMInteraction parts={message.parts} />
						)}
					</div>
				))}
				{/* Spacer to allow user message to scroll to top - always present after 2+ visible user messages */}
				{visibleMessages.filter((m) => m.role === "user").length >= 2 && (
					<div className="min-h-[70vh] shrink-0" />
				)}
				{/* Bottom marker for scroll detection */}
				<div ref={bottomRef} />
			</div>

			<div className="sticky bottom-8 left-0 right-0 pt-4 relative">
				<AnimatePresence>
					{showScrollButton && (
						<motion.button
							type="button"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 10 }}
							onClick={scrollToBottom}
							className="absolute -top-12 left-1/2 -translate-x-1/2 p-2 bg-slate-700 text-white rounded-full hover:bg-slate-600 transition-colors shadow-lg cursor-pointer"
						>
							<ArrowDown size={20} />
						</motion.button>
					)}
				</AnimatePresence>
				<form onSubmit={onSubmit} className="relative">
					<Textarea
						className={`!bg-slate-800 !border-slate-600 !text-white placeholder:text-slate-400 focus:!border-cyan-500 focus:!ring-cyan-500 !pr-14 !p-5 resize-none ${getRows(input) === 1 ? "rounded-full" : "squircle rounded-[28px]"}`}
						rows={getRows(input)}
						placeholder="Ask a question to YoutubeGenius"
						onChange={(e) => onInputChange(e.target.value)}
						onKeyDown={onKeyDown}
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
		</motion.section>
	);
};

export default ChatArea;
