"use client";

import Link from "next/link";

interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  asset_count: number;
  answer_count: number;
  updated_at: string;
  onDelete: (id: string) => void;
}

export function ProjectCard({
  id,
  name,
  description,
  asset_count,
  answer_count,
  updated_at,
  onDelete,
}: ProjectCardProps) {
  const progress =
    answer_count === 0
      ? "Not started"
      : answer_count < 15
        ? "Discovery in progress"
        : "Discovery complete";

  return (
    <div className="bg-surface rounded-xl border border-border p-6 hover:border-brand-300 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-3">
        <Link href={`/project/${id}`} className="flex-1">
          <h3 className="font-semibold text-lg text-text-primary group-hover:text-brand-600 transition-colors">
            {name}
          </h3>
        </Link>
        <button
          onClick={() => onDelete(id)}
          className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-all p-1"
          title="Delete project"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </button>
      </div>

      {description && (
        <p className="text-sm text-text-secondary mb-4 line-clamp-2">
          {description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-text-muted">
        <span
          className={`px-2 py-1 rounded-full ${
            answer_count >= 15
              ? "bg-green-50 text-success"
              : answer_count > 0
                ? "bg-amber-50 text-warning"
                : "bg-gray-50 text-text-muted"
          }`}
        >
          {progress}
        </span>
        <span>{asset_count} assets</span>
        <span>
          {new Date(updated_at + "Z").toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
