import fs from "fs";
import path from "path";
import type { CrawlixContext } from "../types/index.js";

export function getContext(contextPath?: string): CrawlixContext | undefined {
    const defaultContextPath = path.join(process.cwd(), '.crawlix', 'context.jsonc');
    const targetPath = contextPath || defaultContextPath;
    if (!fs.existsSync(targetPath)) {
        return undefined;
    }
    const raw = fs.readFileSync(targetPath, 'utf-8')
        .replace(/("(?:[^"\\]|\\.)*")|\/\/[^\n]*/g, (match, quoted) => quoted ?? '')
        .trim()
    try {
        return JSON.parse(raw);
    } catch {
        console.warn('⚠️ .crawlix/context.jsonc is invalid JSON — skipping context.');
        return undefined;
    }
}

console.log(getContext())