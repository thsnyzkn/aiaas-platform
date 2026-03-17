"use client";

import { useState } from "react";

type KeyOption = { id: string; key: string; name: string };

type CompletionResponse = {
  data?: {
    id: string;
    model: string;
    choices: { message: { role: string; content: string } }[];
  };
  error?: { code: string; message: string; retryAfter?: number };
};

export function PlaygroundClient({ keys }: { keys: KeyOption[] }) {
  const [selectedKey, setSelectedKey] = useState(keys[0]?.key ?? "");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<CompletionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!prompt.trim() || !selectedKey) return;

    setLoading(true);
    setResponse(null);

    const res = await fetch("/api/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": selectedKey,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt.trim() }],
      }),
    });

    const json = await res.json();
    setResponse(json);
    setLoading(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            API Key
          </label>
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {keys.length === 0 && <option value="">No active keys</option>}
            {keys.map((k) => (
              <option key={k.id} value={k.key}>
                {k.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt..."
            rows={6}
            className="w-full resize-none rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !prompt.trim() || !selectedKey}
          className="w-full rounded-md bg-zinc-900 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? "Sending..." : "Send Request"}
        </button>
      </form>

      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Response
        </p>
        <div className="min-h-60 rounded-md border border-zinc-300 bg-zinc-50 p-4 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-800/50">
          {!response && !loading && (
            <p className="text-zinc-400">Response will appear here...</p>
          )}
          {loading && <p className="text-zinc-400">Loading...</p>}
          {response?.error && (
            <div className="space-y-1">
              <p className="font-semibold text-red-600 dark:text-red-400">
                {response.error.code}
              </p>
              <p className="text-zinc-600 dark:text-zinc-400">
                {response.error.message}
              </p>
              {response.error.retryAfter && (
                <p className="text-zinc-500">
                  Retry after: {response.error.retryAfter}s
                </p>
              )}
            </div>
          )}
          {response?.data && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>{response.data.model}</span>
                <span>·</span>
                <span>{response.data.id}</span>
              </div>
              <p className="whitespace-pre-wrap text-zinc-900 dark:text-zinc-100">
                {response.data.choices[0]?.message.content}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
