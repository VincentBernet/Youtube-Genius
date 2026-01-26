import { useHotkeys } from "react-hotkeys-hook";

type UseKeyboardOptions = {
	key: string;
	callback: () => void;
	enabled?: boolean;
	preventDefault?: boolean;
};

export const useKeyboard = ({
	key,
	callback,
	enabled = true,
	preventDefault = true,
}: UseKeyboardOptions) => {
	useHotkeys(
		key,
		callback,
		{
			enabled,
			preventDefault,
		},
		[callback, enabled],
	);
};
