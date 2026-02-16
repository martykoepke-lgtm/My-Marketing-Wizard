"use client";

import { useRef, useEffect } from "react";
import { StoryMessage } from "./story-message";

interface Message {
  role: "user" | "assistant";
  message: string;
  parsedFields?: Record<string, string> | null;
}

interface StoryChatProps {
  messages: Message[];
  sending: boolean;
  chatInput: string;
  onInputChange: (value: string) => void;
  onSend: (e: React.FormEvent) => void;
}

const STARTERS = [
  "Tell me about your business and the people you help.",
  "I'd like to paste some content about my brand for you to analyze.",
  "I'm not sure where to start — ask me questions.",
  "Let me tell you the story of how this all began...",
];

export function StoryChat({
  messages,
  sending,
  chatInput,
  onInputChange,
  onSend,
}: StoryChatProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.length === 0 && !sending && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-50 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-teal-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Story Session
              </h2>
              <p className="text-text-secondary mb-8 max-w-md mx-auto">
                Tell your brand's story naturally. I'll extract your messaging
                foundations as we talk — no forms, no steps, just conversation.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                {STARTERS.map((starter) => (
                  <button
                    key={starter}
                    onClick={() => onInputChange(starter)}
                    className="text-left px-4 py-3 text-sm bg-surface border border-border rounded-xl hover:border-brand-300 hover:bg-brand-50/50 transition-all text-text-secondary"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <StoryMessage
              key={i}
              role={msg.role}
              message={msg.message}
              parsedFields={msg.parsedFields}
            />
          ))}

          {sending && (
            <div className="bg-surface-tertiary rounded-xl p-4 mr-8 chat-message-enter">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <span className="w-4 h-4 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                Listening and extracting...
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      <form onSubmit={onSend} className="p-4 border-t border-border bg-surface">
        <div className="max-w-2xl mx-auto flex gap-2">
          <textarea
            value={chatInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend(e);
              }
            }}
            placeholder="Tell me about your business, your customers, your story..."
            rows={2}
            className="flex-1 px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm resize-none"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !chatInput.trim()}
            className="px-5 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors self-end"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
