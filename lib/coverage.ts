import { DISCOVERY_STEPS } from "./discovery-steps";

export const KEY_TO_STEP: Record<string, number> = {
  business_name: 1,
  business_description: 1,
  business_price: 1,
  audience_primary: 2,
  audience_secondary: 2,
  customer_desire: 2,
  external_problem: 3,
  internal_problem: 3,
  philosophical_problem: 3,
  villain: 3,
  empathy_statement: 4,
  authority_credentials: 4,
  authority_testimonial: 4,
  plan_step_1: 5,
  plan_step_2: 5,
  plan_step_3: 5,
  plan_step_4: 5,
  failure_state: 6,
  success_state: 6,
  origin_struggle: 7,
  origin_tool: 7,
  origin_mission: 7,
  origin_dark_moment: 7,
  differentiator: 8,
  main_objection: 8,
  objection_answer: 8,
  timeline: 9,
  guarantee: 9,
  platforms: 9,
  cta_direct: 9,
  cta_transitional: 9,
};

export const ALL_QUESTION_KEYS: string[] = DISCOVERY_STEPS.flatMap((step) =>
  step.fields.map((f) => f.key)
);

export interface CoverageArea {
  id: string;
  label: string;
  keys: string[];
  requiredKeys: string[];
}

export const COVERAGE_AREAS: CoverageArea[] = [
  {
    id: "business",
    label: "The Business",
    keys: ["business_name", "business_description", "business_price"],
    requiredKeys: ["business_name", "business_description"],
  },
  {
    id: "customer",
    label: "The Customer",
    keys: ["audience_primary", "audience_secondary", "customer_desire"],
    requiredKeys: ["audience_primary", "customer_desire"],
  },
  {
    id: "problem",
    label: "The Problem",
    keys: [
      "external_problem",
      "internal_problem",
      "philosophical_problem",
      "villain",
    ],
    requiredKeys: ["external_problem", "internal_problem"],
  },
  {
    id: "guide",
    label: "The Guide",
    keys: [
      "empathy_statement",
      "authority_credentials",
      "authority_testimonial",
    ],
    requiredKeys: ["empathy_statement", "authority_credentials"],
  },
  {
    id: "plan",
    label: "The Plan",
    keys: ["plan_step_1", "plan_step_2", "plan_step_3", "plan_step_4"],
    requiredKeys: ["plan_step_1", "plan_step_2", "plan_step_3"],
  },
  {
    id: "stakes",
    label: "The Stakes",
    keys: ["failure_state", "success_state"],
    requiredKeys: ["failure_state", "success_state"],
  },
  {
    id: "origin",
    label: "Your Story",
    keys: [
      "origin_struggle",
      "origin_tool",
      "origin_mission",
      "origin_dark_moment",
    ],
    requiredKeys: ["origin_struggle", "origin_mission"],
  },
  {
    id: "differentiator",
    label: "Differentiator",
    keys: ["differentiator", "main_objection", "objection_answer"],
    requiredKeys: ["differentiator", "main_objection"],
  },
  {
    id: "details",
    label: "Details",
    keys: ["timeline", "guarantee", "platforms", "cta_direct", "cta_transitional"],
    requiredKeys: ["cta_direct"],
  },
];

export interface CoverageAreaResult {
  area: CoverageArea;
  filledKeys: string[];
  missingKeys: string[];
  missingRequiredKeys: string[];
  percentFilled: number;
  isComplete: boolean;
}

export interface CoverageResult {
  areas: CoverageAreaResult[];
  totalFilled: number;
  totalKeys: number;
  totalRequired: number;
  totalRequiredFilled: number;
  overallPercent: number;
  isReadyForBrandscript: boolean;
}

export function computeCoverage(
  filledAnswers: Record<string, string>
): CoverageResult {
  const areas = COVERAGE_AREAS.map((area) => {
    const filledKeys = area.keys.filter(
      (k) => filledAnswers[k] && filledAnswers[k].trim().length > 0
    );
    const missingKeys = area.keys.filter(
      (k) => !filledAnswers[k] || filledAnswers[k].trim().length === 0
    );
    const missingRequiredKeys = area.requiredKeys.filter(
      (k) => !filledAnswers[k] || filledAnswers[k].trim().length === 0
    );
    const percentFilled =
      area.keys.length > 0
        ? Math.round((filledKeys.length / area.keys.length) * 100)
        : 100;
    const isComplete = missingRequiredKeys.length === 0;
    return {
      area,
      filledKeys,
      missingKeys,
      missingRequiredKeys,
      percentFilled,
      isComplete,
    };
  });

  const totalKeys = ALL_QUESTION_KEYS.length;
  const totalFilled = ALL_QUESTION_KEYS.filter(
    (k) => filledAnswers[k] && filledAnswers[k].trim().length > 0
  ).length;

  const allRequired = COVERAGE_AREAS.flatMap((a) => a.requiredKeys);
  const totalRequired = allRequired.length;
  const totalRequiredFilled = allRequired.filter(
    (k) => filledAnswers[k] && filledAnswers[k].trim().length > 0
  ).length;

  return {
    areas,
    totalFilled,
    totalKeys,
    totalRequired,
    totalRequiredFilled,
    overallPercent:
      totalKeys > 0 ? Math.round((totalFilled / totalKeys) * 100) : 0,
    isReadyForBrandscript: areas.every((a) => a.isComplete),
  };
}

export function formatCoverageGaps(coverage: CoverageResult): string {
  const lines: string[] = [];
  for (const item of coverage.areas) {
    if (item.missingRequiredKeys.length > 0) {
      lines.push(
        `- ${item.area.label}: MISSING required fields: ${item.missingRequiredKeys.join(", ")}`
      );
    } else if (item.missingKeys.length > 0) {
      lines.push(
        `- ${item.area.label}: Complete (optional missing: ${item.missingKeys.join(", ")})`
      );
    } else {
      lines.push(`- ${item.area.label}: COMPLETE`);
    }
  }
  return lines.join("\n");
}
