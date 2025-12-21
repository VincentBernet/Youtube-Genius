import { useAuth0 } from "@auth0/auth0-react";
import { createFileRoute } from "@tanstack/react-router";
import { LogIn } from "lucide-react";

export const Route = createFileRoute("/loggedOut")({
	component: RouteComponent,
});

function RouteComponent() {
	const { loginWithRedirect } = useAuth0();

	return (
		<div className="flex items-center justify-center min-h-[80vh] px-4">
			<div className="w-full max-w-md">
				<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
					<h1 className="text-2xl font-bold">You have been logged out</h1>
					{/* divider */}
					<div className="h-px w-full bg-gray-700 my-4" />
					<button
						onClick={() => loginWithRedirect()}
						type="button"
						className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
					>
						Let's go back to login!
					</button>
				</div>
			</div>
		</div>
	);
}
