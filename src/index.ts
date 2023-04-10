#!/usr/bin/env node
import { Command } from "commander";
import inquirer from "inquirer";
import { run } from "./run.js";

const program = new Command();

program
  .command("heal")
  .description("Heal your source code")
  .option("-model --m", "The model to use for healing")
  .option("-api_key --k", "OpenAI API key")
  .option("-test_command --t", "Command to run tests")
  .action(() => {
    const prompts = [
      {
        type: "input",
        name: "testCommand",
        message: "What is the command to run the tests?",
        default: "npm test",
      },
      {
        type: "list",
        name: "model",
        message: "Which OpenAI model?",
        choices: [
          {
            name: "gpt-3.5-turbo",
            value: "gpt-3.5-turbo",
          },
          {
            name: "gpt-4 (account access required)",
            value: "gpt-4",
          },
        ],
      },
    ];

    inquirer.prompt(prompts).then(async (answers) => {
      run(answers);
    });
  });

program.parse(process.argv);
