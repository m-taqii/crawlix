import { chromium, type Browser } from "playwright"

let browser: Browser | null = null

export async function getBrowser(isheadless: boolean = true): Promise<Browser> {
    if (!browser || !browser.isConnected()) {
        browser = await chromium.launch({
            headless: isheadless,
            timeout: 30_000,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
            ]
        })
    }
    return browser
}

export async function closeBrowser(): Promise<void> {
    if (browser) {
        await browser.close()
        browser = null
    }
}