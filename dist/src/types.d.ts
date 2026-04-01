export interface AsciiData {
    /** Number of columns in the ASCII grid */
    cols: number;
    /** Number of rows in the ASCII grid */
    rows: number;
    /** Flat row-major string of ASCII characters (length = cols * rows) */
    chars: string;
    /** Deduplicated array of hex color strings */
    palette: string[];
    /** Index into palette for each character (length = cols * rows) */
    colorIndices: number[];
}
export interface GenerateOptions {
    /** Number of columns in the output (default: 120) */
    width?: number;
    /** Character density ramp from darkest to lightest (default: 70-char detailed ramp) */
    characterSet?: string;
    /** Height-to-width ratio of the target monospace font (default: 1.8) */
    charAspectRatio?: number;
    /** Color output mode (default: 'color') */
    colorMode?: "color" | "grayscale" | "none";
    /** Invert luminance mapping — light pixels get dense chars (default: false) */
    invert?: boolean;
    /** Crop the source image before processing (in pixels) */
    crop?: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    /** Remove background pixels — replaces bright and dark pixels with transparent spaces (default: false) */
    removeBackground?: boolean;
    /** Luminance above this is considered background when removeBackground is true (default: 210) */
    backgroundThreshold?: number;
    /** Luminance below this is considered background when removeBackground is true (default: 15) */
    backgroundDarkThreshold?: number;
}
export interface CharInfo {
    row: number;
    col: number;
    char: string;
    color: string;
    region: string | null;
}
export interface SegmentOptions {
    /** Max color distance (0–1) for two pixels to be considered "similar" (default: 0.15) */
    similarity?: number;
    /** Minimum number of cells for a region to be kept (default: 20) */
    minSize?: number;
    /** Discard regions whose bounding-box aspect ratio exceeds this (default: Infinity) */
    maxAspectRatio?: number;
    /** Character aspect ratio for accurate bounding-box measurement (default: 1.8) */
    charAspectRatio?: number;
    /** Luminance threshold (0–255) — pixels brighter than this are treated as background (default: 250) */
    backgroundThreshold?: number;
    /** Luminance threshold (0–255) — pixels darker than this are treated as background (default: 15) */
    backgroundDarkThreshold?: number;
}
export interface RegionInfo {
    /** Unique region identifier, e.g. "region-1" */
    id: string;
    /** Number of cells in this region */
    size: number;
    /** Bounding box */
    bounds: {
        minRow: number;
        maxRow: number;
        minCol: number;
        maxCol: number;
    };
    /** Average hex color of the region */
    averageColor: string;
}
export interface SegmentResult {
    /** Region ID per character (null = no region), length = cols * rows */
    regionMap: (string | null)[];
    /** Metadata for each detected region */
    regions: RegionInfo[];
}
export interface ManualRegion {
    id: string;
    label: string;
    /** Polygon vertices [row, col] — cells inside are filled via ray casting */
    polygon?: [number, number][];
    /** Explicit cell list [row, col] */
    cells?: [number, number][];
    /** Run-length encoded cells [row, startCol, endCol] — compact format from editor */
    runs?: [number, number, number][];
}
export interface ManualRegionConfig {
    regions: ManualRegion[];
}
export interface AsciiConfig {
    /** The generated ASCII art data */
    data: AsciiData;
    /** Region definitions from the editor */
    regionConfig: ManualRegionConfig;
}
//# sourceMappingURL=types.d.ts.map