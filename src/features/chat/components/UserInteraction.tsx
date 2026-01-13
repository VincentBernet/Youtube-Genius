import type { UIDataTypes, UIMessagePart, UITools } from "ai";
import { Fragment } from "react";

type Props = {
	parts: UIMessagePart<UIDataTypes, UITools>[];
};

const UserInteraction = ({ parts }: Props) => {
	return (
		<div className="flex items-center justify-end">
			<p className="bg-gray-700 rounded-full px-4 py-2">
				{parts.map((part) => {
					switch (part.type) {
						case "text":
							return (
								<Fragment key={part.text + part.providerMetadata}>
									{part.text}
								</Fragment>
							);
						default:
							return null;
					}
				})}
			</p>
		</div>
	);
};

export default UserInteraction;
