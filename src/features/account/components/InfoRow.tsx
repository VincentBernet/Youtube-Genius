const InfoRow = ({
	label,
	value,
}: {
	label: string;
	value: string | undefined | null;
}) => {
	return (
		<div className="flex flex-col">
			<span className="text-slate-500 text-xs uppercase tracking-wider mb-1">
				{label}
			</span>
			<span className="text-white">{value || "—"}</span>
		</div>
	);
};

export default InfoRow;
