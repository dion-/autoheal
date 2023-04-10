import { execa } from "execa";
import { explainTestResults } from "./explain-test-results.js";

export async function runTests(testCommand: string, model: "gpt-3.5-turbo" | "gpt-4") {
  try {
    //await $`npm test`; <-- test
    await execa(testCommand, { shell: true });
    return {
      passes: true,
      details: "",
      explanation: "",
    };
  } catch (e: any) {
    const rawDetails = e.stderr || e.stdout;

    const explanation = await explainTestResults(rawDetails, model);
  
    return {
      passes: false,
      details: rawDetails.slice(-2000),
      explanation
    }
  }
}
