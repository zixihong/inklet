import type { AsciiData, ManualRegionConfig, RegionInfo } from "./types.js";
/**
 * Convert manual region definitions into a regionMap array.
 *
 * Supports two formats:
 * - `polygon`: array of [row, col] vertices — cells inside are filled via ray casting
 * - `cells`: explicit array of [row, col] pairs — from the paint-based editor
 */
export declare function buildRegionMap(data: AsciiData, config: ManualRegionConfig): {
    regionMap: (string | null)[];
    regions: RegionInfo[];
};
//# sourceMappingURL=regions.d.ts.map