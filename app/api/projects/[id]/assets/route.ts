import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generate } from "@/lib/claude";
import type { AssetType } from "@/lib/prompts";

const ASSET_LABELS: Record<string, string> = {
  "one-liner": "One-Liner",
  "origin-story-short": "Origin Story (Short)",
  "origin-story-extended": "Origin Story (Extended)",
  "elevator-pitch": "Elevator Pitch",
  "sound-bites": "Sound Bites",
  "landing-page": "Landing Page Copy",
  "social-media": "Social Media Series",
  "cold-email": "Cold Email + Follow-ups",
  "pitch-deck": "Pitch Deck Outline",
  "executive-brief": "Executive Brief",
};

const ASSET_PROMPTS: Record<string, string> = {
  "one-liner":
    "Generate 3 one-liner variations using the Problem → Product → Result formula. For each audience segment in the BrandScript, create at least one. Format: clearly label each variation.",
  "origin-story-short":
    "Write a compelling 4-part origin story (The Hole, The Tool, The Mission, The Transformation) suitable for an About Us page or elevator conversation.",
  "origin-story-extended":
    "Write a full 8-part origin story (The Hole, The Calling, The Refinement, The Dark Knight, The Miracle, The Breakthrough, The Better World, The Moral) suitable for a brand video or keynote.",
  "elevator-pitch":
    "Write a 30-60 second elevator pitch. It should open a story loop with the problem, bridge to the product, and close with the result. Include delivery notes.",
  "sound-bites":
    "Generate 10 sound bite candidates. Use these structures: contrast, unexpected specificity, problem-as-hook, challenge to assumption, compressed story, aspirational identity. Mark the top 5.",
  "landing-page":
    "Write complete landing page copy following all 10 sections: Hero, Problem, Guide Story, Features, Differentiator, Pattern Interrupt, Pricing/Value, Who It's For, FAQ, Final CTA. Include headlines, body copy, and CTA text for each section.",
  "social-media":
    "Create a 6-post content series: (1) The Invisible Problem, (2) The Objection Killer, (3) The Pain Point Mirror, (4) The Origin Story, (5) The Flexibility Angle, (6) The Price Anchor. Format each with hook, body, and CTA.",
  "cold-email":
    "Write a 5-email outreach sequence: (1) Problem-first outreach, (2) Social proof/results, (3) Origin story, (4) Objection handling, (5) Direct CTA with urgency. Include subject lines.",
  "pitch-deck":
    "Create a pitch deck outline with slide-by-slide content: Problem slides (go deeper, deeper, deeper), Solution, Plan, Results/Case Studies, CTA. Include speaker notes.",
  "executive-brief":
    "Write a complete executive brief: Executive Summary, Business Problem (with data), Proposed Solution, Expected Outcomes, Investment Required, Risk of Inaction, Recommendation.",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();

  const { rows: assets } = await db.execute({
    sql: "SELECT * FROM assets WHERE project_id = ? ORDER BY created_at DESC",
    args: [id],
  });

  const typeCounts: Record<string, number> = {};
  for (const a of assets) {
    const t = a.asset_type as string;
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  }

  const result = assets.map((a) => ({
    ...a,
    version_count: typeCounts[a.asset_type as string] || 0,
  }));

  return NextResponse.json(result);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { asset_type, platform } = await request.json();
  const db = await getDb();

  // Get brandscript
  const { rows: bsRows } = await db.execute({
    sql: "SELECT content_json FROM brandscripts WHERE project_id = ? ORDER BY created_at DESC LIMIT 1",
    args: [id],
  });

  let brandscript: Record<string, unknown> = {};
  if (bsRows[0]) {
    const raw = bsRows[0].content_json as string;
    try { brandscript = JSON.parse(raw); } catch { /* empty */ }
  }

  // Get discovery answers
  const { rows: answerRows } = await db.execute({
    sql: "SELECT question_key, answer FROM discovery_answers WHERE project_id = ?",
    args: [id],
  });

  const discoveryMap: Record<string, string> = {};
  for (const a of answerRows) {
    discoveryMap[a.question_key as string] = a.answer as string;
  }

  // Count existing versions
  const { rows: countRows } = await db.execute({
    sql: "SELECT COUNT(*) as cnt FROM assets WHERE project_id = ? AND asset_type = ?",
    args: [id, asset_type],
  });
  const versionCount = Number(countRows[0]?.cnt ?? 0);

  const prompt = ASSET_PROMPTS[asset_type] || `Generate a ${asset_type} asset.`;
  const platformNote = platform ? ` Target platform: ${platform}.` : "";

  const result = await generate({
    task: "asset",
    assetType: asset_type as AssetType,
    discoveryAnswers: discoveryMap,
    brandscript,
    platform,
    userMessage: prompt + platformNote,
  });

  const assetId = crypto.randomUUID();
  await db.execute({
    sql: "INSERT INTO assets (id, project_id, asset_type, title, content, version) VALUES (?, ?, ?, ?, ?, ?)",
    args: [assetId, id, asset_type, ASSET_LABELS[asset_type] || asset_type, result, versionCount + 1],
  });

  const { rows } = await db.execute({
    sql: "SELECT * FROM assets WHERE id = ?",
    args: [assetId],
  });

  return NextResponse.json(rows[0]);
}
