// src/features/chat/components/AnimatedTitle.tsx
import { motion } from "motion/react";

const sentenceVariants = {
	hidden: {},
	visible: { opacity: 1, transition: { staggerChildren: 0.02 } },
};

const letterVariants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { opacity: { duration: 0 } } },
};

type Props = {
	text: string;
	className?: string;
};

const AnimatedTitle = ({ text, className }: Props) => (
	<motion.span
		key={text}
		variants={sentenceVariants}
		initial="hidden"
		animate="visible"
		className={className}
	>
		{text.split("").map((char, i) => (
			<motion.span key={`${char}-${i}`} variants={letterVariants}>
				{char}
			</motion.span>
		))}
	</motion.span>
);

export default AnimatedTitle;
