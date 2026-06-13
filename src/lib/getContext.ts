import fs from "fs";
import path from "path";

export function getContext(contextPath?: string): string | undefined {
    if (contextPath) {
        if (fs.existsSync(contextPath)) {
            return fs.readFileSync(contextPath, 'utf-8').trim() || undefined;
        }
        return undefined;
    }

    const crawlixContextPath = path.join(process.cwd(), '.crawlix', 'CONTEXT.md');
    const rootContextPath = path.join(process.cwd(), 'CONTEXT.md');

    const targetPath = fs.existsSync(crawlixContextPath) 
        ? crawlixContextPath 
        : fs.existsSync(rootContextPath) 
            ? rootContextPath 
            : undefined;

    if (!targetPath) {
        return undefined;
    }
    
    return fs.readFileSync(targetPath, 'utf-8').trim() || undefined;
}