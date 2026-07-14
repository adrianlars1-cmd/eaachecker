import { chromium } from 'playwright'

export const CDP_PORT = 9222
export const SCAN_USER_AGENT = 'Mozilla/5.0 (compatible; EAAChecker-bot/1.0; +https://eaachecker.com/bot)'

export async function launchScanBrowser() {
  return chromium.launch({
    headless: true,
    args: [
      `--remote-debugging-port=${CDP_PORT}`,
      '--no-sandbox',
      '--disable-dev-shm-usage',
    ],
  })
}
