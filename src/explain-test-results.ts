import { LanguageModelName } from "./llm-models.js";
import { prompt } from "./prompt.js";

export async function explainTestResults(
  testDetails: string,
  model: LanguageModelName
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
          testDetails.slice(model === "gpt-4" ? -2000 : -1200) +
          "\n```\n" +
          "Respond very briefly describing the possible issues with the tests. Be extremely clear and brief. Use lists and bullet points symbols (not stars)",
      },
    ],
    model
  );

  return explanation;
}
