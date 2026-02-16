"use client";

import type { CoverageResult } from "@/lib/coverage";
import { CoverageAreaRow } from "./coverage-area-row";

interface CoverageSidebarProps {
  coverage: CoverageResult | null;
  highlightedAreas: Set<string>;
  projectId: string;
}

export function CoverageSidebar({
  coverage,
  highlightedAreas,
  projectId,
}: CoverageSidebarProps) {
  if (!coverage) {
    return (
      <div className="w-80 border-l border-border bg-surface flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="font-semibold text-text-primary text-sm">
            Story Coverage
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-border bg-surface flex flex-col shrink-0">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="font-semibold text-text-primary text-sm">
          Story Coverage
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-2 bg-surface-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${coverage.overallPercent}%` }}
            />
          </div>
          <span className="text-xs font-medium text-text-secondary">
            {coverage.overallPercent}%
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-1">
        {coverage.areas.map((item) => (
          <CoverageAreaRow
            key={item.area.id}
            item={item}
            highlight={highlightedAreas.has(item.area.id)}
          />
        ))}
      </div>

      <div className="px-4 py-3 border-t border-border">
        <div className="text-xs text-text-muted mb-2">
          {coverage.totalFilled} of {coverage.totalKeys} fields captured
          <br />
          {coverage.totalRequiredFilled} of {coverage.totalRequired} core fields
          complete
        </div>

        {coverage.isReadyForBrandscript ? (
          <a
            href={`/project/${projectId}/brandscript`}
            className="block w-full text-center px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Generate BrandScript
          </a>
        ) : (
          <div className="text-xs text-text-muted italic">
            Keep telling your story to unlock BrandScript generation
          </div>
        )}
      </div>
    </div>
  );
}
