import { createFileRoute } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute("/api/check")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const url = new URL(request.url);
				const videoId = url.searchParams.get("videoId");

				if (!videoId) {
					return new Response(
						JSON.stringify({ error: "videoId parameter is required" }),
						{ status: 400, headers: { "Content-Type": "application/json" } },
					);
				}

				const convexUrl = process.env.VITE_CONVEX_URL;
				if (!convexUrl) {
					console.error("❌ VITE_CONVEX_URL not configured");
					return new Response(
						JSON.stringify({ error: "Convex not configured" }),
						{ status: 500, headers: { "Content-Type": "application/json" } },
					);
				}

				try {
					const client = new ConvexHttpClient(convexUrl);
					const video = await client.query(api.youtube.queries.getByVideoId, {
						videoId,
					});

					return new Response(JSON.stringify(video), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				} catch (error) {
					console.error("❌ Failed to check video:", error);
					return new Response(
						JSON.stringify({ error: "Failed to check video in database" }),
						{ status: 500, headers: { "Content-Type": "application/json" } },
					);
				}
			},
		},
	},
});
