import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useAction } from "convex/react";
import { useState } from "react";

const DangerZone = () => {
	const { logout } = useAuth0();
	const deleteAccount = useAction(api.users.actions.deleteAccount);
	const navigate = useNavigate();
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [feedback, setFeedback] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const onDeleteAccount = async () => {
		setIsDeleting(true);
		setError(null);
		try {
			await deleteAccount({
				feedback: feedback.trim() || undefined,
			});
			logout({
				logoutParams: {
					returnTo: `${window.location.origin}/loggedOut`,
				},
			});
			navigate({ to: "/loggedOut" });
		} catch (e) {
			setError(
				e instanceof Error ? e.message : "Failed to delete account",
			);
			setIsDeleting(false);
		}
	};

	return (
		<div className="bg-red-950/20 border border-red-500/20 rounded-xl p-6">
			<h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
			<p className="text-slate-400 text-sm mb-4">
				Permanently delete your account and all associated data.
			</p>
			{error && (
				<p className="text-red-400 text-sm mb-4" role="alert">
					{error}
				</p>
			)}
			{!isConfirmOpen ? (
				<button
					type="button"
					onClick={() => {
						setError(null);
						setIsConfirmOpen(true);
					}}
					disabled={isDeleting}
					className="cursor-pointer px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Delete Account
				</button>
			) : (
				<div className="space-y-4">
					<p className="text-slate-300 text-sm">
						Are you sure? This cannot be undone.
					</p>
					<div>
						<textarea
							id="deletion-feedback"
							value={feedback}
							onChange={(e) => setFeedback(e.target.value)}
							placeholder="Your feedback helps us improve. Optional but appreciated 🙇"
							rows={3}
							maxLength={2000}
							disabled={isDeleting}
							className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
						/>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						<button
							type="button"
							onClick={() => {
								setIsConfirmOpen(false);
								setFeedback("");
							}}
							disabled={isDeleting}
							className="cursor-pointer px-4 py-2 bg-slate-600/50 hover:bg-slate-600 border border-slate-500 text-slate-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={onDeleteAccount}
							disabled={isDeleting}
							className="cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 border border-red-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isDeleting ? "Deleting…" : "Delete permanently"}
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default DangerZone;
