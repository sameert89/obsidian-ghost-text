import { generateRandomString } from "./utils";

const UNIQUE_CURSOR = `${generateRandomString(16)}`;
const HEADER_REGEX = `^#+\\s.*${UNIQUE_CURSOR}.*$`;
const UNORDERED_LIST_REGEX = `^\\s*(-|\\*)\\s.*${UNIQUE_CURSOR}.*$`;
const TASK_LIST_REGEX = `^\\s*(-|[0-9]+\\.) +\\[.\\]\\s.*${UNIQUE_CURSOR}.*$`;
const BLOCK_QUOTES_REGEX =`^\\s*>.*${UNIQUE_CURSOR}.*$`;
const NUMBERED_LIST_REGEX = `^\\s*\\d+\\.\\s.*${UNIQUE_CURSOR}.*$`
const MATH_BLOCK_REGEX = /\$\$[\s\S]*?\$\$/g;
const INLINE_MATH_BLOCK_REGEX = /\$[\s\S]*?\$/g;
const CODE_BLOCK_REGEX = /```[\s\S]*?```/g;
const INLINE_CODE_BLOCK_REGEX = /`.*`/g;

enum Context {
    Text = "Text",
    Heading = "Heading",
    BlockQuotes = "BlockQuotes",
    UnorderedList = "UnorderedList",
    NumberedList = "NumberedList",
    CodeBlock = "CodeBlock",
    MathBlock = "MathBlock",
    TaskList = "TaskList",
}

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Context {
    export function values(): Array<Context> {
        return Object.values(Context).filter(
            (value) => typeof value === "string"
        ) as Array<Context>;
    }

    export function getContext(prefix: string, suffix: string): Context {
        // Only look at a window around the cursor for performance.
        const prefixWindow = prefix.slice(-1000);
        const suffixWindow = suffix.slice(0, 1000);
        const textWindow = prefixWindow + UNIQUE_CURSOR + suffixWindow;

        if (new RegExp(HEADER_REGEX, "gm").test(textWindow)) {
            return Context.Heading;
        }
        if (new RegExp(BLOCK_QUOTES_REGEX,"gm").test(textWindow)) {
            return Context.BlockQuotes;
        }

        if (new RegExp(TASK_LIST_REGEX, "gm").test(textWindow)) {
            return Context.TaskList;
        }

        if (
            isCursorInRegexBlock(prefixWindow, suffixWindow, MATH_BLOCK_REGEX) ||
            isCursorInRegexBlock(prefixWindow, suffixWindow, INLINE_MATH_BLOCK_REGEX)
        ) {
            return Context.MathBlock;
        }

        if (isCursorInRegexBlock(prefixWindow, suffixWindow, CODE_BLOCK_REGEX) || isCursorInRegexBlock(prefixWindow, suffixWindow, INLINE_CODE_BLOCK_REGEX)) {
            return Context.CodeBlock;
        }
        if (new RegExp(NUMBERED_LIST_REGEX, "gm").test(textWindow)) {
            return Context.NumberedList;
        }
        if (new RegExp(UNORDERED_LIST_REGEX, "gm").test(textWindow)) {
            return Context.UnorderedList;
        }

        return Context.Text;
    }

    export function get(value: string) {
        for (const context of Context.values()) {
            if (value === context) {
                return context;
            }
        }
        return undefined;
    }
}

function isCursorInRegexBlock(
    prefix: string,
    suffix: string,
    regex: RegExp
): boolean {
    const text = prefix + UNIQUE_CURSOR + suffix;
    const codeBlocks = extractBlocks(text, regex);
    for (const block of codeBlocks) {
        if (block.includes(UNIQUE_CURSOR)) {
            return true;
        }
    }
    return false;
}

function extractBlocks(text: string, regex: RegExp) {
    const codeBlocks = text.match(regex);
    return codeBlocks ? codeBlocks.map((block) => block.trim()) : [];
}

export default Context;
