import { useAuth0 } from "@auth0/auth0-react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { useEffect } from "react";
import Loading from "@/components/Loading";

export const Route = createFileRoute("/_authenticated")({
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	const { isLoading, isAuthenticated } = useConvexAuth();
	const { loginWithRedirect } = useAuth0();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			loginWithRedirect({
				appState: { returnTo: window.location.pathname },
				openUrl: (url) => {
					window.location.href = url;
				},
			});
		}
	}, [isLoading, isAuthenticated, loginWithRedirect]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen ">
				<Loading />
			</div>
		);
	}

	if (!isAuthenticated) {
		return null; // Will redirect via useEffect
	}

	return <Outlet />;
}
