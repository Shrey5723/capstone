export async function createModel() {
  const provider = (process.env.MODEL_PROVIDER || "gemini").trim().toLowerCase();

  // Verify default models against each provider's current supported model list
  const DEFAULT_MODELS = {
    gemini: "gemini-3.5-flash-lite",
    groq: "openai/gpt-oss-120b",
    mistral: "mistral-medium-latest",
  };

  if (!["gemini", "groq", "mistral"].includes(provider)) {
    throw new Error(
      `Unsupported MODEL_PROVIDER "${process.env.MODEL_PROVIDER}". Supported providers are: gemini, groq, mistral.`
    );
  }

  const modelName = process.env.MODEL_NAME?.trim() || DEFAULT_MODELS[provider];
  const temperature =
    process.env.MODEL_TEMPERATURE != null && process.env.MODEL_TEMPERATURE !== ""
      ? Number(process.env.MODEL_TEMPERATURE)
      : 0.2;

  let model;

  if (provider === "gemini") {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("Missing required environment variable: GOOGLE_API_KEY");
    }
    const { ChatGoogleGenerativeAI } = await import("@langchain/google-genai");
    model = new ChatGoogleGenerativeAI({
      model: modelName,
      apiKey,
      temperature,
    });
  } else if (provider === "groq") {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("Missing required environment variable: GROQ_API_KEY");
    }
    const { ChatGroq } = await import("@langchain/groq");
    model = new ChatGroq({
      model: modelName,
      apiKey,
      temperature,
    });
  } else if (provider === "mistral") {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      throw new Error("Missing required environment variable: MISTRAL_API_KEY");
    }
    const { ChatMistralAI } = await import("@langchain/mistralai");
    model = new ChatMistralAI({
      model: modelName,
      apiKey,
      temperature,
    });
  }

  console.log(`[ai] provider=${provider} model=${modelName}`);
  return model;
}
