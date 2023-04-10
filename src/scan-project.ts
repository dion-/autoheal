import { prompt } from "./prompt.js";
import { $, execa } from "execa";

export async function scanProjectForForFilesToHeal(testDetails: string, model: 'gpt-3.5-turbo' | 'gpt-4') {
  // const possibleFilesToFix = [
  //   "./src/Customer.ts",
  //   "./src/Order.ts",
  //   "./src/Product.ts",
  //   "./src/OrderLineItem.ts",
  // ];

  // Find all js or ts files in current directory recursively
  //const currentDir = await execa("pwd");
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

  const response = await prompt([
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
  ], model);

  // Manual parsing
  // return possibleFilesToFix.filter((filePath) => {
  //   const fileName = filePath.split("/").pop() as string;
  //   const tsFileNameWithSpec = fileName.replace(".ts", ".spec.ts");
  //   const tsFileNameWithTest = fileName.replace(".ts", ".test.ts");
  //   const jsFileNameWithSpec = fileName.replace(".js", ".spec.js");
  //   const jsFileNameWithTest = fileName.replace(".js", ".test.js");
  //   return (
  //     testDetails.indexOf(tsFileNameWithSpec) !== -1 ||
  //     testDetails.indexOf(tsFileNameWithTest) !== -1 ||
  //     testDetails.indexOf(jsFileNameWithSpec) !== -1 ||
  //     testDetails.indexOf(jsFileNameWithTest) !== -1
  //   );
  // });
  return possibleFilesToFix.filter((filePath) => {
    return response?.indexOf(filePath) !== -1;
  });
}
