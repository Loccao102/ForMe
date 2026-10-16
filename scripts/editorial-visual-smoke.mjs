import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const base = process.env.VISUAL_QA_URL || "http://127.0.0.1:3000";
const folder = "test-results/editorial-visual";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [];

async function exercise(label, viewport, reducedMotion) {
  const context = await browser.newContext({
    viewport,
    reducedMotion,
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  page.on("pageerror", e => errors.push(`${label}: ${e.message}`));
  try {
    const response = await page.goto(base, { waitUntil: "domcontentloaded", timeout: 30000 });
    if (!response?.ok()) throw new Error(`${label}: HTTP ${response?.status()}`);
    await page.getByText("YOU DON’T", { exact: true }).waitFor({ state: "visible", timeout: 20000 });
    await page.screenshot({ path: `${folder}/${label}-hero.png`, animations: "disabled" });

    const impression = page.getByRole("button", { name: /quiet at first/ });
    await impression.click();
    if ((await impression.getAttribute("aria-pressed")) !== "true") {
      throw new Error(`${label}: impression choice did not expose pressed state`);
    }

    const question = page.getByRole("button", { name: /people/i });
    await question.click();
    if ((await question.getAttribute("aria-pressed")) !== "true") {
      throw new Error(`${label}: question did not expose pressed state`);
    }
    const answer = page.getByRole("status").filter({ hasText: /conversations/ });
    await answer.waitFor({ state: "visible", timeout: 15000 });
    await page.screenshot({ path: `${folder}/${label}-question.png`, animations: "disabled" });

    // The interactive editorial choices must expose a keyboard-visible
    // outline; color changes alone are not enough for keyboard navigation.
    await page.keyboard.press("Tab");
    await question.focus();
    const keyboardFocus = await question.evaluate(el => {
      const style = getComputedStyle(el);
      return { width: style.outlineWidth, kind: style.outlineStyle };
    });
    if (keyboardFocus.kind === "none" || keyboardFocus.width === "0px") {
      throw new Error(`${label}: question button has no visible keyboard focus outline`);
    }


    if (reducedMotion === "reduce") {
      // Reduced-motion mode must suppress JS-driven hover motion, not just
      // CSS keyframes. Exercise both the guess and the question controls.
      for (const [name, target] of [
        ["impression", impression],
        ["question", question],
      ]) {
        await page.mouse.move(1, 1);
        const before = await target.evaluate(el => getComputedStyle(el).transform);
        await target.hover();
        await page.waitForTimeout(170);
        const after = await target.evaluate(el => getComputedStyle(el).transform);
        if (after !== before) {
          throw new Error(`${label}: ${name} moves on hover even with reduced motion (${before} -> ${after})`);
        }
      }
    }


    const titles = ["BADMINTON", "FOOTBALL", "RUNNING"];
    const positions = [];
    for (const title of titles) {
      const heading = page.getByRole("heading", { name: title, exact: true });
      // The desktop panels intentionally animate horizontally as the user scrolls.
      // Only require all three panels to enter the viewport on mobile/reduced-motion.
      if (viewport.width <= 900 || reducedMotion === "reduce") {
        await heading.scrollIntoViewIfNeeded({ timeout: 15000 });
      }
      const rect = await heading.boundingBox();
      if (!rect || rect.width < 10 || rect.height < 10) {
        throw new Error(`${label}: '${title}' is missing or zero-sized`);
      }
      if (viewport.width <= 900 && (rect.y < -2 || rect.y > viewport.height)) {
        throw new Error(`${label}: '${title}' could not be scrolled into view`);
      }
      positions.push({ title, y: Math.round(rect.y), x: Math.round(rect.x) });
    }
    await page.screenshot({ path: `${folder}/${label}-after-work.png`, animations: "disabled" });

    if (viewport.width <= 900 || reducedMotion === "reduce") {
      const stacked = await page.locator("section").filter({ has: page.getByRole("heading", { name: "BADMINTON" }) }).first()
        .locator("article").evaluateAll(elements => {
          const boxes = elements.slice(0, 3).map(el => el.getBoundingClientRect());
          return boxes.length === 3 && boxes[1].top >= boxes[0].bottom - 2
            && boxes[2].top >= boxes[1].bottom - 2;
        });
      if (!stacked) throw new Error(`${label}: After Work panels are not vertically stacked`);
    }
    // A configured DM destination must be a safe navigable HTTPS/mailto link.
    // Without config it remains a button and surfaces an actionable hint.
    const link = page.getByRole("link", { name: /DM ME/i });
    if (await link.count()) {
      const destination = await link.getAttribute("href");
      const url = new URL(destination);
      if (!["https:", "mailto:"].includes(url.protocol)) {
        throw new Error(`${label}: unsupported DM link protocol ${url.protocol}`);
      }
      if ((await link.getAttribute("rel")) !== "noopener noreferrer") {
        throw new Error(`${label}: external DM link must disable opener access`);
      }
    } else {
      const contact = page.getByRole("button", { name: /DM ME/i });
      await contact.click();
      await page.locator('[class*="contactHint"]').waitFor({
        state: "visible", timeout: 3000,
      });
    }
    console.log(`PASS ${label}: heading/choices/answers/sports panels and contact CTA`, JSON.stringify(positions));
  } finally {
    await context.close();
  }
}

try {
  await exercise("desktop", { width: 1440, height: 900 }, "no-preference");
  await exercise("mobile", { width: 390, height: 844 }, "no-preference");
  await exercise("reduced-motion", { width: 390, height: 844 }, "reduce");
  if (errors.length) throw new Error(errors.join("\n"));
} finally {
  await browser.close();
}
