import { PrefixAndSuffix, PreProcessor } from "../types";
import { generateRandomString } from "../../utils";
import Context from "../../context_detection";

const DATA_VIEW_REGEX = /```dataview(js){0,1}(.|\n)*?```/gm;
const UNIQUE_CURSOR = `${generateRandomString(16)}`;

class DataViewRemover implements PreProcessor {
    process(prefix: string, suffix: string, context: Context): PrefixAndSuffix {
        // Only process the last 5000 chars of prefix and first 5000 of suffix for dataview removal
        // to keep it performant while still being effective.
        const prefixWindow = prefix.slice(-5000);
        const suffixWindow = suffix.slice(0, 5000);
        const prefixRest = prefix.slice(0, -5000);
        const suffixRest = suffix.slice(5000);

        let text = prefixWindow + UNIQUE_CURSOR + suffixWindow;
        text = text.replace(DATA_VIEW_REGEX, "");
        const [prefixNewWindow, suffixNewWindow] = text.split(UNIQUE_CURSOR);

        return { prefix: prefixRest + prefixNewWindow, suffix: suffixNewWindow + suffixRest };
    }

    removesCursor(prefix: string, suffix: string): boolean {
        const prefixWindow = prefix.slice(-5000);
        const suffixWindow = suffix.slice(0, 5000);
        const text = prefixWindow + UNIQUE_CURSOR + suffixWindow;
        const dataviewAreasWithCursor = text
            .match(DATA_VIEW_REGEX)
            ?.filter((dataviewArea) => dataviewArea.includes(UNIQUE_CURSOR));

        if (
            dataviewAreasWithCursor !== undefined &&
            dataviewAreasWithCursor.length > 0
        ) {
            return true;
        }

        return false;
    }
}

export default DataViewRemover;
