import { prompt } from "./prompt.js";
import { $, execa } from "execa";
import _ from "lodash";

/**
 * Provide GPT a list of files, the test results and ask it to return the files that are likely to be causing the test failures.
 *
 * @param testDetails
 * @param model
 * @returns
 */
export async function scanProjectForForFilesToHeal(
  testDetails: string,
  model: "gpt-3.5-turbo" | "gpt-4"
) {
  const findFilesToFix = await execa("find", [
    ".",
    "-name",
    "*.ts",
    "-o",
    "-name",
    "*.js",
  ]);
  const possibleFilesToFix = findFilesToFix.stdout
    .split("\n")
    .filter((f) => f.indexOf("node_modules") === -1)
    .filter((f) => f.indexOf("test") === -1)
    .filter((f) => f.indexOf("spec") === -1)
    .filter((f) => f.indexOf("dist") === -1);
  const chunkSize = model === "gpt-3.5-turbo" ? 30 : 80; // Try to avoid token limit
  const fileChunks = _.chunk(possibleFilesToFix, chunkSize);

  const responses = await Promise.all(
    fileChunks.map((fileChunk) =>
      analyseFileListChunk(testDetails, fileChunk, model)
    )
  );

  return possibleFilesToFix.filter((filePath) => {
    // Does file exist in any of the responses?
    return responses.some((response) => {
      return response?.indexOf(filePath) !== -1;
    });
  });
}

async function analyseFileListChunk(
  testDetails: string,
  possibleFilesToFix: string[],
  model: "gpt-3.5-turbo" | "gpt-4"
) {
  return await prompt(
    [
      {
        role: "system",
        content:
          "You are simple program that looks at the test results and return the files to fix in a comma separated list. You respond briefly. ",
      },
      {
        role: "user",
        content:
          "You will be given results of a test run and a list of files," +
          " and reply with up to 4 files that have a high degree of probablity to be causing " +
          " the test failures." +
          " You will only return files that have a high probability of being problematic. " +
          "The list of possible files does not contain any files to fix in many cases, reply with an empty list in these occasions.",
      },
      {
        role: "assistant",
        content:
          "Yes, understood. I will only reply with a list of files and not provide any context",
      },
      {
        role: "user",
        content:
          "Respond very briefly with the list of of files.\nList of possible files:\n" +
          possibleFilesToFix.map((f) => "" + f).join(", ") +
          "Test run results:\n```" +
          testDetails +
          "\n```\n Do not provide any additional context.",
      },
    ],
    model
  );
}
