/** Convert RGB values (0-255) to a hex color string */
export declare function hexFromRgb(r: number, g: number, b: number): string;
/** Multiply each RGB channel by a factor, clamped to 255 */
export declare function boostColor(hex: string, factor: number): string;
/** Convert RGB to a single grayscale hex (luminance-based) */
export declare function toGrayscale(r: number, g: number, b: number): string;
/** Deduplicate a flat color array into a palette + index array */
export declare function buildPalette(rawColors: string[]): {
    palette: string[];
    colorIndices: number[];
};
//# sourceMappingURL=color.d.ts.map