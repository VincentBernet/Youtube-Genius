import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import Loading from "@/commons/components/Loading";

const IndexPage = () => {
	const { isLoading } = useConvexAuth();

	// Wait for auth state to settle before redirecting
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loading />
			</div>
		);
	}

	// Once auth state is ready, redirect to chat
	return <Navigate to="/chat" />;
};

export const Route = createFileRoute("/")({
	component: IndexPage,
});
