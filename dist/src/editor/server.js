import { createServer } from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { exec } from "node:child_process";
import { platform } from "node:os";
export async function launchEditor(data, options = {}) {
    const { port = 0, outputDir = process.cwd() } = options;
    // Read the template HTML file (relative to this compiled JS file's location)
    // When compiled, this file is at dist/src/editor/server.js
    // The template.html stays in src/editor/template.html but we need to read it
    // Since we bundle the template, we read it using import.meta
    const templatePath = resolve(import.meta.dirname, "template.html");
    // For the compiled version, template.html needs to be copied to dist or read from src.
    // Simplest: read from the source directory. We'll try multiple locations.
    let templateHtml;
    try {
        templateHtml = readFileSync(templatePath, "utf-8");
    }
    catch {
        // Fallback: try relative to project root
        const fallbackPath = resolve(import.meta.dirname, "../../../src/editor/template.html");
        templateHtml = readFileSync(fallbackPath, "utf-8");
    }
    // Inject ASCII data into the template
    const dataScript = `<script>window.__ASCII_DATA__ = ${JSON.stringify(data)};window.__OUTPUT_DIR__ = ${JSON.stringify(outputDir)};</script>`;
    const html = templateHtml.replace("</head>", `${dataScript}\n</head>`);
    return new Promise((resolvePromise) => {
        const server = createServer((req, res) => {
            if (req.method === "POST" && req.url === "/api/save") {
                let body = "";
                req.on("data", (chunk) => { body += chunk.toString(); });
                req.on("end", () => {
                    try {
                        const { regionConfig, savePath } = JSON.parse(body);
                        const config = { data, regionConfig };
                        const outPath = savePath
                            ? resolve(outputDir, savePath)
                            : resolve(outputDir, "ascii-config.json");
                        writeFileSync(outPath, JSON.stringify(config, null, 2));
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ ok: true, path: outPath }));
                        console.log(`  Saved ${outPath}`);
                    }
                    catch (err) {
                        res.writeHead(500, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ ok: false, error: err.message }));
                    }
                });
                return;
            }
            if (req.url === "/" || req.url === "/index.html") {
                res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                res.end(html);
            }
            else if (req.url === "/api/data") {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(data));
            }
            else {
                res.writeHead(404);
                res.end("Not found");
            }
        });
        server.listen(port, () => {
            const addr = server.address();
            if (!addr || typeof addr === "string")
                return;
            const actualPort = addr.port;
            const url = `http://localhost:${actualPort}`;
            console.log(`\n  Region editor running at ${url}`);
            console.log("  Press Ctrl+C to stop\n");
            // Open browser
            const cmd = platform() === "darwin" ? "open" :
                platform() === "win32" ? "start" :
                    "xdg-open";
            exec(`${cmd} ${url}`, () => {
                // Silently ignore errors (e.g., no display in CI)
            });
        });
        // Keep the process alive until Ctrl+C
        process.on("SIGINT", () => {
            server.close();
            resolvePromise();
            process.exit(0);
        });
    });
}
//# sourceMappingURL=server.js.map