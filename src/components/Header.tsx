import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import {
	LogIn,
	LogOut,
	Menu,
	Settings,
	TextSelect,
	User,
	X,
} from "lucide-react";
import { useState } from "react";

const Header = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { user, logout } = useAuth0();
	const { isLoading, isAuthenticated } = useConvexAuth();

	return (
		<>
			<header className="p-4 flex items-center bg-gray-800 text-white shadow-lg">
				<div className="flex items-center justify-between w-full">
					<button
						onClick={() => setIsOpen(true)}
						className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
						aria-label="Open menu"
						type="button"
					>
						<Menu size={24} />
					</button>
					{isAuthenticated && !isLoading ? (
						<div className="flex items-center gap-1">
							<Link
								to="/account"
								className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
								aria-label="Access account"
								activeProps={{
									className: "p-2 bg-gray-700 rounded-lg transition-colors",
								}}
							>
								{user?.picture ? (
									<img
										src={user?.picture}
										alt={user?.name}
										className="w-8 h-8 rounded-full"
									/>
								) : (
									<User size={24} />
								)}
							</Link>
							<button
								onClick={() => {
									console.log("Logging out");
									localStorage.clear();
									logout({
										logoutParams: {
											returnTo: `${window.location.origin}/loggedOut`,
										},
									});
								}}
								className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
								aria-label="Logout"
								type="button"
							>
								<LogOut size={24} />
							</button>
						</div>
					) : (
						<Link
							to="/"
							className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
							aria-label="Login"
						>
							<LogIn size={24} />
						</Link>
					)}
				</div>
			</header>

			<aside
				className={`fixed top-0 left-0 h-full w-80 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex items-center justify-between p-4 border-b border-gray-700">
					<h2 className="text-xl font-bold">Navigation</h2>
					<button
						onClick={() => setIsOpen(false)}
						className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
						aria-label="Close menu"
						type="button"
					>
						<X size={24} />
					</button>
				</div>

				<nav className="flex-1 p-4 overflow-y-auto">
					<Link
						to="/"
						onClick={() => setIsOpen(false)}
						className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
						activeProps={{
							className:
								"flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
						}}
					>
						<TextSelect size={20} />
						<span className="font-medium">Conversations</span>
					</Link>

					<Link
						to="/account"
						onClick={() => setIsOpen(false)}
						className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
						activeProps={{
							className:
								"flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
						}}
					>
						<Settings size={20} />
						<span className="font-medium">Preferences</span>
					</Link>
				</nav>
			</aside>
		</>
	);
};

export default Header;
