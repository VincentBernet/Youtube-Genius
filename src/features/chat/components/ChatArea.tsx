import type { UIMessage } from "@ai-sdk/react";
import { Textarea } from "flowbite-react";
import { ArrowUp } from "lucide-react";
import { motion } from "motion/react";
import LLMInteraction from "@/commons/components/LLMInteraction";
import UserInteraction from "@/commons/components/UserInteraction";

type Props = {
	messages: UIMessage[];
	input: string;
	isSubmitting: boolean;
	onInputChange: (value: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
};

const ChatArea = ({
	messages,
	input,
	isSubmitting,
	onInputChange,
	onSubmit,
	onKeyDown,
}: Props) => {
	// Calculate rows based on content
	const getRows = () => {
		const lineBreaks = (input.match(/\n/g) || []).length;
		return Math.min(Math.max(1, lineBreaks + 1), 6); // Min 1, max 6 rows
	};

	return (
		<motion.section
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ duration: 0.1 }}
			className="flex-1 flex flex-col pt-8 pb-4 px-4 max-w-4xl mx-auto w-full min-h-0"
		>
			<div className="flex flex-col gap-8 flex-1 overflow-y-auto">
				{messages.map((message) => (
					<div key={message.id}>
						{message.role === "user" ? (
							<UserInteraction parts={message.parts} />
						) : (
							<LLMInteraction parts={message.parts} />
						)}
					</div>
				))}
			</div>

			<div className="sticky bottom-8 left-0 right-0 pt-4">
				<form onSubmit={onSubmit} className="relative">
					<Textarea
						className="!bg-slate-800 !border-slate-600 !text-white placeholder:text-slate-400 focus:!border-cyan-500 focus:!ring-cyan-500 !pr-14 !p-5 resize-none !rounded-full"
						rows={getRows()}
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
