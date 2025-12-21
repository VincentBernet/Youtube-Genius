import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/account")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<section className="relative py-20 px-6 text-center overflow-hidden">
			Hello "/demo/account"!
		</section>
	);
}
