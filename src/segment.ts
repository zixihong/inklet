import type { AsciiData, SegmentOptions, SegmentResult, RegionInfo } from "./types.js"
import { hexFromRgb } from "./color.js"

/** Parse "#rrggbb" into [r, g, b] (0–255) */
function parseHex(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

/** Normalized Euclidean distance in RGB space (0–1) */
function colorDistance(a: [number, number, number], b: [number, number, number]): number {
  const dr = (a[0] - b[0]) / 255
  const dg = (a[1] - b[1]) / 255
  const db = (a[2] - b[2]) / 255
  return Math.sqrt((dr * dr + dg * dg + db * db) / 3)
}

/** Luminance (0–255) from RGB */
function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

/**
 * Detect regions in ASCII data by flood-filling connected cells with similar colors.
 *
 * Cells that are background (transparent / very bright) or whitespace are skipped.
 * Remaining cells are grouped into connected components where every neighbor's color
 * is within `similarity` distance. Small clusters and overly elongated ones are pruned.
 */
export function segmentRegions(
  data: AsciiData,
  options: SegmentOptions = {}
): SegmentResult {
  const {
    similarity = 0.15,
    minSize = 20,
    maxAspectRatio = Infinity,
    charAspectRatio = 1.8,
    backgroundThreshold = 250,
    backgroundDarkThreshold = 15,
  } = options

  const { cols, rows, chars, palette, colorIndices } = data
  const total = cols * rows

  // Pre-parse palette into RGB tuples
  const paletteRgb: [number, number, number][] = palette.map(parseHex)

  // Mark background cells (whitespace or bright)
  const isBackground = new Uint8Array(total)
  for (let i = 0; i < total; i++) {
    if (chars[i] === " ") {
      isBackground[i] = 1
      continue
    }
    const rgb = paletteRgb[colorIndices[i]]
    const lum = luminance(rgb[0], rgb[1], rgb[2])
    if (lum > backgroundThreshold || lum < backgroundDarkThreshold) {
      isBackground[i] = 1
    }
  }

  // Flood-fill connected components by color similarity
  const visited = new Uint8Array(total)
  const clusters: number[][] = []

  for (let i = 0; i < total; i++) {
    if (visited[i] || isBackground[i]) continue
    visited[i] = 1

    const queue = [i]
    const cluster: number[] = []
    let head = 0

    while (head < queue.length) {
      const idx = queue[head++]
      cluster.push(idx)
      const row = (idx / cols) | 0
      const col = idx % cols
      const rgb = paletteRgb[colorIndices[idx]]

      // 8-connectivity neighbors
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          const nr = row + dr
          const nc = col + dc
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
          const ni = nr * cols + nc
          if (visited[ni] || isBackground[ni]) continue

          const nrgb = paletteRgb[colorIndices[ni]]
          if (colorDistance(rgb, nrgb) <= similarity) {
            visited[ni] = 1
            queue.push(ni)
          }
        }
      }
    }

    if (cluster.length >= minSize) {
      clusters.push(cluster)
    }
  }

  // Build region metadata and filter by aspect ratio
  const regionMap: (string | null)[] = new Array(total).fill(null)
  const regionsOut: RegionInfo[] = []
  let regionIndex = 0

  for (const cluster of clusters) {
    let minR = Infinity, maxR = 0, minC = Infinity, maxC = 0
    let rSum = 0, gSum = 0, bSum = 0

    for (const idx of cluster) {
      const row = (idx / cols) | 0
      const col = idx % cols
      if (row < minR) minR = row
      if (row > maxR) maxR = row
      if (col < minC) minC = col
      if (col > maxC) maxC = col
      const rgb = paletteRgb[colorIndices[idx]]
      rSum += rgb[0]
      gSum += rgb[1]
      bSum += rgb[2]
    }

    // Aspect ratio check (accounting for character aspect ratio)
    const bboxH = (maxR - minR + 1) * charAspectRatio
    const bboxW = maxC - minC + 1
    const aspect = Math.max(bboxH, bboxW) / Math.min(bboxH, bboxW)
    if (aspect > maxAspectRatio) continue

    regionIndex++
    const id = `region-${regionIndex}`

    for (const idx of cluster) {
      regionMap[idx] = id
    }

    const n = cluster.length
    regionsOut.push({
      id,
      size: n,
      bounds: { minRow: minR, maxRow: maxR, minCol: minC, maxCol: maxC },
      averageColor: hexFromRgb(
        Math.round(rSum / n),
        Math.round(gSum / n),
        Math.round(bSum / n)
      ),
    })
  }

  return { regionMap, regions: regionsOut }
}
