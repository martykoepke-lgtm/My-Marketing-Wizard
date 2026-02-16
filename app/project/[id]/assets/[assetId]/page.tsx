"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";

interface Asset {
  id: string;
  asset_type: string;
  title: string;
  content: string;
  version: number;
  created_at: string;
}

interface Version {
  id: string;
  version: number;
  created_at: string;
}

interface Message {
  role: "user" | "assistant";
  message: string;
}

export default function AssetDetailPage() {
  const params = useParams<{ id: string; assetId: string }>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [conversations, setConversations] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [refining, setRefining] = useState(false);
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAsset();
  }, [params.id, params.assetId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations]);

  async function loadAsset() {
    const res = await fetch(
      `/api/projects/${params.id}/assets/${params.assetId}`
    );
    const data = await res.json();
    setAsset(data.asset);
    setVersions(data.versions);
    setConversations(data.conversations);
  }

  async function refine(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || refining) return;

    const msg = chatInput;
    setChatInput("");
    setConversations((prev) => [...prev, { role: "user", message: msg }]);
    setRefining(true);

    const res = await fetch(
      `/api/projects/${params.id}/assets/${params.assetId}/refine`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      }
    );
    const data = await res.json();
    setConversations((prev) => [
      ...prev,
      { role: "assistant", message: data.message },
    ]);
    setRefining(false);
  }

  function copyToClipboard() {
    if (!asset) return;
    navigator.clipboard.writeText(asset.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!asset) {
    return (
      <div className="p-8 text-center text-text-muted">Loading...</div>
    );
  }

  return (
    <div className="flex h-[calc(100vh)]">
      {/* Asset Content — Left Panel */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <a
                href={`/project/${params.id}/assets`}
                className="text-sm text-brand-600 hover:text-brand-700 mb-2 inline-block"
              >
                &larr; Back to Assets
              </a>
              <h1 className="text-2xl font-bold text-text-primary">
                {asset.title}
              </h1>
              <p className="text-sm text-text-muted mt-1">
                Version {asset.version} &middot;{" "}
                {new Date(asset.created_at + "Z").toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 text-sm border border-border text-text-secondary rounded-lg hover:bg-surface-tertiary transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              {versions.length > 1 && (
                <select
                  value={params.assetId}
                  onChange={(e) => {
                    window.location.href = `/project/${params.id}/assets/${e.target.value}`;
                  }}
                  className="px-3 py-2 text-sm border border-border rounded-lg bg-surface"
                >
                  {versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      v{v.version} —{" "}
                      {new Date(v.created_at + "Z").toLocaleDateString()}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-8">
            <div className="max-w-none text-text-primary leading-relaxed markdown-content">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold mt-8 mb-3 first:mt-0 text-text-primary border-b border-border pb-2">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold mt-7 mb-2 text-text-primary">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold mt-5 mb-2 text-brand-700">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-base font-medium mt-4 mb-1.5 text-text-secondary">
                      {children}
                    </h4>
                  ),
                  p: ({ children }) => (
                    <p className="mb-3 text-sm leading-relaxed text-text-secondary">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-text-primary">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-text-secondary">{children}</em>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-4 ml-1 space-y-1.5">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-4 ml-1 space-y-1.5 list-decimal list-inside">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm text-text-secondary flex gap-2">
                      <span className="text-brand-400 mt-1.5 shrink-0">&#8226;</span>
                      <span>{children}</span>
                    </li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-3 border-brand-300 bg-brand-50/50 pl-4 py-2 pr-3 my-4 rounded-r-lg text-sm italic text-text-secondary">
                      {children}
                    </blockquote>
                  ),
                  hr: () => <hr className="my-6 border-border" />,
                  code: ({ children }) => (
                    <code className="bg-surface-tertiary px-1.5 py-0.5 rounded text-xs font-mono text-brand-700">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-surface-tertiary border border-border rounded-lg p-4 my-4 overflow-x-auto text-xs">
                      {children}
                    </pre>
                  ),
                }}
              >
                {asset.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* Refinement Chat — Right Panel */}
      <div className="w-96 border-l border-border bg-surface flex flex-col">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="font-semibold text-text-primary text-sm">
            Refine This Asset
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Ask for changes, alternatives, or new angles
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {conversations.length === 0 && (
            <div className="text-center py-8 text-text-muted text-sm">
              <p className="mb-3">Try asking:</p>
              <div className="space-y-2">
                {[
                  "Make it shorter and punchier",
                  "Give me 3 alternative versions",
                  "Make the tone more conversational",
                  "Focus more on the emotional pain",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setChatInput(suggestion)}
                    className="block w-full text-left px-3 py-2 text-xs bg-surface-tertiary rounded-lg hover:bg-brand-50 hover:text-brand-600 transition-colors"
                  >
                    &ldquo;{suggestion}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          )}

          {conversations.map((msg, i) => (
            <div
              key={i}
              className={`rounded-lg p-3 text-sm ${
                msg.role === "user"
                  ? "bg-brand-50 text-brand-900 ml-8"
                  : "bg-surface-tertiary text-text-primary mr-4"
              }`}
            >
              {msg.role === "user" ? (
                <p className="whitespace-pre-line">{msg.message}</p>
              ) : (
                <div className="chat-markdown">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h3 className="font-semibold text-sm mt-3 mb-1 first:mt-0">{children}</h3>,
                      h2: ({ children }) => <h3 className="font-semibold text-sm mt-3 mb-1">{children}</h3>,
                      h3: ({ children }) => <h4 className="font-medium text-sm mt-2 mb-1">{children}</h4>,
                      p: ({ children }) => <p className="mb-2 last:mb-0 text-sm leading-relaxed">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      ul: ({ children }) => <ul className="mb-2 ml-3 space-y-0.5 list-disc list-outside">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-2 ml-3 space-y-0.5 list-decimal list-outside">{children}</ol>,
                      li: ({ children }) => <li className="text-sm">{children}</li>,
                      blockquote: ({ children }) => <blockquote className="border-l-2 border-brand-300 pl-2 my-2 text-xs italic">{children}</blockquote>,
                      hr: () => <hr className="my-2 border-border" />,
                    }}
                  >
                    {msg.message}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          ))}

          {refining && (
            <div className="bg-surface-tertiary rounded-lg p-3 mr-4">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <span className="w-4 h-4 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                Thinking...
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <form onSubmit={refine} className="p-4 border-t border-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="How should I change this?"
              className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              disabled={refining}
            />
            <button
              type="submit"
              disabled={refining || !chatInput.trim()}
              className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
