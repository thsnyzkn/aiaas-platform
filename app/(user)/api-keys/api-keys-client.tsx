"use client";

import { useState } from "react";
import { maskApiKey } from "@/lib/apiKey";
import { InlineFeedback } from "@/app/components/inline-feedback";
import { StatusBadge } from "@/app/components/status-badge";
import { Button } from "@/app/components/button";
import { EmptyState } from "@/app/components/empty-state";

type ApiKey = {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  requestLimitPerMin: number;
  createdAt: Date | string;
};

export function ApiKeysClient({ initialKeys }: { initialKeys: ApiKey[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [requestLimitPerMin, setRequestLimitPerMin] = useState("10");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    tone: "error" | "success";
    message: string;
  } | null>(null);

  async function handleCreate(e: React.SubmitEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setStatus(null);

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          requestLimitPerMin: Number(requestLimitPerMin),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setStatus({
          tone: "error",
          message: json.error?.message ?? "Failed to create API key.",
        });
        return;
      }

      setKeys((current) => [json.data, ...current]);
      setName("");
      setRequestLimitPerMin("10");
      setStatus({ tone: "success", message: "API key created." });
    } catch {
      setStatus({ tone: "error", message: "Failed to create API key." });
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(id: string) {
    setTogglingId(id);
    setStatus(null);

    try {
      const res = await fetch(`/api/keys/${id}`, { method: "PATCH" });
      const json = await res.json();

      if (!res.ok) {
        setStatus({
          tone: "error",
          message: json.error?.message ?? "Failed to update API key.",
        });
        return;
      }

      setKeys((current) =>
        current.map((apiKey) => (apiKey.id === id ? json.data : apiKey)),
      );
      setStatus({
        tone: "success",
        message: json.data.isActive ? "API key enabled." : "API key disabled.",
      });
    } catch {
      setStatus({ tone: "error", message: "Failed to update API key." });
    } finally {
      setTogglingId(null);
    }
  }

  async function handleCopy(key: string, id: string) {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedId(id);
      setStatus({ tone: "success", message: "API key copied." });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setStatus({ tone: "error", message: "Clipboard copy failed." });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-3 md:flex-row md:items-center"
        >
          <div className="flex-1 space-y-2">
            <label
              htmlFor="api-key-name"
              className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              New key name
            </label>
            <input
              id="api-key-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Production, QA, Personal project"
              aria-describedby="api-key-name-hint"
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-zinc-800"
            />
            <p
              id="api-key-name-hint"
              className="text-sm text-zinc-500 dark:text-zinc-400"
            >
              Choose a label that helps you identify where the key is used.
            </p>
          </div>
          <div className="space-y-2 md:w-52 md:self-start">
            <label
              htmlFor="api-key-rate-limit"
              className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              Requests per minute
            </label>
            <select
              id="api-key-rate-limit"
              value={requestLimitPerMin}
              onChange={(e) => setRequestLimitPerMin(e.target.value)}
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-zinc-800"
            >
              <option value="10">10 / min</option>
              <option value="30">30 / min</option>
              <option value="60">60 / min</option>
              <option value="120">120 / min</option>
            </select>
          </div>
          <Button
            type="submit"
            disabled={creating || !name.trim()}
            aria-busy={creating}
          >
            {creating ? "Creating..." : "Create key"}
          </Button>
        </form>

        {status ? (
          <InlineFeedback
            tone={status.tone}
            message={status.message}
            className="mt-3"
          />
        ) : (
          <div className="mt-3 min-h-5" />
        )}
      </div>

      {keys.length === 0 ? (
        <EmptyState
          title="No API keys yet"
          description="Create a key to start calling the AI endpoint and using the playground."
        />
      ) : (
        <>
          <div className="grid gap-4 md:hidden">
            {keys.map((k) => (
              <article
                key={k.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                      {k.name}
                    </h3>
                    <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                      {maskApiKey(k.key)}
                    </p>
                  </div>
                  <StatusBadge
                    tone={k.isActive ? "success" : "error"}
                    label={k.isActive ? "Active" : "Disabled"}
                  />
                </div>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                  Rate limit: {k.requestLimitPerMin}/min
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    aria-label={`Copy API key for ${k.name}`}
                    onClick={() => handleCopy(k.key, k.id)}
                    variant="secondary"
                    size="sm"
                  >
                    {copiedId === k.id ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    type="button"
                    aria-label={`${k.isActive ? "Disable" : "Enable"} API key ${k.name}`}
                    disabled={togglingId === k.id}
                    onClick={() => handleToggle(k.id)}
                    variant={k.isActive ? "destructive" : "success"}
                    size="sm"
                  >
                    {togglingId === k.id
                      ? "Saving..."
                      : k.isActive
                        ? "Disable"
                        : "Enable"}
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <caption className="sr-only">
                  Your API keys with rate limits, status, and key actions.
                </caption>
                <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/60">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400"
                    >
                      Key
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400"
                    >
                      Rate limit
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {keys.map((k) => (
                    <tr key={k.id} className="bg-white dark:bg-zinc-900/50">
                      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                        {k.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                        {maskApiKey(k.key)}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {k.requestLimitPerMin}/min
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          tone={k.isActive ? "success" : "error"}
                          label={k.isActive ? "Active" : "Disabled"}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            aria-label={`Copy API key for ${k.name}`}
                            onClick={() => handleCopy(k.key, k.id)}
                            variant="secondary"
                            size="sm"
                          >
                            {copiedId === k.id ? "Copied" : "Copy"}
                          </Button>
                          <Button
                            type="button"
                            disabled={togglingId === k.id}
                            aria-label={`${k.isActive ? "Disable" : "Enable"} API key ${k.name}`}
                            onClick={() => handleToggle(k.id)}
                            variant={k.isActive ? "destructive" : "success"}
                            size="sm"
                          >
                            {togglingId === k.id
                              ? "Saving..."
                              : k.isActive
                                ? "Disable"
                                : "Enable"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
