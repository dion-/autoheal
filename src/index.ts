#!/usr/bin/env node
import { Command } from "commander";
import inquirer from "inquirer";
import { run } from "./run.js";
import { renderTitle } from "./render-title.js";
import chalk from "chalk";


const program = new Command();
renderTitle();
program
  .name('Auto Heal')
  .description("Heal your source code")
  .action(() => {
    const noApiKeyDetected = !process.env.OPENAI_API_KEY;

    const prompts = [
      ...(noApiKeyDetected ? [{
        type: "input",
        name: "apiKey",
        message: "What is your OpenAI API key?",
      }] : []),
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
      }
    ];
    if(noApiKeyDetected) {
      console.log(`OpenAI API keys can found here: ${chalk.bold('https://platform.openai.com/account/api-keys')}\n\nYou can automatically provide your API key to autoheal by adding the key to your env with:\n${chalk.dim('export OPENAI_API_KEY=key')}\n`)
    } else {
      console.log(`🔑 API key found: ${chalk.dim('env.OPENAI_API_KEY')}\n`);
    }
    
    inquirer.prompt(prompts).then(async (answers) => {
      if(answers.apiKey) {
        process.env.OPENAI_API_KEY = answers.apiKey;
        console.log('SETT');
      }
      run(answers);
    });
  });

program.parse(process.argv);
