import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function GET() {
  const db = getDb();
  const projects = db
    .prepare(
      `SELECT p.*,
        (SELECT COUNT(*) FROM assets a WHERE a.project_id = p.id) as asset_count,
        (SELECT COUNT(*) FROM discovery_answers d WHERE d.project_id = p.id) as answer_count
      FROM projects p ORDER BY p.updated_at DESC`
    )
    .all();
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const { name, description } = await request.json();
  const db = getDb();
  const id = uuid();
  db.prepare(
    "INSERT INTO projects (id, name, description) VALUES (?, ?, ?)"
  ).run(id, name, description || "");
  const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
  return NextResponse.json(project, { status: 201 });
}
