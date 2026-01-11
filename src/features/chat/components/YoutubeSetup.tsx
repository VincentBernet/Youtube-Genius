import { TextInput } from "flowbite-react";
import {
	BookOpen,
	FileText,
	HelpCircle,
	Lightbulb,
	Youtube,
} from "lucide-react";
import { motion } from "motion/react";
import type { PromptModeValue } from "@/features/chat/config";
import { PROMPT_MODES } from "@/features/chat/config";

type Props = {
	youtubeUrl: string;
	selectedMode: PromptModeValue;
	onUrlChange: (url: string) => void;
	onModeChange: (mode: PromptModeValue) => void;
	onSubmit: () => void;
};

const MODE_ICONS = {
	summary: FileText,
	quiz: HelpCircle,
	explain: BookOpen,
	"key-points": Lightbulb,
} as const;

const YoutubeSetup = ({
	youtubeUrl,
	selectedMode,
	onUrlChange,
	onModeChange,
	onSubmit,
}: Props) => {
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && youtubeUrl.trim()) {
			e.preventDefault();
			onSubmit();
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ duration: 0.1 }}
			className="flex-1 flex flex-col items-center justify-center px-4"
		>
			<div className="w-full max-w-2xl space-y-8">
				{/* Header */}
				<div className="text-center space-y-2">
					<div className="flex items-center justify-center gap-3 mb-4">
						<Youtube className="w-10 h-10 text-red-500" />
					</div>
					<h1 className="text-2xl font-semibold text-white">
						Learn from YouTube
					</h1>
					<p className="text-slate-400">
						Paste a video URL and choose how you want to learn
					</p>
				</div>

				{/* URL Input */}
				<div className="relative">
					<TextInput
						type="url"
						placeholder="Paste YouTube URL here..."
						value={youtubeUrl}
						onChange={(e) => onUrlChange(e.target.value)}
						onKeyDown={handleKeyDown}
						className="[&>input]:!bg-slate-800 [&>input]:!border-slate-600 [&>input]:!text-white [&>input]:placeholder:text-slate-400 [&>input]:focus:!border-cyan-500 [&>input]:focus:!ring-cyan-500 [&>input]:!py-4 [&>input]:!px-5 [&>input]:!rounded-xl"
						sizing="lg"
					/>
				</div>

				{/* Mode Selection Grid */}
				<div className="grid grid-cols-2 gap-4">
					{PROMPT_MODES.map((mode) => {
						const Icon = MODE_ICONS[mode.id];
						const isSelected = selectedMode === mode.id;

						return (
							<button
								key={mode.id}
								type="button"
								onClick={() => onModeChange(mode.id)}
								className={`p-5 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer ${
									isSelected
										? "border-cyan-500 bg-cyan-500/10"
										: "border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800"
								}`}
							>
								<div className="flex items-start gap-3">
									<Icon
										className={`w-6 h-6 mt-0.5 ${
											isSelected ? "text-cyan-400" : "text-slate-400"
										}`}
									/>
									<div>
										<h3
											className={`font-medium ${
												isSelected ? "text-cyan-400" : "text-white"
											}`}
										>
											{mode.label}
										</h3>
										<p className="text-sm text-slate-400 mt-1">
											{mode.description}
										</p>
									</div>
								</div>
							</button>
						);
					})}
				</div>

				{/* Hint */}
				<p className="text-center text-sm text-slate-500">
					Press{" "}
					<kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">
						Enter
					</kbd>{" "}
					to continue
				</p>
			</div>
		</motion.div>
	);
};

export default YoutubeSetup;
