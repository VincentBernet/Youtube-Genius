import { useAuth0 } from "@auth0/auth0-react";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "../../../convex/_generated/api";

const App = () => {
	const { data } = useSuspenseQuery(convexQuery(api.tasks.get, {}));
	const { loginWithRedirect } = useAuth0();
	return (
		<section className="relative py-20 px-6 text-center overflow-hidden">
			Time to learn 📚
			<div>
				{data.map(({ _id, text }) => (
					<div key={_id}>{text}</div>
				))}
			</div>
			<button onClick={() => loginWithRedirect()} type="button">
				Log in
			</button>
		</section>
	);
};

export const Route = createFileRoute("/_authenticated/")({
	component: App,
});
