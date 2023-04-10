import { execa } from "execa";

export async function runTests(testCommand: string) {
  try {
    //await $`npm test`; <-- test
    await execa(testCommand, { shell: true });
    return {
      passes: true,
      details: "",
    };
  } catch (e: any) {
    const details = e.stderr || e.stdout ;

    return {
      passes: false,
      details,
    };
  }
}
