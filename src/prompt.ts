import chalk from "chalk";
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import { languageModels } from "./llm-models.js";

export async function prompt(
  messages: ChatCompletionRequestMessage[],
  model: keyof typeof languageModels
) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY as string,
  });
  const openai = new OpenAIApi(configuration);
  try {
    const searchTermsResponse = await openai.createChatCompletion({
      model,
      temperature: 0.9,
      messages,
    });
    return searchTermsResponse.data.choices[0]?.message?.content;
  } catch (e: any) {
    if (e.response.data.error) {
      console.log(
        chalk.red('\nOpenAI API error: "' + e.response.data.error.message + '"')
      );
    } else {
      console.log(chalk.red("\nOpenAI API error: " + e.message));
    }
    return "";
  }
}
