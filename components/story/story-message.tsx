"use client";

import ReactMarkdown from "react-markdown";

interface StoryMessageProps {
  role: "user" | "assistant";
  message: string;
  parsedFields?: Record<string, string> | null;
}

const FIELD_LABELS: Record<string, string> = {
  business_name: "Business Name",
  business_description: "Business Description",
  business_price: "Price",
  audience_primary: "Primary Audience",
  audience_secondary: "Secondary Audience",
  customer_desire: "Customer Desire",
  external_problem: "External Problem",
  internal_problem: "Internal Problem",
  philosophical_problem: "Philosophical Problem",
  villain: "The Villain",
  empathy_statement: "Empathy Statement",
  authority_credentials: "Authority",
  authority_testimonial: "Testimonial",
  plan_step_1: "Plan Step 1",
  plan_step_2: "Plan Step 2",
  plan_step_3: "Plan Step 3",
  plan_step_4: "Plan Step 4",
  failure_state: "Failure State",
  success_state: "Success State",
  origin_struggle: "Origin Struggle",
  origin_tool: "Origin Tool",
  origin_mission: "Mission",
  origin_dark_moment: "Dark Moment",
  differentiator: "Differentiator",
  main_objection: "Main Objection",
  objection_answer: "Objection Answer",
  timeline: "Timeline",
  guarantee: "Guarantee",
  platforms: "Platforms",
  cta_direct: "Direct CTA",
  cta_transitional: "Transitional CTA",
};

export function StoryMessage({ role, message, parsedFields }: StoryMessageProps) {
  const capturedKeys = parsedFields
    ? Object.keys(parsedFields).filter(
        (k) => typeof parsedFields[k] === "string" && parsedFields[k].trim()
      )
    : [];

  return (
    <div className="chat-message-enter">
      <div
        className={`rounded-xl p-4 text-sm ${
          role === "user"
            ? "bg-brand-50 text-brand-900 ml-16"
            : "bg-surface-tertiary text-text-primary mr-8"
        }`}
      >
        {role === "user" ? (
          <p className="whitespace-pre-line">{message}</p>
        ) : (
          <div className="story-markdown">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h3 className="font-semibold text-sm mt-3 mb-1 first:mt-0">
                    {children}
                  </h3>
                ),
                h2: ({ children }) => (
                  <h3 className="font-semibold text-sm mt-3 mb-1">
                    {children}
                  </h3>
                ),
                h3: ({ children }) => (
                  <h4 className="font-medium text-sm mt-2 mb-1">{children}</h4>
                ),
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 text-sm leading-relaxed">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-text-secondary">{children}</em>
                ),
                ul: ({ children }) => (
                  <ul className="mb-2 ml-3 space-y-0.5 list-disc list-outside">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-2 ml-3 space-y-0.5 list-decimal list-outside">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-sm">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-brand-300 pl-2 my-2 text-xs italic">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {role === "assistant" && capturedKeys.length > 0 && (
        <div className="mt-1.5 ml-2 flex flex-wrap gap-1">
          <span className="text-[10px] text-text-muted">Captured:</span>
          {capturedKeys.map((key) => (
            <span
              key={key}
              className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 rounded-full font-medium"
            >
              {FIELD_LABELS[key] || key}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
