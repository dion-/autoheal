<p align="center">
  <img src="https://raw.githubusercontent.com/dion-/autoheal/6aa72b7e5c1f7a72d93a16aed8e8c08265d10dfa/autoheal.png" width="130" alt="Autoheal Logo" />
</p>

# autoheal CLI

Auto GPT Agent which automatically fixes code based on failing tests.

https://user-images.githubusercontent.com/2049913/230871441-c159432b-1984-499c-978a-fa7f66efb91a.mp4

<br/>

## How does it work?

Tests can be a reliable description of the expected behavior of a program. When structured well, failing test results can be analysed by GPT-4 to determine possible fixes to the code. GPT-4 can then automatically implement fixes and verify they work by running the tests again.

<br>
<img src="https://raw.githubusercontent.com/dion-/autoheal/857b58e669e6d54ca6141cbf2cae56936d2d9dae/autoheal-diagram.png" alt="Autoheal Logo" />

<br/>

## How to use

In your project directory, run:

```
npx autoheal
```

Uses OpenAI's GPT-3.5-turbo or GTP-4 APIs. [Requires OpenAI API key.](https://beta.openai.com/)

You can press _[Enter]_ during the run to pause the process and provide a hint better guide autoheal.

⚠️ **AUTOHEAL WILL MODIFY FILES IN YOUR PROJECT – BE SURE TO COMMIT ANY UNSAVED CHANGES BEFORE RUNNING**

<br/>

## How well does it work?

This project is still very experimental and may not always produce good results, so run with caution. The following factors can influence the effectiveness of autoheal:

### _Nature of the bug or feature_

Simplier bugs or features that can be resolved in changes to single files will have most success.

### _Quality of the tests and test failure output_

Test failures that provide enough information (diffs, stack traces etc.) to determine possible paths to fix will have best results. Running tests in a mode that only output failing tests may improve results.

### _Structure and size of the project_

Projects with smaller and well-named files have better results. Autoheal's strategy is limited by openAI's token limit, so infers details by file names.

### _Hints provided_

You can provide a freeform hint to autoheal to provide more specific details (e.g., specific files, or possible ways to fix the bug). This can be useful when the test failure output is not enough to determine a fix.

### _Model used_

Using GPT-4 is much more reliable than GPT-3.5-turbo because it generally produces better results and has a larger token limit. I do not have access, but suspect OpenAI's 32k token model will enable much more effective strategies in the near future.

<br/>

## Test Driven Development + AI workflow

GPT-4 is very capable at writing code, however it can be challenging describing the specifics of the software you want to develop to GPT-4 as well as verify the software behaves in the intended way without subtle bugs. Automated tests can serve as a way to precisely describe the specifications of software and to automatically verify intended functionality. TDD can be used to more precisely steer GPT-4's development power.

<br/>

![TDD](https://user-images.githubusercontent.com/2049913/230879688-219a8328-bad5-46c2-995d-035421cee981.png)
