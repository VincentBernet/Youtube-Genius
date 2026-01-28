import { useAuth0 } from "@auth0/auth0-react";
import { Globe, Mail, Shield, User } from "lucide-react";
import DangerZone from "@/features/account/components/DangerZone";
import InfoRow from "@/features/account/components/InfoRow";

const AccountPage = () => {
	const { user } = useAuth0();

	return (
		<div className="min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-3xl mx-auto space-y-8">
				{/* Profile Header Card */}
				<div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl">
					<div className="flex flex-col sm:flex-row items-center gap-6">
						{/* Avatar */}
						<div className="relative">
							{user?.picture ? (
								<img
									src={user.picture}
									alt={user.name || "Profile"}
									className="w-24 h-24 rounded-full ring-4 ring-cyan-500/30 shadow-lg shadow-cyan-500/20"
								/>
							) : (
								<div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center ring-4 ring-cyan-500/30">
									<User size={40} className="text-white" />
								</div>
							)}
							<div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-800" />
						</div>

						{/* Name & Email */}
						<div className="text-center sm:text-left flex-1">
							<h1 className="text-2xl font-bold text-white mb-1">
								{user?.name || "User"}
							</h1>
							<p className="text-slate-400 flex items-center justify-center sm:justify-start gap-2">
								<Mail size={16} />
								{user?.email}
							</p>
						</div>

						{/* Verified Badge */}
						{user?.email_verified && (
							<div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm">
								<Shield size={14} />
								<span>Verified</span>
							</div>
						)}
					</div>
				</div>

				{/* Info Cards Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Account Information */}
					<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
						<h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
							<User size={20} className="text-cyan-400" />
							Account Information
						</h2>
						<div className="space-y-4">
							<InfoRow label="Nickname" value={user?.nickname} />
							<InfoRow
								label="Last Updated"
								value={
									user?.updated_at
										? new Date(user.updated_at).toLocaleDateString()
										: undefined
								}
							/>
						</div>
					</div>

					{/* Preferences */}
					<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
						<h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
							<Globe size={20} className="text-cyan-400" />
							Preferences
						</h2>
						<div className="space-y-4">
							<InfoRow
								label="Language"
								value={user?.locale?.toUpperCase() || "EN"}
							/>
							<InfoRow
								label="Auth Provider"
								value={user?.sub?.split("|")[0] || "OAuth"}
							/>
						</div>
					</div>
				</div>
				<DangerZone />
			</div>
		</div>
	);
};

export default AccountPage;
