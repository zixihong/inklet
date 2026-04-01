/** Convert RGB values (0-255) to a hex color string */
export function hexFromRgb(r, g, b) {
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
/** Multiply each RGB channel by a factor, clamped to 255 */
export function boostColor(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const boost = (v) => Math.min(255, Math.round(v * factor));
    return hexFromRgb(boost(r), boost(g), boost(b));
}
/** Convert RGB to a single grayscale hex (luminance-based) */
export function toGrayscale(r, g, b) {
    const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    return hexFromRgb(lum, lum, lum);
}
/** Deduplicate a flat color array into a palette + index array */
export function buildPalette(rawColors) {
    const seen = new Map();
    const palette = [];
    const colorIndices = [];
    for (const hex of rawColors) {
        let idx = seen.get(hex);
        if (idx === undefined) {
            idx = palette.length;
            palette.push(hex);
            seen.set(hex, idx);
        }
        colorIndices.push(idx);
    }
    return { palette, colorIndices };
}
//# sourceMappingURL=color.js.map