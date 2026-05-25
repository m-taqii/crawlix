import type { Action, ActionResult, PageState } from "../types/index.js"

export interface Adapter {
  open(url: string): Promise<void> // passed path or url of the application to open
  getState(): Promise<PageState>
  execute(action: Action): Promise<ActionResult>
  close(): Promise<void>
}