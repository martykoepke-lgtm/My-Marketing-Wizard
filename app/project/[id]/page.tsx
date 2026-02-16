"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function ProjectOverview() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [answerCount, setAnswerCount] = useState(0);
  const [assetCount, setAssetCount] = useState(0);
  const [hasBrandscript, setHasBrandscript] = useState(false);
  const [storyStats, setStoryStats] = useState<{ messageCount: number; coverage: number } | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${params.id}`)
      .then((r) => r.json())
      .then(setProject);

    fetch(`/api/projects/${params.id}/discover`)
      .then((r) => r.json())
      .then((data: unknown[]) => setAnswerCount(data.length));

    fetch(`/api/projects/${params.id}/brandscript`)
      .then((r) => {
        if (r.ok) return r.json();
        return null;
      })
      .then((data) => {
        if (data && data.content_json) setHasBrandscript(true);
      })
      .catch(() => {});

    fetch(`/api/projects/${params.id}/assets`)
      .then((r) => r.json())
      .then((data: unknown[]) => setAssetCount(data.length))
      .catch(() => {});

    fetch(`/api/projects/${params.id}/story`)
      .then((r) => r.json())
      .then((data: { messages?: unknown[]; coverage?: { overallPercent: number } }) => {
        setStoryStats({
          messageCount: data.messages?.length || 0,
          coverage: data.coverage?.overallPercent || 0,
        });
      })
      .catch(() => {});
  }, [params.id]);

  if (!project) {
    return (
      <div className="p-8 text-center text-text-muted">Loading...</div>
    );
  }

  const cards = [
    {
      title: "Discovery",
      description:
        "Walk through 9 guided steps to uncover your brand's story, customer, and messaging foundations.",
      href: `/project/${params.id}/discover`,
      stat: `${answerCount} answers captured`,
      color: "bg-blue-50 text-brand-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
        </svg>
      ),
    },
    {
      title: "Story Session",
      description:
        "Tell your brand's story naturally in a conversation — AI extracts your messaging foundations as you talk.",
      href: `/project/${params.id}/story`,
      stat: storyStats
        ? storyStats.messageCount > 0
          ? `${storyStats.messageCount} messages, ${storyStats.coverage}% coverage`
          : "Not started yet"
        : "Conversational discovery",
      color: "bg-teal-50 text-teal-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      ),
    },
    {
      title: "BrandScript",
      description:
        "Generate your complete StoryBrand 7-part framework — the foundation for all your messaging.",
      href: `/project/${params.id}/brandscript`,
      stat: hasBrandscript ? "Generated" : "Not yet generated",
      color: "bg-purple-50 text-purple-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      title: "Asset Workshop",
      description:
        "Generate one-liners, origin stories, sound bites, landing pages, social content, emails, and more.",
      href: `/project/${params.id}/assets`,
      stat: `${assetCount} assets created`,
      color: "bg-amber-50 text-amber-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      ),
    },
    {
      title: "Import",
      description:
        "Paste content from other tools — competitor analysis, brand docs, customer research — and auto-fill discovery answers.",
      href: `/project/${params.id}/import`,
      stat: "AI-powered extraction",
      color: "bg-green-50 text-green-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">{project.name}</h1>
        {project.description && (
          <p className="text-text-secondary mt-1">{project.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-surface border border-border rounded-xl p-6 hover:border-brand-300 hover:shadow-md transition-all group"
          >
            <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-4`}>
              {card.icon}
            </div>
            <h3 className="font-semibold text-lg text-text-primary group-hover:text-brand-600 transition-colors">
              {card.title}
            </h3>
            <p className="text-text-secondary text-sm mt-1 mb-3">
              {card.description}
            </p>
            <span className="text-xs text-text-muted">{card.stat}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
