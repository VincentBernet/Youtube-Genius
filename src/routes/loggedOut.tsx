import { createFileRoute } from "@tanstack/react-router";
import LoggedOutPage from "@/features/auth/LoggedOutPage";

export const Route = createFileRoute("/loggedOut")({
	component: LoggedOutPage,
});
