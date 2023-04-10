import chalk from "chalk";
import ora from "ora";
import { scanProjectForForFilesToHeal } from "./scan-project.js";
import { healFile } from "./heal-file.js";
import { runTests } from "./run-tests.js";
import { renderTitle } from "./render-title.js";
import inquirer from "inquirer";

let numberOfRuns = 0;
const runLimit = 6;

export async function run({
  model,
  testCommand,
}: {
  model: "gpt-3.5-turbo" | "gpt-4";
  testCommand: string;
}) {
  if (numberOfRuns > runLimit) {
    console.log(
      chalk.redBright(
        `⚠️  I've tried to heal your project ${numberOfRuns} times, but I'm still not able to get the tests to pass.`
      )
    );
    return;
  }

  const testRunSpinner = ora(
    `Running tests...\n ${chalk.dim.italic(`$ ${testCommand}`)}`
  ).start();
  const testRun = await runTests(testCommand, model);

  if (testRun.passes) {
    testRunSpinner.succeed(chalk.green("Tests passed."));

    if (numberOfRuns > 0) {
      console.log(chalk.green.bold(`\n✨ Healed project after ${numberOfRuns} run(s)!`));
    } else {
      console.log(
        chalk.green("\nNo healing was necessary. Tests are already passing.")
      );
    }

    return;
  }

  testRunSpinner.fail(
    `${chalk.yellowBright("Tests failed.")}\n${chalk(
      testRun.explanation
    )}\n`
  );

  if (!testRun.details) {
    console.log(
      chalk.yellowBright(
        "⚠️  I wasn't able to see the results of the failing test run when running "
      ) +
        chalk.italic.dim("$ " + testCommand) +
        chalk.yellowBright(
          "\nPlease make sure that the test command is correct and that the test results are printed to the console."
        )
    );
    return;
  }

  const fileScanSpinner = ora(`Scanning project files...`).start();
  let filesToFix = await scanProjectForForFilesToHeal(testRun.details, model);

  if (filesToFix.length === 0) {
    fileScanSpinner.fail(
      chalk.redBright(
        "I wasn't able to find any files that I could heal. Please make sure that the test command is correct and that the test results are printed to the console."
      )
    );
    return;
  }

  fileScanSpinner.stopAndPersist({
    text: `Found ${filesToFix.length} possible file(s) to heal \n${chalk.dim(
      filesToFix.join("\n")
    )}\n`,
    symbol: "📂",
  });

  if (filesToFix.length > 3) {
    const fileListPrompt = inquirer.createPromptModule();
    let selectedFiles = [];

    while (selectedFiles.length === 0) {
      const result = await fileListPrompt([
        {
          type: "checkbox",
          name: "fileList",
          message: "Select at least one file to heal",
          choices: filesToFix,
          loop: false,
        },
      ]);
      selectedFiles = result.fileList;
      if(selectedFiles.length === 0) {
        console.log(chalk.redBright.bold("Please select at least one file to heal.") + chalk.yellowBright.bold(" (Press space to select)"));
      }
    }

    filesToFix = selectedFiles;
  }

  const fileList = chalk.italic.dim(filesToFix.join(", "));
  const healingSpinner = ora({
    text: `Healing files...\n ${fileList}`,
    color: "green",
  }).start();

  const healingPromises = filesToFix.map(async (file) => {
    return healFile(file, testRun.details, model);
  });
  const healthDescriptions = await Promise.all(healingPromises);
  const healthDescriptionsString = healthDescriptions
    .filter((d) => d !== undefined)
    .map(({ filePath, healDescription }) => {
      return `${chalk.yellow(filePath)}\n⇢ ${chalk.italic(healDescription)}\n`;
    })
    .join("");

  healingSpinner.stopAndPersist({
    text: `Healed ${filesToFix.length} file(s): \n${healthDescriptionsString}`,
    symbol: "✨",
  });

  console.log(chalk.yellowBright("⇣ Running tests again..."));

  numberOfRuns++;
  await run({
    model,
    testCommand,
  });
}
