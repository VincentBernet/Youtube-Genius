import { MessageSquare, Plus } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

type Conversation = {
	_id: Id<"conversations">;
	title?: string;
	updatedAt: number;
	createdAt: number;
};

type ConversationsSidebarProps = {
	conversations: Conversation[] | undefined;
	selectedId?: Id<"conversations"> | null;
	onSelectConversation: (id: Id<"conversations">) => void;
	onNewConversation: () => void;
};

const ConversationsSidebar = ({
	conversations,
	selectedId,
	onSelectConversation,
	onNewConversation,
}: ConversationsSidebarProps) => {
	return (
		<aside className="w-72 bg-slate-800 border-r border-slate-700 flex flex-col h-full min-h-0">
			{/* New conversation button */}
			<div className="p-4">
				<button
					type="button"
					onClick={onNewConversation}
					className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors cursor-pointer font-medium"
				>
					<Plus size={20} />
					<span>New conversation</span>
				</button>
			</div>

			{/* Conversations list */}
			<div className="flex-1 overflow-y-auto px-2 pb-4">
				{!conversations ? (
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin h-6 w-6 border-2 border-slate-600 border-t-cyan-500 rounded-full" />
					</div>
				) : conversations.length === 0 ? (
					<div className="text-center py-8 text-slate-500 text-sm">
						<p>No conversations yet</p>
						<p className="mt-1">Start a new one!</p>
					</div>
				) : (
					<div className="space-y-1">
						{conversations.map((conversation) => (
							<button
								key={conversation._id}
								type="button"
								onClick={() => onSelectConversation(conversation._id)}
								className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg transition-colors cursor-pointer text-left group ${
									selectedId === conversation._id
										? "bg-slate-700 text-white"
										: "text-slate-300 hover:bg-slate-700/50 hover:text-white"
								}`}
							>
								<MessageSquare
									size={18}
									className="mt-0.5 flex-shrink-0 text-slate-400 group-hover:text-slate-300"
								/>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate">
										{conversation.title || "New conversation"}
									</p>
									<p className="text-xs text-slate-500 mt-0.5">
										{formatRelativeTime(conversation.updatedAt)}
									</p>
								</div>
							</button>
						))}
					</div>
				)}
			</div>
		</aside>
	);
};

// Helper function to format relative time from timestamp
const formatRelativeTime = (timestamp: number): string => {
	const now = Date.now();
	const diffInMs = now - timestamp;
	const diffInMinutes = diffInMs / (1000 * 60);
	const diffInHours = diffInMs / (1000 * 60 * 60);
	const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

	if (diffInMinutes < 1) {
		return "Just now";
	}
	if (diffInHours < 1) {
		const minutes = Math.floor(diffInMinutes);
		return `${minutes}m ago`;
	}
	if (diffInHours < 24) {
		const hours = Math.floor(diffInHours);
		return `${hours}h ago`;
	}
	if (diffInDays < 7) {
		const days = Math.floor(diffInDays);
		return `${days}d ago`;
	}
	return new Date(timestamp).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
};

export default ConversationsSidebar;
