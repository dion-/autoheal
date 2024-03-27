import chalk from "chalk";
import ora from "ora";
import { scanProjectForForFilesToHeal } from "./scan-project.js";
import { healFile } from "./heal-file.js";
import { runTests } from "./run-tests.js";
import inquirer from "inquirer";
import * as readline from "readline";
import { explainTestResults } from "./explain-test-results.js";
import { LanguageModelName } from "./llm-models.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function listenForEnterPressToPauseForHint() {
  rl.on("line", (input: string) => {
    if (canPauseForHint && !pauseForHintInput && input === "") {
      if (hint) {
        console.log(chalk.bold.dim("\n✦ (will pause to update hint) ✦\n\n"));
      } else {
        console.log(chalk.bold.dim("\n✦ (will pause to add hint) ✦\n\n"));
      }

      pauseForHintInput = true;
    }
  });
}

let canPauseForHint = true;
let pauseForHintInput = false;
let hint = ""; // user provided hint to provide additional guidance
let numberOfRuns = 0;
const runLimit = 6;

export async function run({
  model,
  testCommand,
}: {
  model: LanguageModelName;
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

  listenForEnterPressToPauseForHint();

  const testRunSpinner = ora(
    `Running tests...\n ${chalk.dim.italic(`$ ${testCommand}`)}`
  ).start();
  const testRun = await runTests(testCommand);

  if (testRun.passes) {
    testRunSpinner.succeed(chalk.green("Tests passed."));

    if (numberOfRuns > 0) {
      console.log(
        chalk.green.bold(`\n✨ Healed project after ${numberOfRuns} run(s)!`)
      );
    } else {
      console.log(
        chalk.green("\nNo healing was necessary. Tests are already passing.")
      );
    }

    return;
  }

  testRunSpinner.fail(
    `${chalk.yellowBright("Tests failed.")} \n${chalk.dim.italic(
      `$ ${testCommand}`
    )}`
  );

  const analysisSpinner = ora(`Analysing failures...`).start();
  const explanation = await explainTestResults(testRun.rawDetails, model);

  analysisSpinner.stopAndPersist({
    symbol: "✨",
    text: `${chalk.bold("Analysis of failures")}\n${chalk(explanation)}\n`,
  });

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

  await pauseForHintInputIfNecessary();

  const fileScanSpinner = ora(`Scanning project files...`).start();
  let filesToFix = await scanProjectForForFilesToHeal(
    testRun.details,
    hint,
    model
  );

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

  if (filesToFix.length > 1) {
    canPauseForHint = false;
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
      if (selectedFiles.length === 0) {
        console.log(
          chalk.redBright.bold("Please select at least one file to heal.") +
            chalk.yellowBright.bold(" (Press space to select)")
        );
      }
    }
    canPauseForHint = true;
    filesToFix = selectedFiles;
  }

  await pauseForHintInputIfNecessary();

  const fileList = chalk.italic.dim(filesToFix.join(", "));
  const healingSpinner = ora({
    text: `Healing files...\n ${fileList}`,
    color: "green",
  }).start();

  const healingPromises = filesToFix.map(async (file) => {
    const otherFiles = filesToFix.filter((f) => f !== file);
    return healFile(file, otherFiles, testRun.details, hint, model);
  });
  const healthDescriptions = await Promise.all(healingPromises);
  const healthDescriptionsString = healthDescriptions
    .filter((d) => d !== undefined)
    .map(({ filePath, healDescription }) => {
      return `${chalk.bold.yellow(filePath)}\n⇢ ${chalk.italic(
        healDescription
      )}\n`;
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

const pauseForHintInputIfNecessary = async () => {
  if (pauseForHintInput) {
    const hintPrompt = inquirer.createPromptModule();
    console.log(
      chalk.yellowBright.bold("⇣ Add a hint to help guide healing process.") +
        "\n" +
        chalk.italic.dim(
          "e.g., suggest a file to heal, a specific function to investigate or more details about the issue or goal"
        )
    );
    const result = await hintPrompt([
      {
        type: "input",
        name: "hint",
        message: "Enter hint:",
      },
    ]);
    hint = result.hint;
    pauseForHintInput = false;
  }
};
