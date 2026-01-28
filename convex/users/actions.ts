import { action } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { v } from "convex/values";

export const deleteAccount = action({
	args: {
		feedback: v.optional(v.string()),
	},
	handler: async (ctx, args): Promise<void> => {
		const data = await ctx.runQuery(api.users.mutations.currentUserAndAuth0Id);
		if (!data) {
			throw new Error("Not authenticated");
		}

		const { user, auth0UserId } = data;

		const trimmedFeedback = args.feedback?.trim();
		if (trimmedFeedback) {
			await ctx.runMutation(internal.users.mutations.storeUserFeedbackInternal, {
				userId: user._id,
				userEmail: user.email,
				feedback: trimmedFeedback,
				source: "account_deletion",
			});
		}

		await ctx.runMutation(internal.users.mutations.deleteUserDataInternal, {
			userId: user._id,
		});

		const domain = process.env.AUTH0_DOMAIN;
		const clientId = process.env.AUTH0_MANAGEMENT_CLIENT_ID;
		const clientSecret = process.env.AUTH0_MANAGEMENT_CLIENT_SECRET;

		if (!domain || !clientId || !clientSecret) {
			console.error(
				"Missing AUTH0_DOMAIN, AUTH0_MANAGEMENT_CLIENT_ID, or AUTH0_MANAGEMENT_CLIENT_SECRET"
			);
			return;
		}

		const tokenRes = await fetch(`https://${domain}/oauth/token`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				grant_type: "client_credentials",
				client_id: clientId,
				client_secret: clientSecret,
				audience: `https://${domain}/api/v2/`,
			}),
		});

		if (!tokenRes.ok) {
			const errText = await tokenRes.text();
			console.error("Auth0 token request failed:", tokenRes.status, errText);
			throw new Error("Failed to obtain Auth0 Management API token");
		}

		const tokenData = (await tokenRes.json()) as { access_token: string };
		const accessToken = tokenData.access_token;

		const deleteRes = await fetch(
			`https://${domain}/api/v2/users/${encodeURIComponent(auth0UserId)}`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);

		if (!deleteRes.ok) {
			const errText = await deleteRes.text();
			console.error("Auth0 delete user failed:", deleteRes.status, errText);
			throw new Error("Failed to delete user from Auth0");
		}
	},
});
