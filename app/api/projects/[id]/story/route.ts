import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generate } from "@/lib/claude";
import { v4 as uuid } from "uuid";
import {
  KEY_TO_STEP,
  computeCoverage,
  formatCoverageGaps,
} from "@/lib/coverage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const messages = db
    .prepare(
      "SELECT role, message, parsed_fields, created_at FROM story_sessions WHERE project_id = ? ORDER BY created_at ASC"
    )
    .all(id) as Array<{
    role: string;
    message: string;
    parsed_fields: string | null;
    created_at: string;
  }>;

  const answers = db
    .prepare(
      "SELECT question_key, answer FROM discovery_answers WHERE project_id = ?"
    )
    .all(id) as Array<{ question_key: string; answer: string }>;

  const answerMap: Record<string, string> = {};
  for (const a of answers) {
    answerMap[a.question_key] = a.answer;
  }

  const coverage = computeCoverage(answerMap);

  return NextResponse.json({
    messages: messages.map((m) => ({
      role: m.role,
      message: m.message,
      parsedFields: m.parsed_fields ? JSON.parse(m.parsed_fields) : null,
      createdAt: m.created_at,
    })),
    coverage,
  });
}

function parseStoryResponse(raw: string): {
  conversational: string;
  parsedFields: Record<string, string> | null;
} {
  const marker = "---PARSED---";
  const endMarker = "---END---";

  const markerIndex = raw.indexOf(marker);
  if (markerIndex === -1) {
    return { conversational: raw.trim(), parsedFields: null };
  }

  const conversational = raw.substring(0, markerIndex).trim();
  const endIndex = raw.indexOf(endMarker, markerIndex);
  const jsonStr = raw
    .substring(
      markerIndex + marker.length,
      endIndex === -1 ? raw.length : endIndex
    )
    .trim();

  let parsedFields: Record<string, string> | null = null;
  try {
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsedFields = JSON.parse(jsonMatch[0]);
    }
  } catch {
    parsedFields = null;
  }

  return { conversational, parsedFields };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { message } = await request.json();
  const db = getDb();

  // Load chat history
  const history = db
    .prepare(
      "SELECT role, message FROM story_sessions WHERE project_id = ? ORDER BY created_at ASC"
    )
    .all(id) as Array<{ role: string; message: string }>;

  // Truncate long conversations: keep first 2 + last 30
  let chatHistory = history.map((h) => ({
    role: h.role as "user" | "assistant",
    content: h.message,
  }));
  if (chatHistory.length > 40) {
    chatHistory = [
      ...chatHistory.slice(0, 2),
      ...chatHistory.slice(-30),
    ];
  }

  // Load current discovery answers
  const answers = db
    .prepare(
      "SELECT question_key, answer FROM discovery_answers WHERE project_id = ?"
    )
    .all(id) as Array<{ question_key: string; answer: string }>;

  const answerMap: Record<string, string> = {};
  for (const a of answers) {
    answerMap[a.question_key] = a.answer;
  }

  const coverage = computeCoverage(answerMap);

  const filledLines = Object.entries(answerMap)
    .filter(([, v]) => v.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  // Save user message
  db.prepare(
    "INSERT INTO story_sessions (id, project_id, role, message) VALUES (?, ?, 'user', ?)"
  ).run(uuid(), id, message);

  // Call Claude
  const result = await generate({
    task: "story-session",
    chatHistory,
    userMessage: message,
    coverageGaps: formatCoverageGaps(coverage),
    filledFields: filledLines || "(none yet)",
  });

  // Parse response
  const { conversational, parsedFields } = parseStoryResponse(result);

  // Save parsed fields to discovery_answers
  if (parsedFields && Object.keys(parsedFields).length > 0) {
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
    for (const [key, value] of Object.entries(parsedFields)) {
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
  }

  // Save assistant message
  db.prepare(
    "INSERT INTO story_sessions (id, project_id, role, message, parsed_fields) VALUES (?, ?, 'assistant', ?, ?)"
  ).run(
    uuid(),
    id,
    conversational,
    parsedFields && Object.keys(parsedFields).length > 0
      ? JSON.stringify(parsedFields)
      : null
  );

  // Recompute coverage
  const updatedAnswers = db
    .prepare(
      "SELECT question_key, answer FROM discovery_answers WHERE project_id = ?"
    )
    .all(id) as Array<{ question_key: string; answer: string }>;

  const updatedMap: Record<string, string> = {};
  for (const a of updatedAnswers) {
    updatedMap[a.question_key] = a.answer;
  }
  const updatedCoverage = computeCoverage(updatedMap);

  return NextResponse.json({
    role: "assistant",
    message: conversational,
    parsedFields: parsedFields || {},
    coverage: updatedCoverage,
  });
}
