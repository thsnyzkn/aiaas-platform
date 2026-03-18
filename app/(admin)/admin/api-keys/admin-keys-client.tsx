"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { maskApiKey } from "@/lib/apiKey";
import { InlineFeedback } from "@/app/components/inline-feedback";
import { StatusBadge } from "@/app/components/status-badge";
import { Button } from "@/app/components/button";

type AdminKey = {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  requestLimitPerMin: number;
  createdAt: Date | string;
  user: { email: string };
};

export function AdminKeysClient({ initialKeys }: { initialKeys: AdminKey[] }) {
  const router = useRouter();
  const [keys, setKeys] = useState(initialKeys);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkPending, setBulkPending] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    tone: "error" | "success";
    message: string;
  } | null>(null);

  const selectableIds = keys.filter((key) => key.isActive).map((key) => key.id);

  async function handleToggle(id: string) {
    setTogglingId(id);
    setStatus(null);

    try {
      const res = await fetch(`/api/admin/keys/${id}`, { method: "PATCH" });
      const json = await res.json();

      if (!res.ok) {
        setStatus({
          tone: "error",
          message: json.error?.message ?? "Failed to update API key.",
        });
        return;
      }

      setKeys((current) =>
        current.map((apiKey) => (apiKey.id === id ? json.data : apiKey))
      );
      setSelectedIds((current) => current.filter((value) => value !== id));
      setStatus({
        tone: "success",
        message: json.data.isActive
          ? "API key enabled."
          : "API key disabled.",
      });
    } catch {
      setStatus({ tone: "error", message: "Failed to update API key." });
    } finally {
      setTogglingId(null);
    }
  }

  function toggleSelection(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );
  }

  function toggleSelectAll() {
    setSelectedIds((current) =>
      current.length === selectableIds.length ? [] : selectableIds
    );
  }

  async function handleBulkDisable() {
    if (selectedIds.length === 0) return;

    const confirmed = window.confirm(
      `Disable ${selectedIds.length} selected API key(s)? This can interrupt active usage immediately.`
    );

    if (!confirmed) {
      return;
    }

    setBulkPending(true);
    setStatus(null);

    try {
      const res = await fetch("/api/admin/keys/bulk-disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const json = await res.json();

      if (!res.ok) {
        setStatus({
          tone: "error",
          message: json.error?.message ?? "Failed to disable selected keys.",
        });
        return;
      }

      const updatedIds = new Set<string>(json.data.ids);
      setKeys((current) =>
        current.map((apiKey) =>
          updatedIds.has(apiKey.id) ? { ...apiKey, isActive: false } : apiKey
        )
      );
      setSelectedIds([]);
      setStatus({
        tone: "success",
        message: `${json.data.ids.length} API key(s) disabled.`,
      });
    } catch {
      setStatus({ tone: "error", message: "Failed to disable selected keys." });
    } finally {
      setBulkPending(false);
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Key controls
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Disable keys individually or disable several active keys at once.
          </p>
        </div>
        <Button
          type="button"
          disabled={bulkPending || selectedIds.length === 0}
          onClick={handleBulkDisable}
          aria-busy={bulkPending}
        >
          {bulkPending ? "Disabling..." : `Disable selected (${selectedIds.length})`}
        </Button>
      </div>

      {status ? (
        <InlineFeedback tone={status.tone} message={status.message} />
      ) : (
        <div className="min-h-5" />
      )}

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
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-zinc-500 dark:text-zinc-400">Owner</dt>
                <dd className="text-right text-zinc-900 dark:text-zinc-100">{k.user.email}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-zinc-500 dark:text-zinc-400">Rate limit</dt>
                <dd className="text-right text-zinc-900 dark:text-zinc-100">{k.requestLimitPerMin}/min</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                <input
                  type="checkbox"
                  aria-label={`Select ${k.name}`}
                  checked={selectedIds.includes(k.id)}
                  disabled={!k.isActive}
                  onChange={() => toggleSelection(k.id)}
                  className="h-4 w-4 rounded border-zinc-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
                />
                Select
              </label>
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
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <caption className="sr-only">
              All API keys with owner, rate limit, status, bulk selection, and actions.
            </caption>
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/60">
              <tr>
                <th scope="col" className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    aria-label="Select all active API keys"
                    checked={
                      selectableIds.length > 0 &&
                      selectedIds.length === selectableIds.length
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
                  />
                </th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Name</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Key</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">User</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Rate limit</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {keys.map((k) => (
                <tr key={k.id} className="bg-white dark:bg-zinc-900/50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${k.name}`}
                      checked={selectedIds.includes(k.id)}
                      disabled={!k.isActive}
                      onChange={() => toggleSelection(k.id)}
                      className="h-4 w-4 rounded border-zinc-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{k.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">{maskApiKey(k.key)}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{k.user.email}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{k.requestLimitPerMin}/min</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      tone={k.isActive ? "success" : "error"}
                      label={k.isActive ? "Active" : "Disabled"}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
