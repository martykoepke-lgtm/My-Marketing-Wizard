"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function ImportPage() {
  const params = useParams<{ id: string }>();
  const [content, setContent] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    extracted: Record<string, string>;
    saved: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setImporting(true);
    setError(null);
    setResult(null);

    const res = await fetch(`/api/projects/${params.id}/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Import failed");
    } else {
      setResult(data);
    }

    setImporting(false);
  }

  const FIELD_LABELS: Record<string, string> = {
    business_name: "Business Name",
    business_description: "Business Description",
    audience_primary: "Primary Audience",
    audience_secondary: "Secondary Audience",
    customer_desire: "Customer Desire",
    external_problem: "External Problem",
    internal_problem: "Internal Problem",
    philosophical_problem: "Philosophical Problem",
    villain: "The Villain",
    empathy_statement: "Empathy Statement",
    authority_credentials: "Authority / Credentials",
    plan_step_1: "Plan Step 1",
    plan_step_2: "Plan Step 2",
    plan_step_3: "Plan Step 3",
    failure_state: "Failure State",
    success_state: "Success State",
    origin_struggle: "Origin Struggle",
    origin_tool: "Origin Tool",
    origin_mission: "Origin Mission",
    differentiator: "Differentiator",
    main_objection: "Main Objection",
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Import</h1>
        <p className="text-text-secondary mt-1">
          Paste content from other tools — AI will extract discovery answers
        </p>
      </div>

      <form onSubmit={handleImport} className="mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Paste your content
          </label>
          <p className="text-xs text-text-muted mb-3">
            Competitor analysis, brand documents, customer research, marketing
            briefs, website copy — anything that describes a business and its
            customers.
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your content here..."
            rows={12}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={importing || !content.trim()}
          className="px-6 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {importing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : (
            "Extract Discovery Answers"
          )}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text-primary">
              Extracted Answers
            </h2>
            <span className="text-sm text-success font-medium">
              {result.saved} fields saved to Discovery
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(result.extracted)
              .filter(
                ([, value]) =>
                  typeof value === "string" && value.trim()
              )
              .map(([key, value]) => (
                <div key={key} className="border-b border-border pb-3 last:border-0">
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                    {FIELD_LABELS[key] || key}
                  </span>
                  <p className="text-sm text-text-primary mt-1">
                    {String(value)}
                  </p>
                </div>
              ))}
          </div>

          <div className="mt-6 flex gap-3">
            <a
              href={`/project/${params.id}/discover`}
              className="px-5 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors text-sm"
            >
              Review in Discovery
            </a>
            <a
              href={`/project/${params.id}/brandscript`}
              className="px-5 py-2.5 border border-border text-text-secondary rounded-lg hover:bg-surface-tertiary transition-colors text-sm"
            >
              Generate BrandScript
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
