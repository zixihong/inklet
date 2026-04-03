import { createServer } from "node:http"
import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { exec } from "node:child_process"
import { platform } from "node:os"
import { generateAscii } from "../generate.js"
import type { AsciiData, GenerateOptions } from "../types.js"

export interface EditorOptions {
  port?: number
  outputDir?: string  // directory to write files into (default: process.cwd())
  /** Original image path or buffer — enables live regeneration in the editor */
  imageInput?: string | Buffer
  /** Base generation options — editor toggles override these */
  generateOptions?: GenerateOptions
}

export async function launchEditor(
  data: AsciiData,
  options: EditorOptions = {}
): Promise<void> {
  const { port = 0, outputDir = process.cwd(), imageInput, generateOptions = {} } = options

  // When compiled, this file is at dist/src/editor/server.js
  // The template ships at src/editor/template.html (package root)
  // Both paths are 3 levels up from this file to the package root
  const packageRoot = resolve(import.meta.dirname, "../../..")
  const templateHtml = readFileSync(resolve(packageRoot, "src/editor/template.html"), "utf-8")

  // Inject ASCII data into the template
  let currentData = data
  const canRegenerate = !!imageInput
  const initialToggles = {
    removeBackground: generateOptions.removeBackground ?? false,
    invert: generateOptions.invert ?? false,
    colorMode: generateOptions.colorMode ?? "color",
  }
  const dataScript = `<script>window.__ASCII_DATA__ = ${JSON.stringify(data)};window.__OUTPUT_DIR__ = ${JSON.stringify(outputDir)};window.__CAN_REGENERATE__ = ${canRegenerate};window.__INITIAL_TOGGLES__ = ${JSON.stringify(initialToggles)};</script>`
  const html = templateHtml.replace("</head>", `${dataScript}\n</head>`)

  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      if (req.method === "POST" && req.url === "/api/save") {
        let body = ""
        req.on("data", (chunk: Buffer) => { body += chunk.toString() })
        req.on("end", () => {
          try {
            const { regionConfig, savePath } = JSON.parse(body)
            const config = { data: currentData, regionConfig }
            const outPath = savePath
              ? resolve(outputDir, savePath)
              : resolve(outputDir, "ascii-config.json")
            writeFileSync(outPath, JSON.stringify(config, null, 2))
            res.writeHead(200, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ ok: true, path: outPath }))
            console.log(`  Saved ${outPath}`)
          } catch (err: any) {
            res.writeHead(500, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ ok: false, error: err.message }))
          }
        })
        return
      }

      if (req.method === "POST" && req.url === "/api/regenerate") {
        if (!imageInput) {
          res.writeHead(400, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ ok: false, error: "No image input available for regeneration" }))
          return
        }
        let body = ""
        req.on("data", (chunk: Buffer) => { body += chunk.toString() })
        req.on("end", async () => {
          try {
            const overrides = JSON.parse(body) as Partial<GenerateOptions>
            const opts: GenerateOptions = { ...generateOptions, ...overrides }
            currentData = await generateAscii(imageInput, opts)
            res.writeHead(200, { "Content-Type": "application/json" })
            res.end(JSON.stringify(currentData))
          } catch (err: any) {
            res.writeHead(500, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ ok: false, error: err.message }))
          }
        })
        return
      }

      if (req.url === "/" || req.url === "/index.html") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
        res.end(html)
      } else if (req.url === "/api/data") {
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(currentData))
      } else {
        res.writeHead(404)
        res.end("Not found")
      }
    })

    server.listen(port, () => {
      const addr = server.address()
      if (!addr || typeof addr === "string") return
      const actualPort = addr.port
      const url = `http://localhost:${actualPort}`

      console.log(`\n  Region editor running at ${url}`)
      console.log("  Press Ctrl+C to stop\n")

      // Open browser
      const cmd =
        platform() === "darwin" ? "open" :
        platform() === "win32" ? "start" :
        "xdg-open"
      exec(`${cmd} ${url}`, () => {
        // Silently ignore errors (e.g., no display in CI)
      })
    })

    // Keep the process alive until Ctrl+C
    process.on("SIGINT", () => {
      server.close()
      resolvePromise()
      process.exit(0)
    })
  })
}
