import { expect, test, type Frame, type Page } from "@playwright/test";
import { prerequisiteIds } from "./prerequisites";

const OHMS_LAW_LESSON_ID = "b3-ohms-law";

type CircuitJsWindow = Window & {
  CircuitJS1?: { getElements: () => unknown[] };
};

async function unlockLesson(page: Page, lessonId: string) {
  const response = await page.request.post("/api/progress", {
    data: {
      action: "import",
      data: {
        progress: prerequisiteIds(lessonId).map((id) => ({
          lessonId: id,
          status: "completed",
          quizScore: 100,
          labComplete: true,
          readSections: true,
        })),
        tracks: [],
      },
    },
  });
  expect(response.ok(), await response.text()).toBeTruthy();
}

function simulatorFrame(page: Page): Frame | undefined {
  return page.frames().find((frame) => frame.url().includes("/circuitjs/circuitjs.html"));
}

test("Ohm's law lesson loads the CircuitJS simulator", async ({ page }) => {
  await unlockLesson(page, OHMS_LAW_LESSON_ID);
  await page.goto("/lesson/ohms-law");

  await expect(page.getByRole("heading", { name: "Ohm's Law", level: 1 })).toBeVisible();

  const simulator = page.getByTestId("circuit-simulator");
  await expect(simulator).toBeVisible();
  await expect(simulator).toHaveAttribute("data-simulator-state", "ready", {
    timeout: 60_000,
  });
  await expect(page.getByText("Could not load circuit")).toHaveCount(0);

  await expect
    .poll(
      async () => {
        const frame = simulatorFrame(page);
        if (!frame) return 0;
        return frame.evaluate(() => {
          const sim = (window as CircuitJsWindow).CircuitJS1;
          return sim?.getElements().length ?? 0;
        });
      },
      { timeout: 15_000 },
    )
    .toBeGreaterThan(0);
});
