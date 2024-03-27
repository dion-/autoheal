import { prompt } from "./prompt.js";
import { $, execa } from "execa";
import _ from "lodash";
import { LanguageModelName } from "./llm-models.js";

/**
 * Provide GPT a list of files, the test results and ask it to return the files that are likely to be causing the test failures.
 *
 * @param testDetails
 * @param model
 * @returns
 */
export async function scanProjectForForFilesToHeal(
  testDetails: string,
  hint: string,
  model: LanguageModelName
) {
  const fileExtentions = [
    "js",
    "jsx",
    "ts",
    "tsx",
    "php",
    "py",
    "rb",
    "go",
    "java",
    "c",
    "cpp",
  ];
  const findFilesToFix = await execa("find", [
    ".",
    "-name",
    "*.ts",
    ...fileExtentions.map((ext) => ["-o", "-name", `*.${ext}`]).flat(),
  ]);
  const possibleFilesToFix = findFilesToFix.stdout
    .split("\n")
    .filter((f) => f)
    .filter((f) => f.indexOf(".next") === -1)
    .filter((f) => f.indexOf(".git") === -1)
    .filter((f) => f.indexOf("node_modules") === -1)
    .filter((f) => f.indexOf("test") === -1)
    .filter((f) => f.indexOf("spec") === -1)
    .filter((f) => f.indexOf("dist") === -1);

  // Have GPT guess the problematic files based on the test results alone
  const guessedFileNames = await guessFilesBasedOnTestResults(
    testDetails,
    hint,
    model
  );
  const guessedFiles = possibleFilesToFix.filter((filePath) => {
    const fileName = filePath.split("/").pop();

    return (
      fileName && guessedFileNames && guessedFileNames.indexOf(fileName) !== -1
    );
  });

  if (guessedFiles.length > 0) {
    return guessedFiles;
  }

  // Ok, GPT didn't guess any files, so we'll have to ask it to analyse the list of files
  const chunkSize = model === "gpt-3.5-turbo" ? 30 : 80; // Try to avoid token limit
  const fileChunks = _.chunk(possibleFilesToFix, chunkSize);

  const responses = await Promise.all(
    fileChunks.map((fileChunk) =>
      analyseFileListChunk(testDetails, hint, fileChunk, model)
    )
  );

  return possibleFilesToFix.filter((filePath) => {
    // Does file exist in any of the responses?
    return responses.some((response) => {
      return response?.indexOf(filePath) !== -1;
    });
  });
}

async function guessFilesBasedOnTestResults(
  testDetails: string,
  hint: string,
  model: LanguageModelName
) {
  const response = await prompt(
    [
      {
        role: "system",
        content:
          "You are an expert programming assistant helping to debug failing tests. ",
      },
      {
        role: "user",
        content:
          `${
            hint ? `${hint}\n\n` : ""
          } Given the following test results. Guess possible files names in the project that may be causing the issue, do not include test files eg., "utility.test.js"` +
          ` \nList of possible files:\n` +
          "Test run results:\n```" +
          testDetails +
          "\n```\n",
      },
    ],
    model
  );

  return response;
}

async function analyseFileListChunk(
  testDetails: string,
  hint: string,
  possibleFilesToFix: string[],
  model: LanguageModelName
) {
  const response = await prompt(
    [
      {
        role: "system",
        content: "You are an expert programming assistant. ",
      },
      {
        role: "user",
        content:
          "You will be given results of a test run and a list of files," +
          " and reply with up to 4 files that have a high degree of probablity to be causing " +
          " the test failures." +
          " You will only return files that have a high probability of being problematic. ",
      },
      {
        role: "assistant",
        content:
          "Yes, understood. I will only reply with a list of files and not provide any context",
      },
      {
        role: "user",
        content:
          `${
            hint ? `${hint}\n\n` : ""
          }Respond very briefly with the list of of files that may causing the test fails. Only give me the files that are very likely to be causing a failure.` +
          `It is very possible this list of files may contain no files to fix, reply with an empty list in if this looks to be the case.` +
          ` \nList of possible files:\n` +
          possibleFilesToFix.map((f) => "" + f).join(", ") +
          "Test run results:\n```" +
          testDetails +
          "\n```\n Do not provide any additional context.",
      },
    ],
    model
  );
  return response;
}
