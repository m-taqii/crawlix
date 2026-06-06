import { Command } from 'commander'
import { confirm } from '@inquirer/prompts'
import fs from 'fs'
import path from 'path'

export const initCommand = new Command('init')
    .description('Initialize a new Crawlix context for agents')
    .action(async () => {
        console.log('\n  👾 crawlix init\n')

        const exists = fs.existsSync(path.join(process.cwd(), '.crawlix', 'context.jsonc'))
        if (exists) {
            const overwrite = await confirm({
                message: 'A Crawlix context already exists. Overwrite?',
                default: false,
            })
            if (!overwrite) {
                return
            }
        }
        const context = `// Crawlix context file
// NOTE: Remove the fields you dont need, Leaving placeholders will mislead the agents
{
            // The name of your application
            "name": "My App",

            // A brief description of what your application does
            "description": "A short description of your application",

            // The type of your application — one of: "web" | "api" | "cli" | "library"
            "type": "web",

            // Where agents should start — URLs for web/api, commands for cli, package name for library
            // Example: ["http://localhost:3000"] or ["my-cli-tool"] or ["my-package"]
            "entryPoints": ["http://localhost:3000"],

            // The main flows or features agents should explore and test
            // Example: ["User signs up", "User creates a post", "User resets password"]
            "flows": ["Describe a key user flow here", "Add more flows as needed"],

            // Whether your application requires authentication to use
            // Set to true if agents need to log in, false if the app is publicly accessible
            "authRequired": false,

            // Things agents must never do — be explicit to avoid unintended side effects
            // Example: ["don't submit real payments", "skip /admin", "don't delete any data"]
            "offLimits": ["Add anything agents should avoid here"],

            // The environment agents will be testing against — one of: "local" | "staging" | "production"
            "environment": "local",

            // Your tech stack — helps agents make smarter assumptions (optional, free text)
            // Example: "Next.js, Supabase, REST" or "Express, PostgreSQL, GraphQL"
            "stack": "e.g. Next.js, Postgres"
}`

        // Save context to .crawlix/context.jsonc
        const contextDir = path.join(process.cwd(), '.crawlix')
        const contextPath = path.join(contextDir, 'context.jsonc')

        fs.mkdirSync(contextDir, { recursive: true })
        fs.writeFileSync(contextPath, context)

        console.log('\n  ✓ Context saved to', contextPath);
        console.log('  → Open the file and fill in the fields that apply to your project.');
        console.warn('  → Remove any field you don\'t need — leaving placeholders will mislead the agents.\n');
        console.log('  You can now run: npm run crawlix -- run --url <url> --goal "<goal>"\n');
    })