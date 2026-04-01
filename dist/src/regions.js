import { hexFromRgb } from "./color.js";
function pointInPolygon(row, col, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [ri, ci] = polygon[i];
        const [rj, cj] = polygon[j];
        if ((ri > row) !== (rj > row) && col < ((cj - ci) * (row - ri)) / (rj - ri) + ci) {
            inside = !inside;
        }
    }
    return inside;
}
/**
 * Convert manual region definitions into a regionMap array.
 *
 * Supports two formats:
 * - `polygon`: array of [row, col] vertices — cells inside are filled via ray casting
 * - `cells`: explicit array of [row, col] pairs — from the paint-based editor
 */
export function buildRegionMap(data, config) {
    const { cols, rows, palette, colorIndices } = data;
    const total = cols * rows;
    const regionMap = new Array(total).fill(null);
    const regionsOut = [];
    for (const manualRegion of config.regions) {
        let minR = Infinity, maxR = 0, minC = Infinity, maxC = 0;
        let rSum = 0, gSum = 0, bSum = 0;
        let count = 0;
        if (manualRegion.cells && manualRegion.cells.length > 0) {
            // Cell-based: directly assign each cell
            for (const [r, c] of manualRegion.cells) {
                if (r < 0 || r >= rows || c < 0 || c >= cols)
                    continue;
                const idx = r * cols + c;
                regionMap[idx] = manualRegion.id;
                if (r < minR)
                    minR = r;
                if (r > maxR)
                    maxR = r;
                if (c < minC)
                    minC = c;
                if (c > maxC)
                    maxC = c;
                const hex = palette[colorIndices[idx]];
                rSum += parseInt(hex.slice(1, 3), 16);
                gSum += parseInt(hex.slice(3, 5), 16);
                bSum += parseInt(hex.slice(5, 7), 16);
                count++;
            }
        }
        else if (manualRegion.polygon && manualRegion.polygon.length >= 3) {
            // Polygon-based: fill via ray casting
            for (const [r, c] of manualRegion.polygon) {
                if (r < minR)
                    minR = r;
                if (r > maxR)
                    maxR = r;
                if (c < minC)
                    minC = c;
                if (c > maxC)
                    maxC = c;
            }
            minR = Math.max(0, Math.floor(minR));
            maxR = Math.min(rows - 1, Math.ceil(maxR));
            minC = Math.max(0, Math.floor(minC));
            maxC = Math.min(cols - 1, Math.ceil(maxC));
            for (let r = minR; r <= maxR; r++) {
                for (let c = minC; c <= maxC; c++) {
                    if (pointInPolygon(r, c, manualRegion.polygon)) {
                        const idx = r * cols + c;
                        regionMap[idx] = manualRegion.id;
                        const hex = palette[colorIndices[idx]];
                        rSum += parseInt(hex.slice(1, 3), 16);
                        gSum += parseInt(hex.slice(3, 5), 16);
                        bSum += parseInt(hex.slice(5, 7), 16);
                        count++;
                    }
                }
            }
        }
        if (count > 0) {
            regionsOut.push({
                id: manualRegion.id,
                size: count,
                bounds: { minRow: minR, maxRow: maxR, minCol: minC, maxCol: maxC },
                averageColor: hexFromRgb(Math.round(rSum / count), Math.round(gSum / count), Math.round(bSum / count)),
            });
        }
    }
    return { regionMap, regions: regionsOut };
}
//# sourceMappingURL=regions.js.map