import type { AsciiConfig, AsciiData, CharInfo, RegionInfo } from "../types.js";
export interface RegionHoverEffect {
    /** Override color for the entire region on hover (default: "#ffffff") */
    color?: string;
    /** Color brightness multiplier applied on hover (overrides `color` if both set) */
    colorBoost?: number;
    /** Add underline decoration on hover */
    underline?: boolean;
    /** Replace ASCII chars with repeating label text on hover */
    label?: string;
}
export interface AsciiImageProps {
    /** The ASCII data to render */
    data?: AsciiData;
    /** Single combined config from ascii-config.json — alternative to separate data/regionMap/regions */
    config?: AsciiConfig;
    /** Region map from segmentRegions() — enables region-based hover/click */
    regionMap?: (string | null)[] | null;
    /** Region metadata from segmentRegions() */
    regions?: RegionInfo[];
    /** Font size (default: '10px') */
    fontSize?: number | string;
    /** Line height multiplier (default: 1.15) */
    lineHeight?: number;
    /** Background color (default: 'transparent') */
    backgroundColor?: string;
    /** Color brightness multiplier — values > 1 brighten (default: 1.0) */
    colorBoost?: number;
    /** Additional CSS class name */
    className?: string;
    /** Additional inline styles on the outer container */
    style?: React.CSSProperties;
    /** Called when a character is clicked */
    onCharacterClick?: (info: CharInfo) => void;
    /** Called when a character is hovered (null on mouse leave) */
    onCharacterHover?: (info: CharInfo | null) => void;
    /** Called when a region is clicked */
    onRegionClick?: (regionId: string, region: RegionInfo | undefined) => void;
    /** Called when hover enters/leaves a region (null on leave) */
    onRegionHover?: (regionId: string | null, region: RegionInfo | undefined) => void;
    /** Default hover effect for all regions */
    regionHoverEffect?: RegionHoverEffect;
    /** Per-region hover effects (keyed by region ID, overrides default) */
    regionEffects?: Record<string, RegionHoverEffect>;
}
/**
 * Renders colored ASCII art with optional interactive regions.
 *
 * Without regions: renders colored ASCII with optional character-level callbacks.
 * With regions (from segmentRegions): adds hover highlights, click handlers, and
 * visual effects (color shift, underline, label text) per region.
 */
export declare function AsciiImage({ data, config, regionMap, regions, fontSize, lineHeight, backgroundColor, colorBoost: colorBoostFactor, className, style, onCharacterClick, onCharacterHover, onRegionClick, onRegionHover, regionHoverEffect, regionEffects, }: AsciiImageProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=AsciiImage.d.ts.map