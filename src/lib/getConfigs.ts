import fs from 'fs'
import os from 'os'
import path from 'path'
import type { QlawConfig } from '../types/index.js';

export function getConfig(): QlawConfig {
    const configPath = path.join(os.homedir(), '.qlaw', 'qlaw.config.json');
    if (!fs.existsSync(configPath)) {
        throw new Error("Config file not found. Run 'qlaw setup' to create one.");
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return config;
}