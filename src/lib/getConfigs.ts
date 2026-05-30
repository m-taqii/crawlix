import fs from 'fs'
import os from 'os'
import path from 'path'
import type { CrawlixConfig } from '../types/index.js';

export function getConfig(): CrawlixConfig {
    const configPath = path.join(os.homedir(), '.crawlix', 'crawlix.config.json');
    if (!fs.existsSync(configPath)) {
        throw new Error("Config file not found. Run 'crawlix setup' to create one.");
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return config;
}