import Anthropic from "@anthropic-ai/sdk";
import { getPromptForTask, type AssetType } from "./prompts";

const client = new Anthropic();

interface GenerateOptions {
  task: "brandscript" | "asset" | "refine" | "import" | "story-session";
  assetType?: AssetType;
  discoveryAnswers?: Record<string, string>;
  brandscript?: Record<string, unknown>;
  currentAsset?: string;
  chatHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  userMessage: string;
  platform?: string;
  coverageGaps?: string;
  filledFields?: string;
}

export async function generate(options: GenerateOptions): Promise<string> {
  const systemPrompt = getPromptForTask(options);

  const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

  if (options.chatHistory?.length) {
    messages.push(...options.chatHistory);
  }

  messages.push({ role: "user", content: options.userMessage });

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text ?? "";
}
