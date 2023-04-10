import { prompt } from "./prompt.js";

export async function explainTestResults(
  testDetails: string,
  model: "gpt-3.5-turbo" | "gpt-4"
) {
  const explanation = await prompt(
    [
      {
        role: "system",
        content: "You are a programming assisstant ",
      },
      {
        role: "user",
        content:
          "Test run results:\n```" +
          testDetails.slice(model === 'gpt-4' ? -2000 : -1200) +
          "\n```\n" +
          "Respond very briefly describing the possible issues with the tests. Be extremely clear and brief. Use lists and bullet points",
      },
    ],
    model
  );

  return explanation;
}
