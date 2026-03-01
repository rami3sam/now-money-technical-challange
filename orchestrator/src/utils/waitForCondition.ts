export async function waitForCondition(
  condition: () => Promise<boolean>,
  timeout = 30000,
  interval = 100,
) {
  const start = Date.now();

  while (!(await condition())) {
    if (Date.now() - start > timeout) {
      throw new Error("Timeout waiting for condition");
    }
    await new Promise((r) => setTimeout(r, interval));
  }
}
