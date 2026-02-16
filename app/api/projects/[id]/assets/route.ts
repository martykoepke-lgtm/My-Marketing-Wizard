import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generate } from "@/lib/claude";
import { v4 as uuid } from "uuid";
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
  const db = getDb();
  const assets = db
    .prepare(
      `SELECT a.*,
        (SELECT COUNT(*) FROM assets a2 WHERE a2.project_id = a.project_id AND a2.asset_type = a.asset_type) as version_count
      FROM assets a WHERE a.project_id = ? ORDER BY a.created_at DESC`
    )
    .all(id);
  return NextResponse.json(assets);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { asset_type, platform } = await request.json();
  const db = getDb();

  // Get brandscript
  const bs = db
    .prepare(
      "SELECT content_json FROM brandscripts WHERE project_id = ? ORDER BY created_at DESC LIMIT 1"
    )
    .get(id) as { content_json: string } | undefined;

  let brandscript: Record<string, unknown> = {};
  if (bs) {
    try {
      brandscript = JSON.parse(bs.content_json);
    } catch {}
  }

  // Get discovery answers
  const answers = db
    .prepare("SELECT question_key, answer FROM discovery_answers WHERE project_id = ?")
    .all(id) as Array<{ question_key: string; answer: string }>;

  const discoveryMap: Record<string, string> = {};
  for (const a of answers) {
    discoveryMap[a.question_key] = a.answer;
  }

  // Count existing versions
  const versionCount = db
    .prepare(
      "SELECT COUNT(*) as count FROM assets WHERE project_id = ? AND asset_type = ?"
    )
    .get(id, asset_type) as { count: number };

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

  const assetId = uuid();
  db.prepare(
    "INSERT INTO assets (id, project_id, asset_type, title, content, version) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(
    assetId,
    id,
    asset_type,
    ASSET_LABELS[asset_type] || asset_type,
    result,
    versionCount.count + 1
  );

  return NextResponse.json({
    id: assetId,
    project_id: id,
    asset_type,
    title: ASSET_LABELS[asset_type] || asset_type,
    content: result,
    version: versionCount.count + 1,
  });
}
