import {prompt} from "./prompt.js";

export function summariseTestDetails(testDetails: string) {
    // Prompt may get better results...?
    // return prompt([
    //     {
    //         "role": "system",
    //         "content": "You are an programming assistant"
    //     },
    //     {
    //         "role": "user",
    //         "content": ""
    //     },
    // ]);

    // Return only last 2000 characters
    return testDetails.slice(-2000);
}
