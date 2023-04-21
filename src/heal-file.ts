import chalk from "chalk";
import { prompt } from "./prompt.js";
import { readFileSync, writeFileSync } from "fs";
import { ChatCompletionRequestMessage } from "openai";

export async function healFile(
  filePath: string,
  otherFiles: string[],
  testDetails: string,
  hint: string,
  model: "gpt-3.5-turbo" | "gpt-4"
) {
  const fileContent = readFileSync(filePath, { encoding: "utf-8" });

  try {
    const rawFile = await prompt(
      [
        ...promptMessages,
        {
          role: "user",
          content: [
            hint ? `${hint}\n\n` : "",
            otherFiles.length
              ? `Other files fixed:\n\`\`\`\n${otherFiles.join(
                  "\n"
                )}\n\`\`\`\n\n`
              : "",
            `Test results:\n\`\`\`\n${testDetails}\n\`\`\`\`\n\n`,
            `File to fix: ${filePath}\n\`\`\`\n${fileContent}\n\`\`\``,
          ].join(""),
        },
      ],
      model
    );

    if (!rawFile) {
      console.log(chalk.red("failed to heal, raw text", rawFile));
      return {
        filePath,
        healDescription: "Unable to heal file",
      };
    }

    const [healDescription, newFileRaw] = rawFile.split("```");
    const newFile = newFileRaw.replace("\n", ""); // Replace first newline

    if (newFile) {
      writeFileSync(filePath, newFile || "");
    }

    return {
      filePath,
      healDescription,
    };
  } catch (e: any) {
    console.log(chalk.red(e.message));

    return {
      filePath,
      healDescription: "Unable to heal file",
    };
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const promptMessages: ChatCompletionRequestMessage[] = [
  {
    role: "system",
    content: "You are an expert typescript programming assistant.",
  },
  {
    role: "user",
    content:
      "I will give you the results of a unit test run and a suspected file" +
      " that may be contributing to the failed test. The file may only be contributing" +
      " to some or none of the failing tests which you will take into account when fixing the file. " +
      "You may be given a list of other files already fixed by other agents, take this into account when deciding whether to fix the file or not. " +
      "Add a comment explaining each change in the fixed file prefixed with @autoheal" +
      "You will only reply with a very brief" +
      " description of the possible issue (in past tense) and the content of the fixed file between the triple backticks." +
      "The fixed file should conform to style and format of the file and should try to ac.",
  },
  {
    role: "assistant",
    content: "Acknowledged.",
  },
  {
    role: "user",
    content: `Test results:
\`\`\`
Order.test.ts:
 7 | test("Order can add products", () => {
 8 |   const order = new Order();
 9 | 
10 |   expect(order.getLineItems()).toStrictEqual([]);
11 |   order.addLineItem(testLineItem);
12 |   expect(order.getLineItems()).toStrictEqual([testLineItem]);
      ^
error: expect(received).toStrictEqual(expected)

+ []
- [
-   {
-     "id": 1,
-     "product": {
-       "id": 1,
-       "name": "Product 1",
-       "price": 10
-     },
-     "quantity": 1
-   }
- ]

- Expected  - 11
+ Received  + 1

      at /Users/dion/Projects/codeai/Order.test.ts:12:2
✗ Order can add products

 0 pass
 1 fail
 2 expect() calls
Ran 1 tests across 1 files [24.00ms]
\`\`\`

File: ./src/Order.ts
\`\`\`
export class Customer {}

export class Product {
  id: number;
  name: string;
  price: number;

  constructor(id: number, name: string, price: number) {
    this.id = id;
    this.name = name;
    this.price = price;
  }
}

export class LineItem {
  id?: number;
  product: Product;
  quantity: number;

  constructor(id: number, product: Product, quantity: number) {
    this.id = id;
    this.product = product;
    this.quantity = quantity;
  }
}

export class Order {
  id?: number;
  customer?: Customer;
  private lineItems: LineItem[] = [];

  constructor(id?: number) {
    this.id = id;
  }

  async load() {}

  setLineItems(lineItems: LineItem[]) {
    this.lineItems = lineItems;
  }

  addLineItem(lineItem: LineItem) {}

  getLineItems() {
    return this.lineItems;
  }

  getTotal() {
    return this.lineItems.reduce((total, lineItem) => {
      return total + lineItem.product?.price || 0;
    }, 0);
  }
}
\`\`\`
`,
  },
  {
    role: "assistant",
    content: `Fixed \`Order.addLineItem\` implementation
\`\`\`
export class Customer {}

export class Product {
  id: number;
  name: string;
  price: number;

  constructor(id: number, name: string, price: number) {
    this.id = id;
    this.name = name;
    this.price = price;
  }
}

export class LineItem {
  id?: number;
  product: Product;
  quantity: number;

  constructor(id: number, product: Product, quantity: number) {
    this.id = id;
    this.product = product;
    this.quantity = quantity;
  }
}

export class Order {
  id?: number;
  customer?: Customer;
  private lineItems: LineItem[] = [];

  constructor(id?: number) {
    this.id = id;
  }

  async load() {}

  setLineItems(lineItems: LineItem[]) {
    this.lineItems = lineItems;
  }

  /* @autoheal Fixed \`Order.addLineItem\` implementation */
  addLineItem(lineItem: LineItem) {
    this.lineItems.push(lineItem);
  }

  getLineItems() {
    return this.lineItems;
  }

  getTotal() {
    return this.lineItems.reduce((total, lineItem) => {
      return total + (lineItem.product?.price || 0) * lineItem.quantity;
    }, 0);
  }
}
\`\`\`
      `,
  },
];
