import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generate } from "@/lib/claude";
import { v4 as uuid } from "uuid";
import { KEY_TO_STEP } from "@/lib/coverage";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { content } = await request.json();

  const result = await generate({
    task: "import",
    userMessage: `Extract discovery answers from the following content:\n\n${content}`,
  });

  let parsed: Record<string, unknown>;
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch?.[0] ?? result);
  } catch {
    return NextResponse.json(
      { error: "Could not parse AI response", raw: result },
      { status: 422 }
    );
  }

  // Handle plan_steps array -> individual keys
  if (Array.isArray(parsed.plan_steps)) {
    const steps = parsed.plan_steps as string[];
    steps.forEach((step, i) => {
      if (i < 4) parsed[`plan_step_${i + 1}`] = step;
    });
    delete parsed.plan_steps;
  }

  // Handle audiences array -> primary/secondary
  if (Array.isArray(parsed.audiences)) {
    const audiences = parsed.audiences as string[];
    if (audiences[0]) parsed.audience_primary = audiences[0];
    if (audiences[1]) parsed.audience_secondary = audiences[1];
    delete parsed.audiences;
  }

  // Map authority to authority_credentials
  if (parsed.authority && !parsed.authority_credentials) {
    parsed.authority_credentials = parsed.authority;
    delete parsed.authority;
  }

  // Save to DB
  const db = getDb();
  const upsert = db.prepare(`
    INSERT INTO discovery_answers (id, project_id, step_number, question_key, answer)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(project_id, question_key) DO UPDATE SET
      answer = excluded.answer,
      step_number = excluded.step_number
  `);

  const saveAll = db.transaction(
    (items: Array<{ key: string; value: string; step: number }>) => {
      for (const item of items) {
        upsert.run(uuid(), id, item.step, item.key, item.value);
      }
    }
  );

  const items: Array<{ key: string; value: string; step: number }> = [];
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value === "string" && value.trim() && KEY_TO_STEP[key]) {
      items.push({ key, value: value.trim(), step: KEY_TO_STEP[key] });
    }
  }

  if (items.length > 0) {
    saveAll(items);
    db.prepare(
      "UPDATE projects SET updated_at = datetime('now') WHERE id = ?"
    ).run(id);
  }

  return NextResponse.json({
    extracted: parsed,
    saved: items.length,
  });
}
