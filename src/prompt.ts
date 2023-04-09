import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY as string,
});
const openai = new OpenAIApi(configuration);
export async function prompt(messages: ChatCompletionRequestMessage[]) {
  const searchTermsResponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0.8,
    messages,
  });

  return searchTermsResponse.data.choices[0]?.message?.content;
}
