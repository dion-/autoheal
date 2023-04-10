<p align="center">
  <img src="https://raw.githubusercontent.com/dion-/autoheal/6aa72b7e5c1f7a72d93a16aed8e8c08265d10dfa/autoheal.png" width="130" alt="Autoheal Logo" />
</p>

# autoheal CLI

Auto GPT Agent which automatically fixes code based on failing tests.

https://user-images.githubusercontent.com/2049913/230871441-c159432b-1984-499c-978a-fa7f66efb91a.mp4

<br/>

## How does it work?
<br>
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

This depends on many factors, including the size and structure of your project and the quality of your tests. In general, it works best on projects will smaller files. Using GPT-4 is much more reliable than GPT-3.5-turbo, but it is also much more expensive (as of April 2023)

<br/>

## Test Driven Development + AI workflow

GPT4 is very capable at writing code, however it can be challenging describing the specifics of the software you want to develop to GPT4 as well as verify the software behaves as you intend. Automated tests can serve as a way to precisely describe the specificiations of software and to verify its functionality. TDD can be used to more precisely steer the GPT's development power.
<br/>
![TDD](https://user-images.githubusercontent.com/2049913/230879688-219a8328-bad5-46c2-995d-035421cee981.png)


