"use client";

import { useState, useEffect, useCallback } from "react";
import { StoryChat } from "./story-chat";
import { CoverageSidebar } from "./coverage-sidebar";
import type { CoverageResult } from "@/lib/coverage";

interface Message {
  role: "user" | "assistant";
  message: string;
  parsedFields?: Record<string, string> | null;
}

interface StorySessionProps {
  projectId: string;
}

export function StorySession({ projectId }: StorySessionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [coverage, setCoverage] = useState<CoverageResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [highlightedAreas, setHighlightedAreas] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    fetch(`/api/projects/${projectId}/story`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(
          data.messages.map(
            (m: { role: string; message: string; parsedFields: Record<string, string> | null }) => ({
              role: m.role as "user" | "assistant",
              message: m.message,
              parsedFields: m.parsedFields,
            })
          )
        );
        setCoverage(data.coverage);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  const findAffectedAreas = useCallback(
    (parsedFields: Record<string, string>) => {
      if (!coverage) return new Set<string>();
      const affected = new Set<string>();
      const keys = Object.keys(parsedFields);
      for (const area of coverage.areas) {
        if (area.area.keys.some((k) => keys.includes(k))) {
          affected.add(area.area.id);
        }
      }
      return affected;
    },
    [coverage]
  );

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || sending) return;

    const msg = chatInput;
    setChatInput("");
    setMessages((prev) => [...prev, { role: "user", message: msg }]);
    setSending(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/story`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          message: data.message,
          parsedFields: data.parsedFields,
        },
      ]);
      setCoverage(data.coverage);

      // Highlight affected areas briefly
      if (data.parsedFields && Object.keys(data.parsedFields).length > 0) {
        const affected = findAffectedAreas(data.parsedFields);
        setHighlightedAreas(affected);
        setTimeout(() => setHighlightedAreas(new Set()), 1500);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          message:
            "Sorry, something went wrong. Please try again.",
        },
      ]);
    }

    setSending(false);
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh)] items-center justify-center text-text-muted">
        Loading story session...
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh)]">
      <StoryChat
        messages={messages}
        sending={sending}
        chatInput={chatInput}
        onInputChange={setChatInput}
        onSend={handleSend}
      />
      <CoverageSidebar
        coverage={coverage}
        highlightedAreas={highlightedAreas}
        projectId={projectId}
      />
    </div>
  );
}
