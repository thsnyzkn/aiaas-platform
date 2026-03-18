"use client";

import { useState } from "react";
import { Button } from "@/app/components/button";

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
  const [requestError, setRequestError] = useState<string | null>(null);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!prompt.trim() || !selectedKey) return;

    setLoading(true);
    setResponse(null);
    setRequestError(null);

    try {
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
      if (!res.ok && !json.error) {
        setRequestError("Request failed.");
      }
    } catch {
      setRequestError("Request failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="space-y-2">
          <label
            htmlFor="playground-key"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            API key
          </label>
          <select
            id="playground-key"
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-zinc-800"
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
          <label
            htmlFor="playground-prompt"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Prompt
          </label>
          <textarea
            id="playground-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask the mock model anything..."
            rows={8}
            className="w-full resize-none rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-zinc-800"
          />
        </div>

        <div
          aria-live="polite"
          role="status"
          className="min-h-5 text-sm text-red-600 dark:text-red-400"
        >
          {requestError}
        </div>

        <Button
          type="submit"
          disabled={loading || !prompt.trim() || !selectedKey}
          aria-busy={loading}
          fullWidth
        >
          {loading ? "Sending..." : "Send request"}
        </Button>

        {keys.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Create an active API key before using the playground.
          </p>
        )}
      </form>

      <div
        aria-live="polite"
        className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Response
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Review the mock completion and any API errors here.
          </p>
        </div>
        <div className="min-h-72 overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-4 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950/40">
          {!response && !loading && !requestError && (
            <p className="text-zinc-400">Response will appear here.</p>
          )}
          {loading && <p className="text-zinc-400">Waiting for response...</p>}
          {response?.error && (
            <div className="space-y-2">
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
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
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
