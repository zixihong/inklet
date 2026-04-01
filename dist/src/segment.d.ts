import type { AsciiData, SegmentOptions, SegmentResult } from "./types.js";
/**
 * Detect regions in ASCII data by flood-filling connected cells with similar colors.
 *
 * Cells that are background (transparent / very bright) or whitespace are skipped.
 * Remaining cells are grouped into connected components where every neighbor's color
 * is within `similarity` distance. Small clusters and overly elongated ones are pruned.
 */
export declare function segmentRegions(data: AsciiData, options?: SegmentOptions): SegmentResult;
//# sourceMappingURL=segment.d.ts.map