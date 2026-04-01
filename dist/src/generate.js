import sharp from "sharp";
import { DEFAULT_RAMP } from "./ramps.js";
import { hexFromRgb, toGrayscale, buildPalette } from "./color.js";
/**
 * Convert an image to colored ASCII art data.
 *
 * @param input - File path or Buffer of the source image
 * @param options - Generation options
 * @returns AsciiData with characters, colors (palette + indices), and dimensions
 */
export async function generateAscii(input, options = {}) {
    const { width: cols = 120, characterSet: ramp = DEFAULT_RAMP, charAspectRatio = 1.8, colorMode = "color", invert = false, crop, removeBackground = false, backgroundThreshold = 210, backgroundDarkThreshold = 15, } = options;
    let pipeline = sharp(input);
    const metadata = await pipeline.metadata();
    const imgWidth = metadata.width;
    const imgHeight = metadata.height;
    // Apply optional crop
    if (crop) {
        pipeline = pipeline.extract({
            left: crop.left,
            top: crop.top,
            width: crop.width,
            height: crop.height,
        });
    }
    // Calculate row count from aspect ratio
    const srcWidth = crop ? crop.width : imgWidth;
    const srcHeight = crop ? crop.height : imgHeight;
    const cellWidth = srcWidth / cols;
    const cellHeight = cellWidth * charAspectRatio;
    const rows = Math.floor(srcHeight / cellHeight);
    // Resize and extract raw RGBA pixels
    const { data, info } = await pipeline
        .resize(cols, rows, { fit: "fill" })
        .raw()
        .ensureAlpha()
        .toBuffer({ resolveWithObject: true });
    const totalPixels = info.width * info.height;
    const chars = new Array(totalPixels);
    const rawColors = new Array(totalPixels);
    for (let i = 0; i < totalPixels; i++) {
        const offset = i * 4;
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];
        const a = data[offset + 3];
        // Transparent pixels become spaces
        if (a < 30) {
            chars[i] = " ";
            rawColors[i] = "#000000";
            continue;
        }
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        // Remove background pixels (too bright or too dark)
        if (removeBackground && (lum > backgroundThreshold || lum < backgroundDarkThreshold)) {
            chars[i] = " ";
            rawColors[i] = "#000000";
            continue;
        }
        // Map luminance to ASCII character
        let charIndex = Math.floor((lum / 255) * (ramp.length - 1));
        if (invert) {
            charIndex = ramp.length - 1 - charIndex;
        }
        chars[i] = ramp[charIndex];
        // Determine color based on mode
        if (colorMode === "color") {
            rawColors[i] = hexFromRgb(r, g, b);
        }
        else if (colorMode === "grayscale") {
            rawColors[i] = toGrayscale(r, g, b);
        }
        else {
            rawColors[i] = "#ffffff";
        }
    }
    const { palette, colorIndices } = buildPalette(rawColors);
    return {
        cols: info.width,
        rows: info.height,
        chars: chars.join(""),
        palette,
        colorIndices,
    };
}
//# sourceMappingURL=generate.js.map