import { execa } from "execa";

export async function runTests(testCommand: string) {
  try {
    //await $`npm test`; <-- test
    await execa(testCommand, { shell: true });
    return {
      passes: true,
      details: "",
      rawDetails: "",
    };
  } catch (e: any) {
    const rawDetails = String(e.stderr || e.stdout);

    return {
      passes: false,
      details: rawDetails.slice(-2000),
      rawDetails,
    };
  }
}
