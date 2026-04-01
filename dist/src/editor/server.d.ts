import type { AsciiData } from "../types.js";
export interface EditorOptions {
    port?: number;
    outputDir?: string;
}
export declare function launchEditor(data: AsciiData, options?: EditorOptions): Promise<void>;
//# sourceMappingURL=server.d.ts.map