"use client";

import { useState, useEffect, useCallback } from "react";
import { DISCOVERY_STEPS } from "@/lib/discovery-steps";

interface WizardShellProps {
  projectId: string;
}

export function WizardShell({ projectId }: WizardShellProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/discover`)
      .then((r) => r.json())
      .then((data: Array<{ question_key: string; answer: string }>) => {
        const map: Record<string, string> = {};
        for (const row of data) {
          map[row.question_key] = row.answer;
        }
        setAnswers(map);
        setLoaded(true);
      });
  }, [projectId]);

  const saveStep = useCallback(
    async (stepNumber: number) => {
      const step = DISCOVERY_STEPS.find((s) => s.number === stepNumber);
      if (!step) return;

      const stepAnswers: Record<string, string> = {};
      for (const field of step.fields) {
        if (answers[field.key]) {
          stepAnswers[field.key] = answers[field.key];
        }
      }

      if (Object.keys(stepAnswers).length === 0) return;

      setSaving(true);
      await fetch(`/api/projects/${projectId}/discover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step_number: stepNumber,
          answers: stepAnswers,
        }),
      });
      setSaving(false);
    },
    [answers, projectId]
  );

  function updateAnswer(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  async function goNext() {
    await saveStep(currentStep);
    if (currentStep < DISCOVERY_STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  }

  async function goPrev() {
    await saveStep(currentStep);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  }

  const step = DISCOVERY_STEPS[currentStep - 1];

  if (!loaded) {
    return (
      <div className="p-8 text-center text-text-muted">
        Loading discovery...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-secondary">
            Step {currentStep} of {DISCOVERY_STEPS.length}
          </span>
          {saving && (
            <span className="text-xs text-brand-500">Saving...</span>
          )}
        </div>
        <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-300"
            style={{
              width: `${(currentStep / DISCOVERY_STEPS.length) * 100}%`,
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {DISCOVERY_STEPS.map((s) => (
            <button
              key={s.number}
              onClick={async () => {
                await saveStep(currentStep);
                setCurrentStep(s.number);
              }}
              className={`text-xs px-1 py-0.5 rounded transition-colors ${
                s.number === currentStep
                  ? "text-brand-600 font-medium"
                  : s.number < currentStep
                    ? "text-success"
                    : "text-text-muted"
              }`}
            >
              {s.number}
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div key={currentStep} className="wizard-step-enter">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-text-primary">{step.title}</h2>
          <p className="text-brand-600 font-medium mt-1">{step.subtitle}</p>
          <p className="text-text-secondary mt-2 text-sm">{step.description}</p>
        </div>

        <div className="space-y-6">
          {step.fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  value={answers[field.key] || ""}
                  onChange={(e) => updateAnswer(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={4}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y text-sm"
                />
              ) : (
                <input
                  type="text"
                  value={answers[field.key] || ""}
                  onChange={(e) => updateAnswer(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
        <button
          onClick={goPrev}
          disabled={currentStep === 1}
          className="px-5 py-2.5 text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => saveStep(currentStep)}
            className="px-5 py-2.5 border border-border text-text-secondary rounded-lg hover:bg-surface-tertiary transition-colors text-sm"
          >
            Save Progress
          </button>

          {currentStep < DISCOVERY_STEPS.length ? (
            <button
              onClick={goNext}
              className="px-6 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
            >
              Next Step
            </button>
          ) : (
            <a
              href={`/project/${projectId}/brandscript`}
              onClick={() => saveStep(currentStep)}
              className="px-6 py-2.5 bg-success text-white rounded-lg font-medium hover:opacity-90 transition-colors inline-block"
            >
              Generate BrandScript
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
