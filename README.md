<p align="center">
  <img src="https://raw.githubusercontent.com/dion-/autoheal/6aa72b7e5c1f7a72d93a16aed8e8c08265d10dfa/autoheal.png" width="130" alt="Autoheal Logo" />
</p>

# autoheal CLI

Auto GPT4 Agent with automatically fixes code based on failing tests.

https://user-images.githubusercontent.com/2049913/230871441-c159432b-1984-499c-978a-fa7f66efb91a.mp4

<br/>

## How does it work?

Tests can be a reliable description of the expected behavior of a program. When structured well, failing test results can be analysed by GPT-4 to determine possible fixes to the code. GPT4 can then automatically implement fixes and verify they work by running the tests again.

<img src="https://raw.githubusercontent.com/dion-/autoheal/857b58e669e6d54ca6141cbf2cae56936d2d9dae/autoheal-diagram.png" alt="Autoheal Logo" />



<br/>

## How to use





In your project directory, run:
```
npx autoheal
```

Uses OpenAI's GPT-3.5-turbo or GTP-4 APIs. [Requires OpenAI API key.](https://beta.openai.com/)

<br/>

## How well does it work?

This depends on many factors, including the size, structure and complexity of your project and the quality of your tests. In general, it works best on projects will smaller files which avoid GPT's limited context size. Using GPT-4 is much more reliable than GPT-3.5-turbo.



