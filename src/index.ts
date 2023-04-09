#!/usr/bin/env node
import chalk from "chalk";
import { Command } from "commander";
import { $, ExecaChildProcess } from "execa";
import ora from "ora";
import { scanProjectForForFilesToHeal } from "./scan-project.js";
import { healFile } from "./heal-file.js";

const program = new Command();

async function run() {
  const testRunSpinner = ora(
    `Running tests...\n ${chalk.dim.italic("$ npm test")}`
  ).start();
  const testRun = await runTests();

  if (testRun.passes) {
    testRunSpinner.succeed(chalk.green("Tests passed."));
    return;
  } else {
    testRunSpinner.fail(
      `${chalk.yellowBright("Tests failed.")}\n${chalk.dim.italic(
        testRun.details?.slice(-300)
      )}\n`
    );
  }

  const fileScanSpinner = ora(`Scanning project files...`).start();
  const filesToFix = await scanProjectForForFilesToHeal(testRun.details);
  fileScanSpinner.stopAndPersist({
    text: `Found ${filesToFix.length} file(s) to heal \n${chalk.dim(
      filesToFix.join("\n")
    )}\n`,
    symbol: "📂",
  });

  const fileList = chalk.italic.dim(filesToFix.join(", "));
  const healingSpinner = ora({
    text: `Healing files...\n ${fileList}`,
    color: "green",
  }).start();

  const healingPromises = filesToFix.map(async (file) => {
    return healFile(file, testRun.details);
  });
  const healthDescriptions = await Promise.all(healingPromises);
  const healthDescriptionsString = healthDescriptions
    .filter((d) => d !== undefined)
    .map(({ filePath, healDescription }) => {
      return `\n${chalk.yellow(filePath)}\n⇢ ${chalk.italic(healDescription)}`;
    })
    .join("\n");

  healingSpinner.stopAndPersist({
    text: `Healed ${filesToFix.length} file(s) \n${healthDescriptionsString}`,
    symbol: "✨",
  });

  console.log(chalk.yellowBright("⇣ Running tests again..."));

  await run();
}

program.command("fix").description("Fix tests").action(run);

program.parse(process.argv);

async function runTests() {
  try {
    await $`npm test`;
    return {
      passes: true,
      details: null,
    };
  } catch (e: any) {
    return {
      passes: false,
      details: e.stderr,
    };
  }
}

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
