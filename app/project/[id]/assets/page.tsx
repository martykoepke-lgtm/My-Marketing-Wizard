"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Asset {
  id: string;
  asset_type: string;
  title: string;
  content: string;
  version: number;
  created_at: string;
}

const ASSET_TYPES = [
  {
    type: "one-liner",
    title: "One-Liners",
    description: "Problem → Product → Result elevator pitches for each audience",
    icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z",
    color: "bg-blue-50 text-blue-600",
  },
  {
    type: "origin-story-short",
    title: "Origin Story (Short)",
    description: "4-part backstory: Hole → Tool → Mission → Transformation",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    color: "bg-purple-50 text-purple-600",
  },
  {
    type: "origin-story-extended",
    title: "Origin Story (Extended)",
    description: "Full 8-part narrative with Dark Knight moment and Miracle",
    icon: "M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    type: "elevator-pitch",
    title: "Elevator Pitch",
    description: "30-60 second spoken pitch with delivery notes",
    icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5",
    color: "bg-teal-50 text-teal-600",
  },
  {
    type: "sound-bites",
    title: "Sound Bites",
    description: "10 short, vivid, repeatable phrases for instant recall",
    icon: "M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z",
    color: "bg-rose-50 text-rose-600",
  },
  {
    type: "landing-page",
    title: "Landing Page Copy",
    description: "Full 10-section landing page with headlines, copy, and CTAs",
    icon: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418",
    color: "bg-cyan-50 text-cyan-600",
  },
  {
    type: "social-media",
    title: "Social Media Series",
    description: "6-post content series attacking different messaging angles",
    icon: "M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z",
    color: "bg-pink-50 text-pink-600",
  },
  {
    type: "cold-email",
    title: "Cold Email + Follow-ups",
    description: "5-email outreach sequence from empathy to urgency",
    icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
    color: "bg-orange-50 text-orange-600",
  },
  {
    type: "pitch-deck",
    title: "Pitch Deck Outline",
    description: "Slide-by-slide content: Problem → Deeper → Solution → Results",
    icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6",
    color: "bg-amber-50 text-amber-600",
  },
  {
    type: "executive-brief",
    title: "Executive Brief",
    description: "Formal summary: Problem, Solution, Outcomes, Investment, Risk",
    icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z",
    color: "bg-slate-50 text-slate-600",
  },
];

export default function AssetsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [generating, setGenerating] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssets();
  }, [params.id]);

  async function loadAssets() {
    const res = await fetch(`/api/projects/${params.id}/assets`);
    const data = await res.json();
    setAssets(data);
    setLoading(false);
  }

  async function generateAsset(assetType: string) {
    setGenerating(assetType);
    const res = await fetch(`/api/projects/${params.id}/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asset_type: assetType }),
    });
    const data = await res.json();
    setGenerating(null);
    router.push(`/project/${params.id}/assets/${data.id}`);
  }

  function getLatestAsset(assetType: string): Asset | undefined {
    return assets.find((a) => a.asset_type === assetType);
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-text-muted">Loading...</div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Asset Workshop</h1>
        <p className="text-text-secondary mt-1">
          Generate marketing assets powered by your BrandScript
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ASSET_TYPES.map((at) => {
          const existing = getLatestAsset(at.type);
          const isGenerating = generating === at.type;

          return (
            <div
              key={at.type}
              className="bg-surface border border-border rounded-xl p-6 hover:border-brand-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-lg ${at.color} flex items-center justify-center shrink-0`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d={at.icon}
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary">
                    {at.title}
                  </h3>
                  <p className="text-text-secondary text-sm mt-1">
                    {at.description}
                  </p>

                  <div className="flex items-center gap-2 mt-4">
                    {existing ? (
                      <>
                        <a
                          href={`/project/${params.id}/assets/${existing.id}`}
                          className="px-4 py-2 text-sm border border-border text-text-secondary rounded-lg hover:bg-surface-tertiary transition-colors"
                        >
                          View Latest
                        </a>
                        <button
                          onClick={() => generateAsset(at.type)}
                          disabled={isGenerating}
                          className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
                        >
                          {isGenerating ? "Generating..." : "New Version"}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => generateAsset(at.type)}
                        disabled={isGenerating}
                        className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
                      >
                        {isGenerating ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating...
                          </span>
                        ) : (
                          "Generate"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
