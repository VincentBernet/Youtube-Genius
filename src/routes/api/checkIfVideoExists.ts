import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/checkIfVideoExists")({
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

				// Try both VITE_ prefixed (for build-time) and non-prefixed (for runtime)
				const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
				if (!convexUrl) {
					console.error(
						"❌ CONVEX_URL not configured. Checked VITE_CONVEX_URL and CONVEX_URL",
					);
					return new Response(
						JSON.stringify({ error: "Convex not configured" }),
						{ status: 500, headers: { "Content-Type": "application/json" } },
					);
				}

				try {
					// Convert Convex URL to HTTP endpoint URL (same pattern as chat.ts)
					const httpUrl = convexUrl.replace(".cloud", ".site");

					const response = await fetch(
						`${httpUrl}/checkIfVideoExists?videoId=${encodeURIComponent(videoId)}`,
						{
							method: "GET",
							headers: { "Content-Type": "application/json" },
						},
					);

					if (!response.ok) {
						const errorText = await response.text();
						console.error(
							"❌ Convex HTTP error:",
							response.status,
							errorText,
							`URL: ${httpUrl}/checkVideo?videoId=${videoId}`,
						);
						return new Response(
							JSON.stringify({
								error: `Failed to check if video exists: ${response.statusText}`,
							}),
							{
								status: response.status,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					const video = await response.json();
					return new Response(JSON.stringify(video), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				} catch (error) {
					console.error("❌ Failed to check if video exists:", error);
					if (error instanceof Error) {
						console.error("Error details:", error.message, error.stack);
					}
					return new Response(
						JSON.stringify({
							error: "Failed to check if video exists in database",
							details: error instanceof Error ? error.message : "Unknown error",
						}),
						{ status: 500, headers: { "Content-Type": "application/json" } },
					);
				}
			},
		},
	},
});
