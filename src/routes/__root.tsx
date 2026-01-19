import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import NotFound from "@/commons/components/NotFound";
import { ThemeInit } from "../../.flowbite-react/init";
import Header from "../commons/components/Header";
import appCss from "../styles.css?url";

const RootDocument = ({ children }: { children: React.ReactNode }) => {
	return (
		<html lang="en" className="bg-slate-900">
			<head>
				<HeadContent />
			</head>
			<body className="flex flex-col h-screen overflow-hidden">
				<ThemeInit />
				<Header />
				<div className="flex-1 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
					{children}
				</div>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
};

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "YoutubeGenius",
			},
			// Open Graph / Facebook
			{
				property: "og:type",
				content: "website",
			},
			{
				property: "og:title",
				content: "YoutubeGenius - Learn from YouTube videos",
			},
			{
				property: "og:description",
				content: "Transform YouTube videos into interactive learning experiences with AI-powered conversations",
			},
			{
				property: "og:image",
				content: "https://youtube-genius.netlify.app/yt-genius-logo.png", // Full URL to your OG image
			},
			{
				property: "og:url",
				content: "https://yourdomain.com", // Your site URL
			},
			{
				property: "og:site_name",
				content: "YoutubeGenius",
			},
			// Twitter Card
			{
				name: "twitter:card",
				content: "summary_large_image",
			},
			{
				name: "twitter:title",
				content: "YoutubeGenius - Learn from YouTube videos",
			},
			{
				name: "twitter:url",
				content: "https://youtube-genius.netlify.app",
			},
			{
				name: "twitter:description",
				content: "Transform YouTube videos into interactive learning experiences with AI-powered conversations",
			},
			{
				name: "twitter:image",
				content: "https://youtube-genius.netlify.app/yt-genius-logo.png",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	notFoundComponent: NotFound,
	shellComponent: RootDocument,
});
