import { Command } from 'commander'
import { runCommand } from './commands/run.js'
import { setupCommand } from './commands/setup.js'
import { agentsCommand } from './commands/agents.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pkg = require('../../package.json') as { version: string }
const program = new Command()

program
    .name('qlaw')
    .description('👾 AI agents that claw through your app before users do')
    .version(pkg.version)

program.addCommand(runCommand)
program.addCommand(setupCommand)
program.addCommand(agentsCommand)

program.parse()