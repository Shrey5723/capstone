import "dotenv/config"; // must come first so process.env is populated
import { createAgent } from "langchain";
import { createModel } from "./model.js";
import { patchFile, readFiles, listFiles, updateFiles, checkApp } from "./tools.js";
import { SYSTEM_PROMPT } from "./prompt.js";

const model = await createModel();

const agent = createAgent({
  model,
  tools: [patchFile, readFiles, listFiles, updateFiles, checkApp],
  systemPrompt: SYSTEM_PROMPT,
});

export default agent;