import { useAuth0 } from "@auth0/auth0-react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	const { loginWithRedirect, isAuthenticated } = useAuth0();

	useEffect(() => {
		if (!isAuthenticated) {
			loginWithRedirect({
				openUrl: (url) => {
					window.location.href = url;
				},
			});
		}
	}, [isAuthenticated, loginWithRedirect]);

	return <div>Redirecting to login...</div>;
}
