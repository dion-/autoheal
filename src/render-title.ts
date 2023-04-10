import gradient from "gradient-string";
import { getUserPkgManager } from "./pkgman.js";

// Pink gradient
const theme = [
    "#a7ff64",
    "#ffffff",
    "#ffffff",
    "#a7ff64",
]              
const title = `                                                                             
————————————————————————————————————————————————————————
                  dP          dP                      dP 
                  88          88                      88 
.d8888b.dP    dPd8888P.d8888b.88d888b..d8888b..d8888b.88 
88'  \`8888    88  88  88'  \`8888'  \`8888ooood888'  \`8888 
88.  .8888.  .88  88  88.  .8888    8888.  ...88.  .8888 
\`88888P8\`88888P'  dP  \`88888P'dP    dP\`88888P'\`88888P8dP
————————————————————————————————————————————————————————
`;                                            

export const renderTitle = () => {
  // resolves weird behavior where the ascii is offset
  const pkgManager = getUserPkgManager();
  if (pkgManager === "yarn" || pkgManager === "pnpm") {
    console.log("");
  }
  console.log(gradient(theme).multiline(title));
};
