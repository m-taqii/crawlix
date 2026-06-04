import { Extractor } from "../core/extractor.js"
import type { Adapter } from "./base.js"
import type { ActionResult, Action, PageState } from "../types/index.js"
import type { Page } from "playwright"

export class WebAdapter implements Adapter {
    private page: Page
    private extractor: Extractor

    constructor(page: Page) {
        this.page = page
        this.extractor = new Extractor()
    }

    async open(url: string): Promise<void> {
        await this.page.goto(url, { waitUntil: 'domcontentloaded' })
    }

    async getState(): Promise<PageState> {
        return this.extractor.extract(this.page)
    }

    private async resolve(target: string) {
        const cleaned = target
            .replace(/^\[\d+\]\s*/, '') // remove '[01]' if it hallucinates index
            .replace(/^(button|link|input|checkbox|radio|select|textbox|combobox)\s*:?\s*/i, '') // remove roles with or without colons
            .replace(/^"|"$/g, '')     // remove surrounding quotes
            .trim()

        const strategies = [
            () => this.page.getByRole('button', { name: cleaned, exact: false }).first(),
            () => this.page.getByRole('link', { name: cleaned, exact: false }).first(),
            () => this.page.getByRole('textbox', { name: cleaned, exact: false }).first(),
            () => this.page.getByRole('combobox', { name: cleaned, exact: false }).first(),
            () => this.page.getByRole('checkbox', { name: cleaned, exact: false }).first(),
            () => this.page.getByLabel(cleaned, { exact: false }).first(),
            () => this.page.getByPlaceholder(cleaned, { exact: false }).first(),
            () => this.page.getByText(cleaned, { exact: false }).first(),
        ]
        for (const strategy of strategies) {
            try {
                const el = strategy()
                if (await el.isVisible().catch(() => false)) {
                    return el
                }
            } catch {

            }
        }

        return null
    }

    async execute(action: Action): Promise<ActionResult> {
        try {
            switch (action.type) {

                case 'click': {
                    // find element by description, click it
                    const el = await this.resolve(action.target!)
                    if (!el) return { success: false, error: `Element not found: "${action.target}"` }
                    await el.click({ timeout: 5000 })
                    // wait for page to settle after click
                    await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => { })
                    await this.page.waitForTimeout(500)
                    break
                }

                case 'type': {
                    // find input, fill it with value
                    const el = await this.resolve(action.target!)
                    if (!el) return { success: false, error: `Element not found: "${action.target}"` }
                    await el.fill(action.value ?? '')
                    break
                }

                case 'scroll': {
                    // scroll direction comes in action.value: up/down/left/right
                    const directions: Record<string, [number, number]> = {
                        up: [0, -500],
                        down: [0, 500],
                        left: [-500, 0],
                        right: [500, 0],
                    }
                    const [x, y] = directions[action.value ?? 'down'] ?? [0, 500]
                    await this.page.mouse.wheel(x, y)
                    break
                }

                case 'select': {
                    // dropdown selection
                    const el = await this.resolve(action.target!)
                    if (!el) return { success: false, error: `Element not found: "${action.target}"` }
                    await el.selectOption(action.value ?? '')
                    break
                }

                case 'hover': {
                    const el = await this.resolve(action.target!)
                    if (!el) return { success: false, error: `Element not found: "${action.target}"` }
                    await el.hover()
                    break
                }

                case 'press': {
                    // keyboard key press - Enter, Tab, Escape, ArrowDown etc
                    await this.page.keyboard.press(action.value ?? 'Enter')
                    break
                }

                case 'open': {
                    // LLM might return a relative path like '/get-started', so we resolve it against the current URL
                    const targetUrl = new URL(action.value ?? '', this.page.url()).href
                    await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 })
                    break
                }

                case 'wait': {
                    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { })
                    break
                }

                case 'done':
                case 'stuck':
                    break
            }

            return { success: true }

        } catch (err: unknown) {
            return {
                success: false,
                error: err instanceof Error ? err.message : String(err)
            }
        }
    }

    async close(): Promise<void> {
        await this.page.close()
    }
}