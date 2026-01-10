import type { Doc, Id } from "convex/_generated/dataModel";
import { describe, expect, it } from "vitest";
import { convertToUIMessages } from "./utils";

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
});
