import type { Doc, Id } from "convex/_generated/dataModel";
import { describe, expect, it } from "vitest";
import {
	convertToUIMessages,
	extractVideoId,
	getRows,
	MAX_ROWS_INPUT,
	type UIMessageWithSystem,
} from "./utils";

const createMockMessage = (
	overrides: Partial<Doc<"messages">> & {
		_id: Id<"messages">;
		role: Doc<"messages">["role"];
		content: string;
		createdAt: number;
	},
): Doc<"messages"> => ({
	_creationTime: overrides.createdAt,
	conversationId: "conv1" as Id<"conversations">,
	...overrides,
});

describe("convertToUIMessages", () => {
	it("should convert an empty array to an empty array", () => {
		const result = convertToUIMessages([]);
		expect(result).toEqual([]);
	});

	it("should convert a single message correctly", () => {
		const dbMessages: Doc<"messages">[] = [
			createMockMessage({
				_id: "msg1" as Id<"messages">,
				role: "user",
				content: "Hello, world!",
				createdAt: 1704067200000,
			}),
		];

		const result = convertToUIMessages(dbMessages);

		expect(result).toHaveLength(1);
		expect(result[0].id).toBe("msg1");
		expect(result[0].role).toBe("user");
		expect(result[0].parts).toHaveLength(1);
		expect(result[0].parts[0]).toEqual({ type: "text", text: "Hello, world!" });
	});

	it("should convert multiple messages preserving order", () => {
		const dbMessages: Doc<"messages">[] = [
			createMockMessage({
				_id: "msg1" as Id<"messages">,
				role: "user",
				content: "What is TypeScript?",
				createdAt: 1704067200000,
			}),
			createMockMessage({
				_id: "msg2" as Id<"messages">,
				role: "assistant",
				content: "TypeScript is a typed superset of JavaScript.",
				createdAt: 1704067260000,
			}),
		];

		const result = convertToUIMessages(dbMessages);

		expect(result).toHaveLength(2);
		expect(result[0].role).toBe("user");
		expect(result[1].role).toBe("assistant");
		expect(result[0].parts[0]).toEqual({
			type: "text",
			text: "What is TypeScript?",
		});
		expect(result[1].parts[0]).toEqual({
			type: "text",
			text: "TypeScript is a typed superset of JavaScript.",
		});
	});

	it("should create Date objects from timestamps", () => {
		const timestamp = 1704067200000; // 2024-01-01 00:00:00 UTC
		const dbMessages: Doc<"messages">[] = [
			createMockMessage({
				_id: "msg1" as Id<"messages">,
				role: "user",
				content: "Test message",
				createdAt: timestamp,
			}),
		];

		const result = convertToUIMessages(dbMessages);
		// Access createdAt via type assertion since UIMessage type may not expose it
		const createdAt = (result[0] as unknown as { createdAt: Date }).createdAt;

		expect(createdAt).toBeInstanceOf(Date);
		expect(createdAt.getTime()).toBe(timestamp);
	});

	it("should set parts array with text type", () => {
		const dbMessages: Doc<"messages">[] = [
			createMockMessage({
				_id: "msg1" as Id<"messages">,
				role: "assistant",
				content: "Here is some **markdown** content",
				createdAt: 1704067200000,
			}),
		];

		const result = convertToUIMessages(dbMessages);

		expect(result[0].parts).toHaveLength(1);
		expect(result[0].parts[0]).toEqual({
			type: "text",
			text: "Here is some **markdown** content",
		});
	});

	describe("systemMessage", () => {
		it("should include systemMessage: true when db message has systemMessage: true", () => {
			const dbMessages: Doc<"messages">[] = [
				createMockMessage({
					_id: "msg1" as Id<"messages">,
					role: "user",
					content: "Summarize the video",
					createdAt: 1704067200000,
					systemMessage: true,
				}),
			];

			const result = convertToUIMessages(dbMessages);

			expect(result).toHaveLength(1);
			expect((result[0] as UIMessageWithSystem).systemMessage).toBe(true);
		});

		it("should include systemMessage: false when db message has systemMessage: false", () => {
			const dbMessages: Doc<"messages">[] = [
				createMockMessage({
					_id: "msg1" as Id<"messages">,
					role: "user",
					content: "User typed this",
					createdAt: 1704067200000,
					systemMessage: false,
				}),
			];

			const result = convertToUIMessages(dbMessages);

			expect(result).toHaveLength(1);
			expect((result[0] as UIMessageWithSystem).systemMessage).toBe(false);
		});

		it("should omit systemMessage when db message has no systemMessage field", () => {
			const dbMessages: Doc<"messages">[] = [
				createMockMessage({
					_id: "msg1" as Id<"messages">,
					role: "user",
					content: "Legacy message",
					createdAt: 1704067200000,
				}),
			];

			const result = convertToUIMessages(dbMessages);

			expect(result).toHaveLength(1);
			expect("systemMessage" in result[0]).toBe(false);
		});

		it("should preserve systemMessage per message in multiple messages", () => {
			const dbMessages: Doc<"messages">[] = [
				createMockMessage({
					_id: "msg1" as Id<"messages">,
					role: "user",
					content: "Summarize the video",
					createdAt: 1704067200000,
					systemMessage: true,
				}),
				createMockMessage({
					_id: "msg2" as Id<"messages">,
					role: "assistant",
					content: "Here is the summary.",
					createdAt: 1704067260000,
				}),
				createMockMessage({
					_id: "msg3" as Id<"messages">,
					role: "user",
					content: "Follow-up question",
					createdAt: 1704067320000,
					systemMessage: false,
				}),
			];

			const result = convertToUIMessages(dbMessages);

			expect((result[0] as UIMessageWithSystem).systemMessage).toBe(true);
			expect("systemMessage" in result[1]).toBe(false);
			expect((result[2] as UIMessageWithSystem).systemMessage).toBe(false);
		});
	});
});

describe("extractVideoId", () => {
	it("should extract video ID from standard watch URL", () => {
		const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
		expect(extractVideoId(url)).toBe("dQw4w9WgXcQ");
	});

	it("should extract video ID from watch URL with additional parameters", () => {
		const url =
			"https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120s&list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf";
		expect(extractVideoId(url)).toBe("dQw4w9WgXcQ");
	});

	it("should extract video ID from short youtu.be URL", () => {
		const url = "https://youtu.be/dQw4w9WgXcQ";
		expect(extractVideoId(url)).toBe("dQw4w9WgXcQ");
	});

	it("should extract video ID from youtu.be URL with timestamp", () => {
		const url = "https://youtu.be/dQw4w9WgXcQ?t=42";
		expect(extractVideoId(url)).toBe("dQw4w9WgXcQ");
	});

	it("should extract video ID from embed URL", () => {
		const url = "https://www.youtube.com/embed/dQw4w9WgXcQ";
		expect(extractVideoId(url)).toBe("dQw4w9WgXcQ");
	});

	it("should extract video ID from shorts URL", () => {
		const url = "https://www.youtube.com/shorts/abc123XYZ";
		expect(extractVideoId(url)).toBe("abc123XYZ");
	});

	it("should extract video ID from URL without www", () => {
		const url = "https://youtube.com/watch?v=dQw4w9WgXcQ";
		expect(extractVideoId(url)).toBe("dQw4w9WgXcQ");
	});

	it("should extract video ID from URL without https", () => {
		const url = "youtube.com/watch?v=dQw4w9WgXcQ";
		expect(extractVideoId(url)).toBe("dQw4w9WgXcQ");
	});

	it("should return null for invalid YouTube URL", () => {
		const url = "https://vimeo.com/123456789";
		expect(extractVideoId(url)).toBeNull();
	});

	it("should return null for empty string", () => {
		expect(extractVideoId("")).toBeNull();
	});

	it("should return null for random string", () => {
		expect(extractVideoId("not a url at all")).toBeNull();
	});

	it("should return null for YouTube URL without video ID", () => {
		const url = "https://www.youtube.com/";
		expect(extractVideoId(url)).toBeNull();
	});

	it("should return 8ZoQ7wh9pSQ", () => {
		const url = "https://www.youtube.com/watch/8ZoQ7wh9pSQ";
		expect(extractVideoId(url)).toBe("8ZoQ7wh9pSQ");
	});
});

describe("getRows", () => {
	it("should return 1 for empty string", () => {
		expect(getRows("")).toBe(1);
	});

	it("should return 1 for single line text under 100 characters", () => {
		expect(getRows("Hello, world!")).toBe(1);
	});

	it("should return 2 for text with 1 line break", () => {
		expect(getRows("Hello\nworld")).toBe(2);
	});

	it("should return 3 for text with 2 line breaks", () => {
		expect(getRows("Line 1\nLine 2\nLine 3")).toBe(3);
	});

	it("should return 6 for text with 5 line breaks", () => {
		expect(getRows("1\n2\n3\n4\n5\n6")).toBe(6);
	});

	it("should return 10 for text with 9 line breaks (maximum)", () => {
		expect(getRows("1\n2\n3\n4\n5\n6\n7\n8\n9\n10")).toBe(10);
	});

	it(`should cap at ${MAX_ROWS_INPUT} for text with more than 9 line breaks`, () => {
		expect(getRows("1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12")).toBe(
			MAX_ROWS_INPUT,
		);
	});

	it("should count only line breaks for input with only newlines", () => {
		expect(getRows("\n\n\n")).toBe(4);
	});

	it("should handle Windows-style line endings (counts only \\n)", () => {
		expect(getRows("Hello\r\nworld")).toBe(2);
	});

	describe("character-based row calculation (100 chars per line)", () => {
		it("should return 2 for exactly 100 characters (no line breaks)", () => {
			const input = "a".repeat(100);
			expect(getRows(input)).toBe(2);
		});

		it("should return 2 for 101-199 characters (no line breaks)", () => {
			const input = "a".repeat(150);
			expect(getRows(input)).toBe(2);
		});

		it("should return 3 for 200 characters (no line breaks)", () => {
			const input = "a".repeat(200);
			expect(getRows(input)).toBe(3);
		});

		it("should combine character count and line breaks", () => {
			// 100 chars + 1 newline = floor(101/100) + 1 = 1 + 1 = 2, result = 3
			const input = `${"a".repeat(100)}\n`;
			expect(getRows(input)).toBe(3);
		});

		it(`should cap at ${MAX_ROWS_INPUT} even with many characters`, () => {
			const input = "a".repeat(2000);
			expect(getRows(input)).toBe(MAX_ROWS_INPUT);
		});
	});
});
