import chalk from 'chalk'
import ora, { type Ora } from 'ora'
import boxen from 'boxen'
import type { RunResult, Finding } from '../types/index.js'

const spinners = new Map<string, Ora>()

export function agentStarted(personaName: string): void {
  const spinner = ora({
    text:    chalk.gray(`${personaName} — running...`),
    spinner: 'dots',
  }).start()
  spinners.set(personaName, spinner)
}

export function agentDone(result: RunResult): void {
  const spinner = spinners.get(result.persona)
  if (!spinner) return

  const critical = result.findings.filter(f => f.severity === 'critical').length
  const warnings = result.findings.filter(f => f.severity === 'warning').length
  const info     = result.findings.filter(f => f.severity === 'info').length
  const duration = (result.duration / 1000).toFixed(1)

  const findings = result.findings.length === 0
    ? chalk.green('no findings')
    : [
        critical > 0 ? chalk.red(`${critical} critical`) : null,
        warnings > 0 ? chalk.yellow(`${warnings} warnings`) : null,
        info     > 0 ? chalk.gray(`${info} info`)          : null,
      ].filter(Boolean).join(chalk.gray(' · '))

  const status = result.goalReached
    ? chalk.green('✓')
    : result.stuck
      ? chalk.red('✗')
      : chalk.yellow('~')

  spinner.stopAndPersist({
    symbol: status,
    text:   `${chalk.white(result.persona.padEnd(16))} ${findings}  ${chalk.gray(`${result.steps} steps · ${duration}s`)}`,
  })

  spinners.delete(result.persona)
}

export function printFinding(finding: Finding, persona: string): void {
  const icon = finding.severity === 'critical'
    ? chalk.red('⚠ critical')
    : finding.severity === 'warning'
      ? chalk.yellow('⚠ warning')
      : chalk.gray('ℹ info')

  console.log(`  ${icon}  ${chalk.gray(`[${persona}]`)} ${finding.description}`)
  if (finding.element) {
    console.log(`  ${chalk.gray('element:')} ${finding.element}`)
  }
}

export function printSummary(results: RunResult[]): void {
  const allFindings = results.flatMap(r => r.findings)
  const critical    = allFindings.filter(f => f.severity === 'critical').length
  const warnings    = allFindings.filter(f => f.severity === 'warning').length
  const info        = allFindings.filter(f => f.severity === 'info').length
  const passed      = results.filter(r => r.goalReached).length
  const stuck       = results.filter(r => r.stuck).length
  const totalTime   = results.reduce((acc, r) => acc + r.duration, 0)

  const lines = [
    chalk.bold.white('👾 Qlaw — run complete'),
    '',
    `  ${chalk.red(`${critical} critical`)}  ${chalk.yellow(`${warnings} warnings`)}  ${chalk.gray(`${info} info`)}`,
    '',
    `  ${chalk.green(`${passed} passed`)}  ${chalk.red(`${stuck} stuck`)}  ${chalk.gray(`${results.length - passed - stuck} incomplete`)}`,
    '',
    chalk.gray(`  total time → ${(totalTime / 1000).toFixed(1)}s`),
  ].join('\n')

  console.log('\n' + boxen(lines, {
    padding:     1,
    borderColor: 'magenta',
    borderStyle: 'round',
    dimBorder:   false,
  }))
}

export function printHeader(url: string, goal: string, personas: string[]): void {
  console.log('\n' + chalk.bold.white('  👾 Qlaw - Claw through bugs before your users do.'))
  console.log(chalk.gray(`  target   → `) + chalk.white(url))
  console.log(chalk.gray(`  goal     → `) + chalk.white(goal))
  console.log(chalk.gray(`  agents   → `) + chalk.white(personas.join(', ')))
  console.log()
}