import chalk from "chalk";
import ora from "ora";
import { scanProjectForForFilesToHeal } from "./scan-project.js";
import { healFile } from "./heal-file.js";
import { runTests } from "./run-tests.js";
import { renderTitle } from "./render-title.js";

export async function run({
  model,
  testCommand,
}: {
  model: "gpt-3.5-turbo" | "gpt-4";
  testCommand: string;
}) {

  const testRunSpinner = ora(
    `Running tests...\n ${chalk.dim.italic(`$ ${testCommand}`)}`
  ).start();
  const testRun = await runTests(testCommand);

  if (testRun.passes) {
    testRunSpinner.succeed(chalk.green("Tests passed."));
    return;
  }
  testRunSpinner.fail(
    `${chalk.yellowBright("Tests failed.")}\n${chalk.dim.italic(
      testRun.details.slice(-300)
    )}\n`
  );

  if (!testRun.details) {
    console.log(
      chalk.yellowBright(
        "⚠️  I wasn't able to see the results of the failing test run when running "
      ) +
        chalk.italic.dim('$ ' + testCommand) +
        chalk.yellowBright(
          "\nPlease make sure that the test command is correct and that the test results are printed to the console."
        )
    );
    return;
  }

  const fileScanSpinner = ora(`Scanning project files...`).start();
  const filesToFix = await scanProjectForForFilesToHeal(testRun.details, model);
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
    return healFile(file, testRun.details, model);
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

  await run({
    model,
    testCommand,
  });
}
