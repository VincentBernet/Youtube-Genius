import { useAuth0 } from "@auth0/auth0-react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import Loading from "@/commons/components/Loading";
import { api } from "../../convex/_generated/api";

const AuthenticatedLayout = () => {
	const { isLoading, isAuthenticated } = useConvexAuth();
	const { loginWithRedirect } = useAuth0();
	const storeUser = useMutation(api.users.mutations.store);
	const hasStoredUser = useRef(false);

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

	useEffect(() => {
		if (isAuthenticated && !hasStoredUser.current) {
			hasStoredUser.current = true;
			storeUser();
		}
	}, [isAuthenticated, storeUser]);

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
};

export const Route = createFileRoute("/_authenticated")({
	component: AuthenticatedLayout,
});
