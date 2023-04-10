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

  const fileChunks = _.chunk(possibleFilesToFix, 100);

  const reponses = await Promise.all(
    fileChunks.map((fileChunk) =>
      analyseFileListChunk(testDetails, fileChunk, model)
    )
  );

  return possibleFilesToFix.filter((filePath) => {
    // Does file exist in any of the responses?
    return reponses.some((response) => {
      return response?.indexOf(filePath) !== -1;
    });
  });
}

async function analyseFileListChunk(
  testDetails: string,
  possibleFilesToFix: string[],
  model: "gpt-3.5-turbo" | "gpt-4"
) {
  console.log('scanning files', possibleFilesToFix);
  return await prompt(
    [
      {
        role: "system",
        content:
          "You are simple program that looks at the test results and return the files to fix in a comma separated list. You are not a conversational agent.",
      },
      {
        role: "user",
        content:
          "You will be given results of a test run and a list of files," +
          " and reply with the files that are likely to be causing " +
          " the test failures. You will only return a list of files and not provide any additional context.",
      },
      {
        role: "assistant",
        content:
          "Yes, understood. I will only reply with a list of files and not provide any context",
      },
      {
        role: "user",
        content:
          "List of possible files:\n" +
          possibleFilesToFix.map((f) => "- " + f).join("\n") +
          "Test run results:\n```" +
          testDetails +
          "\n```\n",
      },
    ],
    model
  );
}
