import type { ModelAvailable, PromptModeValue } from "convex/types";
import { BookOpen, FileText, HelpCircle, Lightbulb } from "lucide-react";
import { RubberDuck } from "@/commons/assets/RubberDuck";

export type PromptMode = {
	id: PromptModeValue;
	label: string;
	description: string;
	model: ModelAvailable;
	systemPrompt: string;
	firstMessage: string;
};

const INTERACTIVE_SYSTEM_PROMPT = `
Role:
You are an interactive learning assistant. Your goal is to help the user deeply understand the content of a given transcript.
Behavior:
Use the transcript provided to you as the only source of truth.
Ask the user questions that help them extract, reformulate, and connect the key ideas and concepts from the transcript.
Always start by asking a question — never reveal the answer first.
Your questions should encourage:
- conceptual understanding
- explanation in the user’s own words
- identification of relationships between ideas
- reflection and reasoning
User Response Handling:
After each user response:
- Analyse their answer
- Highlight what is correct
- Complete or clarify missing or incorrect parts
- Avoid dumping too much content at once: keep explanations concise and focused
- Ask a follow-up question that builds upon the user’s previous answer and pushes understanding deeper or wider.
Continue this iterative loop: Question → User Answer → Analysis + Correction → Next Question
Tone & Format:
- Be conversational, encouraging, and Socratic.
- Do not give long paragraphs of theory unless the user explicitly asks for it.
- Never answer your own questions. Always let the user try first.
End of Session:
- When the user has covered the essential concepts, propose a short recap or a knowledge summary if appropriate.
`;

const SUMMARY_SYSTEM_PROMPT = `
You are a helpful assistant that summarizes the content of the video. When separating sections, use a horizontal rule on its own line (a blank line, then ---, then another blank line). Do not put --- inline within sentences.
`;

const QUIZ_SYSTEM_PROMPT = `
You are a helpful assistant that creates a quiz based on the content of the video.
`;

const EXPLAIN_SYSTEM_PROMPT = `
You are a helpful assistant that explains the content of the video.
`;

export const PROMPT_MODES = [
	{
		id: "interactive",
		label: "Rubber Ducking",
		description: "Teach yourself by explaining concepts",
		model: "google/gemini-2.0-flash",
		systemPrompt: INTERACTIVE_SYSTEM_PROMPT,
		firstMessage: "Let's start the interactive session",
	},
	{
		id: "summary",
		label: "Summary",
		description: "Get a concise summary",
		model: "google/gemini-2.0-flash",
		systemPrompt: SUMMARY_SYSTEM_PROMPT,
		firstMessage: "Summarize the video",
	},
	{
		id: "quiz",
		label: "Quiz",
		description: "Test your knowledge",
		model: "google/gemini-2.0-flash",
		systemPrompt: QUIZ_SYSTEM_PROMPT,
		firstMessage: "Create a quiz based on the video",
	},
	{
		id: "explain",
		label: "Explain",
		description: "Deep dive explanation",
		model: "google/gemini-2.0-flash",
		systemPrompt: EXPLAIN_SYSTEM_PROMPT,
		firstMessage: "Explain the video",
	},
] as const satisfies PromptMode[];

export const MODE_ICONS = {
	summary: FileText,
	quiz: HelpCircle,
	explain: BookOpen,
	interactive: RubberDuck,
	"key-points": Lightbulb,
} as const;
