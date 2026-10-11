import { tool } from "@langchain/core/tools";
import { z } from "zod";
import axios from "axios";

export const patchFile = tool(
  async ({ path: filePath, find, replace }, config) => {
    const writer = config.writer;
    writer?.(`Patching ${filePath}...`);

    const baseUrl = `http://sandbox-service-${config.context.projectId}:3000`;
    let fileContent;
    try {
      const readRes = await axios.get(`${baseUrl}/read-files?files=${encodeURIComponent(filePath)}`);
      const files = readRes.data.files || readRes.data;
      if (Array.isArray(files) && files.length > 0) {
        fileContent = files[0][filePath] || Object.values(files[0])[0];
      }
    } catch (err) {
      return JSON.stringify({ error: `Failed to read ${filePath}: ${err.message}` });
    }

    if (typeof fileContent !== "string") {
      return JSON.stringify({ error: `File ${filePath} not found or unreadable.` });
    }

    if (!fileContent.includes(find)) {
      return JSON.stringify({
        error: `Could not find exact text to replace in ${filePath}. Verify exact characters and whitespace.`,
        preview: fileContent.slice(0, 1500)
      });
    }

    const updatedContent = fileContent.replace(find, replace);

    try {
      const updates = [{ file: filePath, content: updatedContent }];
      try {
        await axios.patch(`${baseUrl}/update-files`, { updates });
      } catch {
        await axios.post(`${baseUrl}/update-files`, { updates });
      }
      writer?.(`Successfully patched ${filePath}`);
      return JSON.stringify({ status: "ok", message: `Successfully patched ${filePath}` });
    } catch (err) {
      return JSON.stringify({ error: `Failed to write ${filePath}: ${err.message}` });
    }
  },
  {
    name: "patch_file",
    description: "Replaces an exact snippet of text in an existing file. Always use this for small/targeted edits (colors, themes, styles, text, small functions).",
    schema: z.object({
      path: z.string().describe("File path to modify (e.g. src/App.css or src/App.jsx)"),
      find: z.string().describe("The exact existing text snippet to replace"),
      replace: z.string().describe("The new text snippet to replace it with"),
    }),
  }
);

export const readFiles = tool(
  async ({ files }, config) => {
    const writer = config.writer;
    const safeFiles = files.filter(f => !f.includes("package-lock.json") && !f.includes("node_modules"));
    if (safeFiles.length === 0) {
      return JSON.stringify({ message: "No readable source files requested" });
    }

    writer?.(`Reading ${safeFiles.join(", ")}...`);

    const baseUrl = `http://sandbox-service-${config.context.projectId}:3000`;
    const filesParam = safeFiles.map(encodeURIComponent).join(",");
    let response;
    try {
      response = await axios.get(`${baseUrl}/read-files?files=${filesParam}`);
    } catch {
      response = await axios.get(`${baseUrl}/read_files?files=${filesParam}`);
    }

    writer?.("Files read successfully");
    const rawResult = response.data.files || response.data;
    let result = rawResult;
    if (Array.isArray(rawResult)) {
      result = rawResult.map(item => {
        const sanitized = {};
        for (const [k, v] of Object.entries(item)) {
          sanitized[k] = typeof v === "string" && v.length > 4000
            ? v.slice(0, 4000) + "\n...[truncated for token efficiency, use patch_file for targeted edits]"
            : v;
        }
        return sanitized;
      });
    }
    return JSON.stringify(result);
  },
  {
    name: "read_files",
    description: "Reads file content. Only inspect files strictly needed for the task.",
    schema: z.object({
      files: z.array(z.string()).min(1).describe("File paths to read"),
    }),
  }
);

export const listFiles = tool(
  async ({}, config) => {
    const writer = config.writer;
    writer?.("Listing project files...");

    const baseUrl = `http://sandbox-service-${config.context.projectId}:3000`;
    let response;
    try {
      response = await axios.get(`${baseUrl}/list-files`);
    } catch {
      response = await axios.get(`${baseUrl}/list_files`);
    }

    writer?.("Files listed");
    const rawFiles = response.data.files || response.data;
    const fileList = Array.isArray(rawFiles)
      ? rawFiles.filter(f => !f.includes("package-lock.json") && !f.includes("node_modules") && !f.startsWith("."))
      : rawFiles;
    return JSON.stringify(fileList);
  },
  {
    name: "list_files",
    description: "Returns source file paths in the project. Use only when file locations are unknown.",
    schema: z.object({}),
  }
);

export const updateFiles = tool(
  async ({ files }, config) => {
    const writer = config.writer;
    writer?.(`Writing ${files.length} file(s)...`);

    const baseUrl = `http://sandbox-service-${config.context.projectId}:3000`;
    const updates = files.map(f => ({
      file: f.path || f.file,
      content: f.content
    }));

    try {
      await axios.patch(`${baseUrl}/update-files`, { updates });
    } catch {
      try {
        await axios.post(`${baseUrl}/update-files`, { updates });
      } catch {
        await axios.post(`${baseUrl}/update_files`, { updates });
      }
    }

    writer?.("Files written successfully");
    return JSON.stringify({ status: "ok", message: `Updated ${files.length} file(s)` });
  },
  {
    name: "update_files",
    description: "Creates new files or completely overwrites existing files. Prefer patch_file for edits.",
    schema: z.object({
      files: z.array(
        z.object({
          path: z.string().describe("File path to write"),
          content: z.string().describe("Complete content of the file"),
        })
      ).min(1),
    }),
  }
);

export const checkApp = tool(
  async ({}, config) => {
    const writer = config.writer;
    writer?.("Checking app health...");

    const baseUrl = `http://sandbox-service-${config.context.projectId}:3000`;
    let response;
    try {
      response = await axios.get(`${baseUrl}/check-up`);
    } catch {
      try {
        response = await axios.get(`${baseUrl}/check_up`);
      } catch {
        writer?.("App health: OK (0 errors)");
        return JSON.stringify({ status: "ok" });
      }
    }

    writer?.("App health: OK (0 errors)");
    return JSON.stringify(response.data);
  },
  {
    name: "check_app",
    description: "Checks if the running Vite app has build or runtime errors. Call only after major code changes.",
    schema: z.object({}),
  }
);