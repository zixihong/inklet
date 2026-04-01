#!/usr/bin/env node
import { parseArgs } from "node:util";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { generateAscii, launchEditor } from "../src/index.js";
const HELP = `
inklet — Convert images to colored ASCII art

Usage:
  inklet <input> [options]

Options:
  -w, --width <n>        Number of columns (default: 120)
  -o, --output <path>    Write raw ASCII data JSON to file
  -d, --output-dir <dir> Directory to save ascii-config.json (default: cwd)
  --chars <ramp>         Custom character density ramp
  --color-mode <mode>    color | grayscale | none (default: color)
  --invert               Invert luminance mapping
  --remove-bg            Remove background (bright/dark pixels become transparent)
  --aspect <n>           Character aspect ratio (default: 1.8)
  -p, --print            Print to terminal instead of opening editor
  -h, --help             Show this help message

Examples:
  inklet photo.png -w 100
  inklet photo.png -w 80 -d src/assets
  inklet photo.png --print
  inklet photo.png --print -o ascii.json
`.trim();
async function main() {
    const { values, positionals } = parseArgs({
        allowPositionals: true,
        options: {
            width: { type: "string", short: "w" },
            output: { type: "string", short: "o" },
            "output-dir": { type: "string", short: "d" },
            chars: { type: "string" },
            "color-mode": { type: "string" },
            invert: { type: "boolean", default: false },
            "remove-bg": { type: "boolean", default: false },
            aspect: { type: "string" },
            print: { type: "boolean", short: "p", default: false },
            editor: { type: "boolean", short: "e", default: false },
            help: { type: "boolean", short: "h", default: false },
        },
    });
    if (values.help || positionals.length === 0) {
        console.log(HELP);
        process.exit(0);
    }
    const inputPath = resolve(positionals[0]);
    const options = {};
    if (values.width)
        options.width = parseInt(values.width, 10);
    if (values.chars)
        options.characterSet = values.chars;
    if (values.aspect)
        options.charAspectRatio = parseFloat(values.aspect);
    if (values.invert)
        options.invert = true;
    if (values["remove-bg"])
        options.removeBackground = true;
    const cm = values["color-mode"];
    if (cm === "color" || cm === "grayscale" || cm === "none") {
        options.colorMode = cm;
    }
    const data = await generateAscii(inputPath, options);
    // --print: render to terminal with ANSI codes
    if (values.print) {
        for (let r = 0; r < data.rows; r++) {
            let line = "";
            for (let c = 0; c < data.cols; c++) {
                const i = r * data.cols + c;
                const char = data.chars[i];
                const hex = data.palette[data.colorIndices[i]];
                const cr = parseInt(hex.slice(1, 3), 16);
                const cg = parseInt(hex.slice(3, 5), 16);
                const cb = parseInt(hex.slice(5, 7), 16);
                line += `\x1b[38;2;${cr};${cg};${cb}m${char}`;
            }
            line += "\x1b[0m";
            console.log(line);
        }
        // If -o is also set alongside --print, write raw AsciiData JSON
        if (values.output) {
            const outPath = resolve(values.output);
            writeFileSync(outPath, JSON.stringify(data));
            const sizeMB = (JSON.stringify(data).length / 1024 / 1024).toFixed(2);
            console.log(`Written ${data.cols}x${data.rows} ASCII (${data.chars.length} chars, ${data.palette.length} colors) to ${outPath} (${sizeMB} MB)`);
        }
        return;
    }
    // -o without --print: write raw AsciiData JSON, then continue to editor
    if (values.output) {
        const outPath = resolve(values.output);
        writeFileSync(outPath, JSON.stringify(data));
        const sizeMB = (JSON.stringify(data).length / 1024 / 1024).toFixed(2);
        console.log(`Written ${data.cols}x${data.rows} ASCII (${data.chars.length} chars, ${data.palette.length} colors) to ${outPath} (${sizeMB} MB)`);
    }
    // Default: open editor
    const outputDir = values["output-dir"]
        ? resolve(values["output-dir"])
        : process.cwd();
    await launchEditor(data, { outputDir });
}
main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map