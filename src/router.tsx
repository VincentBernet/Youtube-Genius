import { Auth0Provider } from "@auth0/auth0-react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth0 } from "convex/react-auth0";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
	const CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string;
	const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN as string;
	const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID as string;

	if (!CONVEX_URL) {
		console.error("missing envar VITE_CONVEX_URL");
	}

	const convexQueryClient = new ConvexQueryClient(CONVEX_URL);

	const queryClient: QueryClient = new QueryClient({
		defaultOptions: {
			queries: {
				queryKeyHashFn: convexQueryClient.hashFn(),
				queryFn: convexQueryClient.queryFn(),
			},
		},
	});
	convexQueryClient.connect(queryClient);

	const convex = new ConvexReactClient(CONVEX_URL);

	console.log(
		typeof window !== "undefined"
			? `Client side ${window.location.origin}`
			: `Server side`,
	);

	const router = routerWithQueryClient(
		createRouter({
			routeTree,
			defaultPreload: "intent",
			context: { queryClient },
			scrollRestoration: true,
			Wrap: ({ children }) => (
				<Auth0Provider
					domain={AUTH0_DOMAIN}
					clientId={AUTH0_CLIENT_ID}
					authorizationParams={{
						redirect_uri:
							typeof window !== "undefined"
								? window.location.origin
								: undefined,
					}}
					useRefreshTokens={true}
					cacheLocation="localstorage"
				>
					<ConvexProviderWithAuth0 client={convex}>
						{children}
					</ConvexProviderWithAuth0>
				</Auth0Provider>
			),
		}),
		queryClient,
	);

	return router;
};
