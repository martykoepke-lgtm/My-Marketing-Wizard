"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";

interface BrandScript {
  character?: string;
  problem?: {
    external?: string;
    internal?: string;
    philosophical?: string;
    villain?: string;
  };
  guide?: {
    empathy?: string;
    authority?: string;
  };
  plan?: string[];
  cta?: {
    direct?: string;
    transitional?: string;
  };
  failure?: string;
  success?: string;
  raw?: string;
}

const SECTION_LABELS: Record<string, { title: string; color: string }> = {
  character: { title: "1. The Character (Hero)", color: "border-l-blue-500" },
  problem: { title: "2. Has a Problem", color: "border-l-red-500" },
  guide: { title: "3. Meets a Guide", color: "border-l-purple-500" },
  plan: { title: "4. Who Gives Them a Plan", color: "border-l-amber-500" },
  cta: { title: "5. And Calls Them to Action", color: "border-l-green-500" },
  failure: { title: "6. Helps Them Avoid Failure", color: "border-l-orange-500" },
  success: { title: "7. And Ends in Success", color: "border-l-emerald-500" },
};

export default function BrandScriptPage() {
  const params = useParams<{ id: string }>();
  const [brandscript, setBrandscript] = useState<BrandScript | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadBrandscript();
  }, [params.id]);

  async function loadBrandscript() {
    const res = await fetch(`/api/projects/${params.id}/brandscript`);
    const data = await res.json();
    if (data?.content_json) {
      setBrandscript(data.content_json);
    }
    setLoading(false);
  }

  async function generateBrandscript() {
    setGenerating(true);
    const res = await fetch(`/api/projects/${params.id}/brandscript`, {
      method: "POST",
    });
    const data = await res.json();
    setBrandscript(data.content_json);
    setGenerating(false);
  }

  function renderValue(value: unknown): string {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.map((v, i) => `${i + 1}. ${v}`).join("\n");
    if (typeof value === "object" && value !== null) {
      return Object.entries(value)
        .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
        .join("\n");
    }
    return String(value);
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-text-muted">Loading...</div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">BrandScript</h1>
          <p className="text-text-secondary mt-1">
            Your StoryBrand 7-part messaging framework
          </p>
        </div>
        <button
          onClick={generateBrandscript}
          disabled={generating}
          className="px-5 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {generating
            ? "Generating..."
            : brandscript
              ? "Regenerate"
              : "Generate BrandScript"}
        </button>
      </div>

      {generating && (
        <div className="text-center py-20">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-text-secondary">
            Analyzing your discovery answers and building your BrandScript...
          </p>
          <p className="text-text-muted text-sm mt-1">This may take 15-30 seconds</p>
        </div>
      )}

      {!generating && !brandscript && (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-50 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            No BrandScript yet
          </h2>
          <p className="text-text-secondary mb-6">
            Complete the Discovery wizard first, then generate your BrandScript
          </p>
          <div className="flex gap-3 justify-center">
            <a
              href={`/project/${params.id}/discover`}
              className="px-5 py-2.5 border border-border text-text-secondary rounded-lg hover:bg-surface-tertiary transition-colors"
            >
              Go to Discovery
            </a>
            <button
              onClick={generateBrandscript}
              className="px-5 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
            >
              Generate Anyway
            </button>
          </div>
        </div>
      )}

      {!generating && brandscript && !brandscript.raw && (
        <div className="space-y-4">
          {Object.entries(SECTION_LABELS).map(([key, { title, color }]) => {
            const value = brandscript[key as keyof BrandScript];
            if (!value) return null;
            return (
              <div
                key={key}
                className={`bg-surface border border-border ${color} border-l-4 rounded-xl p-6`}
              >
                <h3 className="font-semibold text-text-primary mb-3">
                  {title}
                </h3>
                <div className="text-text-secondary text-sm leading-relaxed">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
                      ul: ({ children }) => <ul className="mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-2 space-y-1 list-decimal list-inside">{children}</ol>,
                      li: ({ children }) => <li className="flex gap-2"><span className="text-brand-400 shrink-0">&#8226;</span><span>{children}</span></li>,
                    }}
                  >
                    {renderValue(value)}
                  </ReactMarkdown>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!generating && brandscript?.raw && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-semibold text-text-primary mb-3">
            Generated BrandScript
          </h3>
          <div className="text-text-secondary text-sm leading-relaxed">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h2 className="text-xl font-semibold mt-6 mb-2 first:mt-0 text-text-primary">{children}</h2>,
                h2: ({ children }) => <h3 className="text-lg font-semibold mt-5 mb-2 text-text-primary">{children}</h3>,
                h3: ({ children }) => <h4 className="text-base font-medium mt-4 mb-1.5 text-brand-700">{children}</h4>,
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
                ul: ({ children }) => <ul className="mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="mb-3 space-y-1 list-decimal list-inside">{children}</ol>,
                li: ({ children }) => <li className="flex gap-2"><span className="text-brand-400 shrink-0">&#8226;</span><span>{children}</span></li>,
                hr: () => <hr className="my-4 border-border" />,
              }}
            >
              {brandscript.raw}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
