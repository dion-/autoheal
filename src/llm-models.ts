export const languageModels = {
  "gpt-4": "gpt-4",
  "gpt-4-turbo-preview": "gpt-4-turbo-preview",
  "gpt-3.5-turbo": "gpt-3.5-turbo",
} as const;

export type LanguageModelName = keyof typeof languageModels;
