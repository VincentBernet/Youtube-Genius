import { createFileRoute } from "@tanstack/react-router";

type TranscriptResponse = {
	transcript: string;
	metadata?: {
		video_title?: string;
		duration?: number;
	};
};

export const Route = createFileRoute("/api/transcript")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const url = new URL(request.url);
				const videoUrl = url.searchParams.get("video_url");

				if (!videoUrl) {
					return new Response(
						JSON.stringify({ error: "video_url parameter is required" }),
						{ status: 400, headers: { "Content-Type": "application/json" } },
					);
				}

				const apiKey = process.env.TRANSCRIPT_API_KEY;
				if (!apiKey) {
					console.error("❌ TRANSCRIPT_API_KEY not configured");
					return new Response(
						JSON.stringify({ error: "Transcript API not configured" }),
						{ status: 500, headers: { "Content-Type": "application/json" } },
					);
				}

				try {
					const response = await fetch(
						`https://transcriptapi.com/api/v2/youtube/transcript?video_url=${encodeURIComponent(videoUrl)}`,
						{
							method: "GET",
							headers: {
								Authorization: `Bearer ${apiKey}`,
							},
						},
					);

					if (!response.ok) {
						const errorText = await response.text();
						console.error(
							"❌ TranscriptAPI error:",
							response.status,
							errorText,
						);
						return new Response(
							JSON.stringify({
								error: `Failed to fetch transcript: ${response.statusText}`,
							}),
							{
								status: response.status,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					const data: TranscriptResponse = await response.json();
					return new Response(JSON.stringify(data), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				} catch (error) {
					console.error("❌ Failed to fetch transcript:", error);
					return new Response(
						JSON.stringify({ error: "Failed to fetch transcript" }),
						{ status: 500, headers: { "Content-Type": "application/json" } },
					);
				}
			},
		},
	},
});
