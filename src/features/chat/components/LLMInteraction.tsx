import type { UIDataTypes, UIMessagePart, UITools } from "ai";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";

type Props = {
	parts: UIMessagePart<UIDataTypes, UITools>[];
};

const LLMInteraction = ({ parts }: Props) => {
	return (
		<div className="flex items-center justify-start">
			<div className="prose prose-invert max-w-none text-justify">
				{parts.map((part) => {
					switch (part.type) {
						case "text":
							return (
								<ReactMarkdown
									key={part.text + part.providerMetadata}
									components={{
										// Paragraphs with better spacing
										p({ children }) {
											return <p className="my-2 leading-relaxed">{children}</p>;
										},

										// Unordered lists
										ul({ children }) {
											return (
												<ul className="my-3 ml-6 space-y-2 list-disc">
													{children}
												</ul>
											);
										},

										// Ordered lists
										ol({ children }) {
											return (
												<ol className="my-3 ml-6 space-y-2 list-decimal">
													{children}
												</ol>
											);
										},

										// List items with custom bullets/styling
										li({ children }) {
											return (
												<li className="pl-2 marker:text-white-400">
													{children}
												</li>
											);
										},

										// Headers
										h2({ children }) {
											return (
												<h2 className="text-xl font-bold mt-8 mb-4 text-white-300">
													{children}
												</h2>
											);
										},

										h3({ children }) {
											return (
												<h3 className="text-lg font-semibold mt-6 mb-3 text-white-200">
													{children}
												</h3>
											);
										},
										hr() {
											return <hr className="border-white-500/50 my-5" />;
										},
										code({ className, children, ...props }) {
											const match = /language-(\w+)/.exec(className || "");
											const isInline = !match;
											return !isInline ? (
												<SyntaxHighlighter
													style={oneDark}
													language={match[1]}
													PreTag="div"
												>
													{String(children).replace(/\n$/, "")}
												</SyntaxHighlighter>
											) : (
												<code className={className} {...props}>
													{children}
												</code>
											);
										},
									}}
								>
									{part.text}
								</ReactMarkdown>
							);
						default:
							return null;
					}
				})}
			</div>
		</div>
	);
};

export default LLMInteraction;
