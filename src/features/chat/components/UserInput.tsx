import { Textarea } from "flowbite-react";
import { ArrowUp } from "lucide-react";
import type { KeyboardEvent, SyntheticEvent } from "react";
import { useMemo, useState } from "react";
import { getRows } from "@/features/chat/utils";

type Props = {
	onSubmit: (message: string) => void;
	isSubmitting: boolean;
};

const UserInput = ({ onSubmit, isSubmitting }: Props) => {
	const [input, setInput] = useState("");

	const rows = useMemo(() => getRows(input), [input]);

	const handleSubmit = (e: SyntheticEvent) => {
		e.preventDefault();
		const trimmedInput = input.trim();
		if (!trimmedInput || isSubmitting) return;

		onSubmit(trimmedInput);
		setInput("");
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="relative">
			<Textarea
				className={`!bg-slate-800 !border-slate-600 !text-white placeholder:text-slate-400 focus:!border-cyan-500 focus:!ring-cyan-500 !pr-14 !p-5 resize-none ${rows === 1 ? "rounded-full" : "squircle rounded-[28px]"}`}
				rows={rows}
				placeholder="Ask a question to YoutubeGenius"
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={handleKeyDown}
				value={input}
				disabled={isSubmitting}
			/>
			<button
				type="submit"
				aria-label="Submit message"
				disabled={isSubmitting || !input.trim()}
				className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white text-slate-800 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
			>
				<ArrowUp size={20} />
			</button>
		</form>
	);
};

export default UserInput;
