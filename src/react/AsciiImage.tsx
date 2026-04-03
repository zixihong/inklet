import { useCallback, useMemo, useRef, useState } from "react"
import type { AsciiConfig, AsciiData, CharInfo, RegionInfo } from "../types.js"
import { buildRegionMap } from "../regions.js"
import { boostColor } from "../color.js"
import { useAsciiSpans } from "./use-ascii-spans.js"
import type { AsciiSpan } from "./use-ascii-spans.js"

export interface RegionHoverEffect {
  /** Override color for the entire region on hover (default: "#ffffff") */
  color?: string
  /** Color brightness multiplier applied on hover (overrides `color` if both set) */
  colorBoost?: number
  /** Add underline decoration on hover */
  underline?: boolean
  /** Replace ASCII chars with repeating label text on hover */
  label?: string
}

export interface AsciiImageProps {
  /** The ASCII data to render */
  data?: AsciiData
  /** Single combined config from ascii-config.json — alternative to separate data/regionMap/regions */
  config?: AsciiConfig
  /** Region map from segmentRegions() — enables region-based hover/click */
  regionMap?: (string | null)[] | null
  /** Region metadata from segmentRegions() */
  regions?: RegionInfo[]
  /** Font size (default: '10px') */
  fontSize?: number | string
  /** Line height multiplier (default: 1.15) */
  lineHeight?: number
  /** Background color (default: 'transparent') */
  backgroundColor?: string
  /** Color brightness multiplier — values > 1 brighten (default: 1.0) */
  colorBoost?: number
  /** Additional CSS class name */
  className?: string
  /** Additional inline styles on the outer container */
  style?: React.CSSProperties

  // --- Character-level callbacks ---
  /** Called when a character is clicked */
  onCharacterClick?: (info: CharInfo) => void
  /** Called when a character is hovered (null on mouse leave) */
  onCharacterHover?: (info: CharInfo | null) => void

  // --- Region-level callbacks ---
  /** Called when a region is clicked */
  onRegionClick?: (regionId: string, region: RegionInfo | undefined) => void
  /** Called when hover enters/leaves a region (null on leave) */
  onRegionHover?: (regionId: string | null, region: RegionInfo | undefined) => void

  // --- Region hover effects ---
  /** Default hover effect for all regions */
  regionHoverEffect?: RegionHoverEffect
  /** Per-region hover effects (keyed by region ID, overrides default) */
  regionEffects?: Record<string, RegionHoverEffect>
}

/**
 * Renders colored ASCII art with optional interactive regions.
 *
 * Without regions: renders colored ASCII with optional character-level callbacks.
 * With regions (from segmentRegions): adds hover highlights, click handlers, and
 * visual effects (color shift, underline, label text) per region.
 */
export function AsciiImage({
  data,
  config,
  regionMap,
  regions,
  fontSize = "10px",
  lineHeight = 1.15,
  backgroundColor = "transparent",
  colorBoost: colorBoostFactor = 1.0,
  className,
  style,
  onCharacterClick,
  onCharacterHover,
  onRegionClick,
  onRegionHover,
  regionHoverEffect,
  regionEffects,
}: AsciiImageProps) {
  // Resolve data source: explicit data prop takes precedence over config
  const resolvedData = (data ?? config?.data)!

  // Resolve regions: explicit regionMap prop takes precedence, then config, then none
  const { resolvedRegionMap, resolvedRegions } = useMemo(() => {
    if (regionMap !== undefined) {
      return { resolvedRegionMap: regionMap, resolvedRegions: regions ?? [] }
    }
    if (config?.regionConfig?.regions?.length) {
      const result = buildRegionMap(config.data, config.regionConfig)
      return { resolvedRegionMap: result.regionMap, resolvedRegions: result.regions }
    }
    return { resolvedRegionMap: null as (string | null)[] | null, resolvedRegions: [] as RegionInfo[] }
  }, [config, regionMap, regions])

  const spanRows = useAsciiSpans(resolvedData, resolvedRegionMap)
  const preRef = useRef<HTMLPreElement>(null)
  const [activeRegion, setActiveRegion] = useState<string | null>(null)

  // Track character offsets for label tiling per region
  const labelCounters = useRef<Record<string, number>>({})

  const findRegion = useCallback(
    (id: string): RegionInfo | undefined => resolvedRegions?.find((r) => r.id === id),
    [resolvedRegions]
  )

  const getEffect = useCallback(
    (regionId: string): RegionHoverEffect => {
      return regionEffects?.[regionId] ?? regionHoverEffect ?? { color: "#ffffff" }
    },
    [regionEffects, regionHoverEffect]
  )

  const resolveCharInfo = useCallback(
    (row: number, span: AsciiSpan, e: React.MouseEvent<HTMLSpanElement>): CharInfo | null => {
      const spanEl = e.currentTarget
      const rect = spanEl.getBoundingClientRect()
      const charWidth = rect.width / span.text.length
      const localX = e.clientX - rect.left
      const charOffset = Math.floor(localX / charWidth)
      const col = span.colStart + Math.min(charOffset, span.text.length - 1)
      return {
        row,
        col,
        char: span.text[Math.min(charOffset, span.text.length - 1)],
        color: span.color,
        region: span.region,
      }
    },
    []
  )

  const handleClick = useCallback(
    (row: number, span: AsciiSpan, e: React.MouseEvent<HTMLSpanElement>) => {
      if (onCharacterClick) {
        const info = resolveCharInfo(row, span, e)
        if (info) onCharacterClick(info)
      }
      if (onRegionClick && span.region) {
        onRegionClick(span.region, findRegion(span.region))
      }
    },
    [onCharacterClick, onRegionClick, resolveCharInfo, findRegion]
  )

  const handleMouseEnter = useCallback(
    (span: AsciiSpan) => {
      if (!span.region || span.region === activeRegion) return
      setActiveRegion(span.region)
      if (onRegionHover) {
        onRegionHover(span.region, findRegion(span.region))
      }
    },
    [activeRegion, onRegionHover, findRegion]
  )

  const handleMouseMove = useCallback(
    (row: number, span: AsciiSpan, e: React.MouseEvent<HTMLSpanElement>) => {
      // Update active region on move (handles crossing region boundaries within a row)
      if (span.region !== activeRegion) {
        setActiveRegion(span.region)
        if (onRegionHover) {
          onRegionHover(span.region, span.region ? findRegion(span.region) : undefined)
        }
      }
      if (onCharacterHover) {
        const info = resolveCharInfo(row, span, e)
        if (info) onCharacterHover(info)
      }
    },
    [activeRegion, onCharacterHover, onRegionHover, resolveCharInfo, findRegion]
  )

  const handleMouseLeave = useCallback(() => {
    setActiveRegion(null)
    if (onCharacterHover) onCharacterHover(null)
    if (onRegionHover) onRegionHover(null, undefined)
  }, [onCharacterHover, onRegionHover])

  // Reset label counters each render for consistent tiling
  labelCounters.current = {}

  function getDisplayText(span: AsciiSpan): string {
    if (!span.region || activeRegion !== span.region) return span.text
    const effect = getEffect(span.region)
    if (!effect.label) return span.text

    const padded = effect.label + " "
    const fullLabel = padded.repeat(Math.ceil(500 / padded.length))
    const offset = labelCounters.current[span.region] || 0
    labelCounters.current[span.region] = offset + span.text.length
    return fullLabel.slice(offset, offset + span.text.length)
  }

  function getSpanColor(span: AsciiSpan): string {
    const baseColor =
      colorBoostFactor !== 1.0 ? boostColor(span.color, colorBoostFactor) : span.color

    if (!span.region || activeRegion !== span.region) return baseColor

    const effect = getEffect(span.region)
    if (effect.colorBoost) return boostColor(span.color, effect.colorBoost)
    if (effect.color) return effect.color
    return "#ffffff"
  }

  function getSpanStyle(span: AsciiSpan): React.CSSProperties {
    const color = getSpanColor(span)
    const isActive = span.region != null && activeRegion === span.region
    const effect = isActive && span.region ? getEffect(span.region) : null

    return {
      color,
      transition: "color 0.15s ease",
      textDecoration: effect?.underline ? "underline" : undefined,
      cursor: span.region ? "pointer" : undefined,
    }
  }

  const hasInteraction = onCharacterClick || onCharacterHover || onRegionClick || onRegionHover

  return (
    <pre
      ref={preRef}
      className={className}
      style={{
        fontFamily: "monospace",
        fontSize,
        lineHeight,
        backgroundColor,
        margin: 0,
        userSelect: "none",
        ...style,
      }}
      onMouseLeave={handleMouseLeave}
    >
      {spanRows.map((row, ri) => (
        <div key={ri}>
          {row.map((span, si) => (
            <span
              key={si}
              style={getSpanStyle(span)}
              onMouseEnter={
                span.region ? () => handleMouseEnter(span) : undefined
              }
              onMouseMove={
                hasInteraction ? (e) => handleMouseMove(ri, span, e) : undefined
              }
              onClick={
                hasInteraction ? (e) => handleClick(ri, span, e) : undefined
              }
            >
              {getDisplayText(span)}
            </span>
          ))}
        </div>
      ))}
    </pre>
  )
}
