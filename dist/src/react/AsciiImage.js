import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useMemo, useRef, useState } from "react";
import { buildRegionMap } from "../regions.js";
import { boostColor } from "../color.js";
import { useAsciiSpans } from "./use-ascii-spans.js";
/**
 * Renders colored ASCII art with optional interactive regions.
 *
 * Without regions: renders colored ASCII with optional character-level callbacks.
 * With regions (from segmentRegions): adds hover highlights, click handlers, and
 * visual effects (color shift, underline, label text) per region.
 */
export function AsciiImage({ data, config, regionMap, regions, fontSize = "10px", lineHeight = 1.15, backgroundColor = "transparent", colorBoost: colorBoostFactor = 1.0, className, style, onCharacterClick, onCharacterHover, onRegionClick, onRegionHover, regionHoverEffect, regionEffects, }) {
    // Resolve data source: explicit data prop takes precedence over config
    const resolvedData = (data ?? config?.data);
    // Resolve regions: explicit regionMap prop takes precedence, then config, then none
    const { resolvedRegionMap, resolvedRegions } = useMemo(() => {
        if (regionMap !== undefined) {
            return { resolvedRegionMap: regionMap, resolvedRegions: regions ?? [] };
        }
        if (config?.regionConfig?.regions?.length) {
            const result = buildRegionMap(config.data, config.regionConfig);
            return { resolvedRegionMap: result.regionMap, resolvedRegions: result.regions };
        }
        return { resolvedRegionMap: null, resolvedRegions: [] };
    }, [config, regionMap, regions]);
    const spanRows = useAsciiSpans(resolvedData, resolvedRegionMap);
    const preRef = useRef(null);
    const [activeRegion, setActiveRegion] = useState(null);
    // Track character offsets for label tiling per region
    const labelCounters = useRef({});
    const findRegion = useCallback((id) => resolvedRegions?.find((r) => r.id === id), [resolvedRegions]);
    const getEffect = useCallback((regionId) => {
        return regionEffects?.[regionId] ?? regionHoverEffect ?? { color: "#ffffff" };
    }, [regionEffects, regionHoverEffect]);
    const resolveCharInfo = useCallback((row, span, e) => {
        const spanEl = e.currentTarget;
        const rect = spanEl.getBoundingClientRect();
        const charWidth = rect.width / span.text.length;
        const localX = e.clientX - rect.left;
        const charOffset = Math.floor(localX / charWidth);
        const col = span.colStart + Math.min(charOffset, span.text.length - 1);
        return {
            row,
            col,
            char: span.text[Math.min(charOffset, span.text.length - 1)],
            color: span.color,
            region: span.region,
        };
    }, []);
    const handleClick = useCallback((row, span, e) => {
        if (onCharacterClick) {
            const info = resolveCharInfo(row, span, e);
            if (info)
                onCharacterClick(info);
        }
        if (onRegionClick && span.region) {
            onRegionClick(span.region, findRegion(span.region));
        }
    }, [onCharacterClick, onRegionClick, resolveCharInfo, findRegion]);
    const handleMouseEnter = useCallback((span) => {
        if (!span.region || span.region === activeRegion)
            return;
        setActiveRegion(span.region);
        if (onRegionHover) {
            onRegionHover(span.region, findRegion(span.region));
        }
    }, [activeRegion, onRegionHover, findRegion]);
    const handleMouseMove = useCallback((row, span, e) => {
        // Update active region on move (handles crossing region boundaries within a row)
        if (span.region !== activeRegion) {
            setActiveRegion(span.region);
            if (onRegionHover) {
                onRegionHover(span.region, span.region ? findRegion(span.region) : undefined);
            }
        }
        if (onCharacterHover) {
            const info = resolveCharInfo(row, span, e);
            if (info)
                onCharacterHover(info);
        }
    }, [activeRegion, onCharacterHover, onRegionHover, resolveCharInfo, findRegion]);
    const handleMouseLeave = useCallback(() => {
        setActiveRegion(null);
        if (onCharacterHover)
            onCharacterHover(null);
        if (onRegionHover)
            onRegionHover(null, undefined);
    }, [onCharacterHover, onRegionHover]);
    // Reset label counters each render for consistent tiling
    labelCounters.current = {};
    function getDisplayText(span) {
        if (!span.region || activeRegion !== span.region)
            return span.text;
        const effect = getEffect(span.region);
        if (!effect.label)
            return span.text;
        const padded = effect.label + " ";
        const fullLabel = padded.repeat(Math.ceil(500 / padded.length));
        const offset = labelCounters.current[span.region] || 0;
        labelCounters.current[span.region] = offset + span.text.length;
        return fullLabel.slice(offset, offset + span.text.length);
    }
    function getSpanColor(span) {
        const baseColor = colorBoostFactor !== 1.0 ? boostColor(span.color, colorBoostFactor) : span.color;
        if (!span.region || activeRegion !== span.region)
            return baseColor;
        const effect = getEffect(span.region);
        if (effect.colorBoost)
            return boostColor(span.color, effect.colorBoost);
        if (effect.color)
            return effect.color;
        return "#ffffff";
    }
    function getSpanStyle(span) {
        const color = getSpanColor(span);
        const isActive = span.region != null && activeRegion === span.region;
        const effect = isActive && span.region ? getEffect(span.region) : null;
        return {
            color,
            transition: "color 0.15s ease",
            textDecoration: effect?.underline ? "underline" : undefined,
            cursor: span.region ? "pointer" : undefined,
        };
    }
    const hasInteraction = onCharacterClick || onCharacterHover || onRegionClick || onRegionHover;
    return (_jsx("pre", { ref: preRef, className: className, style: {
            fontFamily: "monospace",
            fontSize,
            lineHeight,
            backgroundColor,
            margin: 0,
            userSelect: "none",
            ...style,
        }, onMouseLeave: handleMouseLeave, children: spanRows.map((row, ri) => (_jsx("div", { children: row.map((span, si) => (_jsx("span", { style: getSpanStyle(span), onMouseEnter: span.region ? () => handleMouseEnter(span) : undefined, onMouseMove: hasInteraction ? (e) => handleMouseMove(ri, span, e) : undefined, onClick: hasInteraction ? (e) => handleClick(ri, span, e) : undefined, children: getDisplayText(span) }, si))) }, ri))) }));
}
//# sourceMappingURL=AsciiImage.js.map