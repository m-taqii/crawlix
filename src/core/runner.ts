import type { Adapter } from "../adapters/base.js"
import type { Finding, HistoryEntry, RunResult } from "../types/index.js"
import type { Director } from "./director.js"

export class Runner {
  private adapter:  Adapter;
  private director: Director;
  private url:      string;
  private goal:     string;
  private maxSteps: number;

  constructor(adapter: Adapter, director: Director, url: string, goal: string, maxSteps = 25) {
    this.adapter  = adapter;
    this.director = director;
    this.url      = url;
    this.goal     = goal;
    this.maxSteps = maxSteps;
  }

  async run(): Promise<RunResult> {
    // 1. open the url
    await this.adapter.open(this.url)

    const history:  HistoryEntry[] = []
    const findings: Finding[]      = []
    const startedAt = Date.now()

    // 2. loop
    for (let step = 1; step <= this.maxSteps; step++) {

      // get current state
      const pageState = await this.adapter.getState()

      // ask director what to do
      const action = await this.director.decide(pageState, history)

      // record finding if any
      if (action.finding) findings.push({ ...action.finding, step })

      // stop if done or stuck
      if (action.type === 'done' || action.type === 'stuck') break

      // execute the action
      const result = await this.adapter.execute(action)

      // record in history
      history.push({ step, pageState, action })

      // if action failed record it
      if (!result.success) {
        findings.push({
          severity:    'warning',
          description: `Action failed: ${result.error}`,
          element:     action.target ?? undefined,
          step,
        })
      }
    }

    // 3. close and return
    await this.adapter.close()

    return {
      persona:     this.director.personaName,
      url:         this.url,
      goal:        this.goal,
      steps:       history.length,
      findings,
      goalReached: history.at(-1)?.action.type === 'done',
      stuck:       history.at(-1)?.action.type === 'stuck',
      duration:    Date.now() - startedAt,
      history,
    }
  }
}