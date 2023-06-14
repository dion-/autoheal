import { execa } from "execa";
import { explainTestResults } from "./explain-test-results.js";

export async function runTests(
  testCommand: string,
  model: "gpt-3.5-turbo" | "gpt-4" | "gpt-3.5-turbo-16k"
) {
  try {
    //await $`npm test`; <-- test
    await execa(testCommand, { shell: true });
    return {
      passes: true,
      details: "",
      rawDetails: "",
    };
  } catch (e: any) {
    const rawDetails = e.stderr || e.stdout;

    return {
      passes: false,
      details: rawDetails.slice(-2000),
      rawDetails,
    };
  }
}
