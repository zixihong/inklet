import type { AsciiData, GenerateOptions } from "./types.js";
/**
 * Convert an image to colored ASCII art data.
 *
 * @param input - File path or Buffer of the source image
 * @param options - Generation options
 * @returns AsciiData with characters, colors (palette + indices), and dimensions
 */
export declare function generateAscii(input: string | Buffer, options?: GenerateOptions): Promise<AsciiData>;
//# sourceMappingURL=generate.d.ts.map