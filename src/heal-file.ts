import { readFile } from "fs/promises";
import { prompt } from "./prompt.js";
import chalk from "chalk";
import { readFileSync, writeFileSync } from "fs";
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import ora from "ora";

export async function healFile(filePath: string, testDetails: string) {
  const fileContent = readFileSync(filePath, { encoding: "utf-8" });

  const rawFile = await prompt([
    ...promptMessages,
    {
      role: "user",
      content: `Test results:\n\`\`\`\n${testDetails}\n\`\`\`\n\nFile contents:\n\`\`\`\n${fileContent}\n\`\`\`\n`,
    },
  ]);

  if (!rawFile) {
    return {
      filePath,
      healDescription: "Unable to heal file",
    };
  }

  const [healDescription, newFile] = rawFile.split("```");

  // Write file
  writeFileSync(filePath, newFile || "");

  return {
    filePath,
    healDescription,
  };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const promptMessages: ChatCompletionRequestMessage[] = [
  {
    role: "system",
    content:
      "You are an expert typescript programming assistant. You reply in a very structured format when specified",
  },
  {
    role: "user",
    content:
      "I will give you the results of a unit test run and the suspected file" +
      " that is causing the failed test. You will only reply with a very brief" +
      " description of the possible issue (in past tense) and the content of the fixed file between the triple backticks.",
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

File contents:
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
