import { useMemo } from "react"
import type { AsciiData } from "../types.js"

export interface AsciiSpan {
  text: string
  color: string
  colStart: number
  region: string | null
}

/**
 * Groups consecutive characters with the same color AND region into spans.
 * Reduces DOM nodes by ~10x compared to one element per character.
 *
 * If a regionMap is provided, span boundaries also break on region changes
 * so each span belongs to exactly one region (or none).
 */
export function groupCharsIntoSpans(
  data: AsciiData,
  regionMap?: (string | null)[] | null
): AsciiSpan[][] {
  const rows: AsciiSpan[][] = []
  for (let r = 0; r < data.rows; r++) {
    const row: AsciiSpan[] = []
    const baseIdx = r * data.cols
    let currentColorIdx = data.colorIndices[baseIdx]
    let currentRegion = regionMap ? regionMap[baseIdx] : null
    let current: AsciiSpan = {
      text: data.chars[baseIdx],
      color: data.palette[currentColorIdx],
      colStart: 0,
      region: currentRegion,
    }

    for (let c = 1; c < data.cols; c++) {
      const idx = baseIdx + c
      const colorIdx = data.colorIndices[idx]
      const region = regionMap ? regionMap[idx] : null

      if (colorIdx === currentColorIdx && region === currentRegion) {
        current.text += data.chars[idx]
      } else {
        row.push(current)
        currentColorIdx = colorIdx
        currentRegion = region
        current = {
          text: data.chars[idx],
          color: data.palette[colorIdx],
          colStart: c,
          region,
        }
      }
    }
    row.push(current)
    rows.push(row)
  }
  return rows
}

/** React hook that memoizes span grouping for an AsciiData object */
export function useAsciiSpans(
  data: AsciiData,
  regionMap?: (string | null)[] | null
): AsciiSpan[][] {
  return useMemo(() => groupCharsIntoSpans(data, regionMap), [data, regionMap])
}
