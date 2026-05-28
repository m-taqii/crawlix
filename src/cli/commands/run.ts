import { Command } from 'commander'
import { Orchestrator } from '../../core/orchestrator.js';
import { LLM } from '../../llm/index.js';
import { loadPersonas } from '../../personas/loader.js';
import { getConfig } from '../../lib/getConfigs.js';

export const runCommand = new Command('run')
    .description('Run AI agents against your app')
    .requiredOption('--url <url>', 'URL to test')
    .requiredOption('--goal <goal>', 'What to achieve')
    .option('--agent <agents>', 'Specific agent(s) to run, comma separated')
    .option('--steps <number>', 'Max steps per agent', '25')
    .option('--concurrency <number>', 'Agents running in parallel', '2')
    .option('--headed', 'Run browser in headed mode')
    .action(async (options) => {
        const config = getConfig();
        const llm: LLM = new LLM(config.primary, config.fallback);

        const { url, goal, agent, steps, concurrency, headed } = options;
        const orchestrator = new Orchestrator({
            url,
            goal,
            llm,
            personas: await loadPersonas(agent),
            maxSteps: parseInt(steps),
            concurrency: parseInt(concurrency),
            headless: !headed
        });
        await orchestrator.run();
    })