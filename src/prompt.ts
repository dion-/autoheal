import chalk from "chalk";
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";

export async function prompt(
  messages: ChatCompletionRequestMessage[],
  model: "gpt-3.5-turbo" | "gpt-4" | "gpt-3.5-turbo-16k"
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
