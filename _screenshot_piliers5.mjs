import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto("http://localhost:8085/", { waitUntil: "load", timeout: 60000 });
await page.waitForSelector("text=Nos Piliers d'Accompagnement", { timeout: 30000 }).catch(() => {});
await page.locator("text=Nos Piliers d'Accompagnement").scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);
await page.screenshot({ path: "_piliers5.png", fullPage: false });
await browser.close();
