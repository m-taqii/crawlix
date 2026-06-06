import { Command } from 'commander'
import { select, input, password, confirm } from '@inquirer/prompts'
import fs from 'fs'
import os from 'os'
import path from 'path'
import type { ProviderConfig, ProviderName, CrawlixConfig } from '../../types/index.js'

const DEFAULT_MODELS: Partial<Record<ProviderName, string>> = {
    groq: 'llama-3.3-70b-versatile',
    openai: 'gpt-4o-mini',
    gemini: 'gemini-2.5-flash',
    anthropic: 'claude-haiku-4-5-20251001',
    openrouter: 'meta-llama/llama-3.3-70b-instruct:free',
    ollama: 'llama3.2',
    cerebras: 'gpt-oss-120b',
    mistral: 'mistral-medium-3-5',
}

async function setupProvider(label: string): Promise<ProviderConfig> {
    const provider = await select<ProviderName>({
        message: `Select ${label} provider`,
        choices: [
            { name: 'Groq', value: 'groq' },
            { name: 'Gemini', value: 'gemini' },
            { name: 'Cerebras', value: 'cerebras' },
            { name: 'Mistral', value: 'mistral' },
            { name: 'OpenRouter', value: 'openrouter' },
            { name: 'Ollama', value: 'ollama' },
            { name: 'OpenAI', value: 'openai' },
            { name: 'Anthropic', value: 'anthropic' },
            { name: 'Custom (OpenAI Compatible)', value: 'custom' },
        ]
    })

    let baseURL: string | undefined
    if (provider === 'custom') {
        baseURL = await input({
            message: 'Enter the base URL for the custom provider (e.g. https://api.together.xyz/v1):',
            validate: v => v.trim().length > 0 ? true : 'Base URL cannot be empty'
        })
    }

    let apiKey: string | undefined

    if (provider === 'ollama') {
        console.log('  ✓ Ollama runs locally — no API key needed')
    } else {
        apiKey = await password({
            message: `Enter your ${provider} API key:`,
            validate: v => (provider === 'custom' || v.trim().length > 0) ? true : 'API key cannot be empty'
        })
    }

    const defaultModel: string | undefined = DEFAULT_MODELS[provider]
    const customModel: string = await input({
        message: defaultModel 
            ? `Model to use (press enter for default: ${defaultModel}):` 
            : `Model to use:`,
        validate: v => (defaultModel || v.trim().length > 0) ? true : 'Model cannot be empty for custom providers'
    })

    const config: ProviderConfig = {
        provider,
        ...(apiKey && apiKey.trim().length > 0 && { apiKey: apiKey.trim() }),
        ...(baseURL && { baseURL: baseURL.trim() }),
        ...(customModel.trim().length > 0 && { model: customModel.trim() }),
    }

    return config
}

export const setupCommand = new Command('setup')
    .description('Configure your LLM provider')
    .action(async () => {
        console.log('\n  👾 crawlix setup\n')

        const primary = await setupProvider('primary')

        const wantsFallback = await confirm({
            message: 'Add a fallback provider?',
            default: false,
        })

        let fallback: ProviderConfig | undefined
        if (wantsFallback) {
            fallback = await setupProvider('fallback')
        }

        // after fallback setup
        const wantsRoundRobin = await confirm({
            message: 'Add round robin providers to spread load across multiple providers?',
            default: false,
        })

        const roundRobin: ProviderConfig[] = []

        if (wantsRoundRobin) {
            console.log('\n  Add providers one by one. Press N when done.\n')

            let addMore = true
            while (addMore) {
                const provider = await setupProvider(`round robin #${roundRobin.length + 1}`)
                roundRobin.push(provider)
                addMore = await confirm({ message: 'Add another provider?', default: false })
            }
        }

        // build config
        const crawlixConfig: CrawlixConfig = {
            primary,
            ...(fallback && { fallback }),
            ...(roundRobin.length > 0 && { roundRobin }),
        }

        // save to ~/.crawlix/crawlix.config.json
        const configDir = path.join(os.homedir(), '.crawlix')
        const configPath = path.join(configDir, 'crawlix.config.json')

        fs.mkdirSync(configDir, { recursive: true })
        fs.writeFileSync(configPath, JSON.stringify(crawlixConfig, null, 2))

        console.log('\n  ✓ Config saved to', configPath)
        console.log('  Run crawlix run --url <url> --goal "<goal>" to start testing\n')
    })