import type { AsciiData } from "../types.js";
export interface AsciiSpan {
    text: string;
    color: string;
    colStart: number;
    region: string | null;
}
/**
 * Groups consecutive characters with the same color AND region into spans.
 * Reduces DOM nodes by ~10x compared to one element per character.
 *
 * If a regionMap is provided, span boundaries also break on region changes
 * so each span belongs to exactly one region (or none).
 */
export declare function groupCharsIntoSpans(data: AsciiData, regionMap?: (string | null)[] | null): AsciiSpan[][];
/** React hook that memoizes span grouping for an AsciiData object */
export declare function useAsciiSpans(data: AsciiData, regionMap?: (string | null)[] | null): AsciiSpan[][];
//# sourceMappingURL=use-ascii-spans.d.ts.map